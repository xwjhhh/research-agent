'''Local FastAPI service for the literature library.'''

from __future__ import annotations

import json
import os
import re
import asyncio
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

try:
    from .paper_adapter import AnalysisAdapterError, PaperQACompatibleAdapter
    from .prompts import ANALYSIS_SECTION_KEYS, ANALYSIS_SECTION_LABELS
except ImportError:
    from paper_adapter import AnalysisAdapterError, PaperQACompatibleAdapter
    from prompts import ANALYSIS_SECTION_KEYS, ANALYSIS_SECTION_LABELS


if load_dotenv:
    load_dotenv(Path(__file__).with_name('.env'))

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv('REBIRTH_DATA_DIR', str(ROOT / '1_find_paper' / 'data'))).resolve()
PAPERS_DIR = DATA_DIR / 'papers'
TASKS_DIR = DATA_DIR / 'agent_tasks'
DATA_DIR.mkdir(parents=True, exist_ok=True)
PAPERS_DIR.mkdir(parents=True, exist_ok=True)
TASKS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title='Rebirth Literature API', version='0.1.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])

TASK_CONCURRENCY = max(2, min(int(os.getenv('AGENT_CONCURRENCY', '3')), 4))
_task_queue: asyncio.Queue[str] = asyncio.Queue()
_task_workers: list[asyncio.Task[Any]] = []
_runtime_agent_config: dict[str, str] = {}

SUPPORTED_AGENT_PROTOCOLS = {'responses', 'chat_completions', 'codex', 'codex_cli'}


def _agent_config() -> dict[str, str]:
    key_env = os.getenv('LLM_API_KEY_ENV', '').strip()
    configured_key = os.getenv('LLM_API_KEY') or (os.getenv(key_env) if key_env else '') or os.getenv('OPENAI_API_KEY', '')
    values = {
        'protocol': os.getenv('LLM_API_PROTOCOL', 'chat_completions').strip().lower(),
        'api_base_url': os.getenv('LLM_API_BASE_URL', 'https://api.openai.com/v1').strip(),
        'model': os.getenv('LLM_MODEL', 'gpt-4o-mini').strip(),
        'api_key': configured_key,
        'codex_executable': os.getenv('CODEX_EXECUTABLE', 'codex').strip() or 'codex',
        'codex_model': os.getenv('CODEX_MODEL', '').strip(),
    }
    values.update(_runtime_agent_config)
    return values


def _public_agent_config() -> dict[str, Any]:
    config = _agent_config()
    return {
        'protocol': config['protocol'],
        'api_base_url': config['api_base_url'],
        'model': config['model'],
        'codex_executable': config['codex_executable'],
        'codex_model': config['codex_model'],
        'api_key_configured': bool(config['api_key']),
        'api_key_source': 'browser' if 'api_key' in _runtime_agent_config else ('environment' if config['api_key'] else 'codex-login'),
        'runtime_only': bool(_runtime_agent_config),
    }


def _safe_name(value: str) -> str:
    value = Path(value or 'paper.pdf').name
    value = re.sub(r'[^0-9A-Za-z._-]+', '_', value).strip('._')
    return value or 'paper.pdf'


def _read_record(paper_id: str) -> dict[str, Any]:
    record_path = PAPERS_DIR / paper_id / 'paper.json'
    if not record_path.exists():
        raise HTTPException(status_code=404, detail='文献记录不存在')
    try:
        return json.loads(record_path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f'文献记录损坏：{exc}') from exc


def _write_json(path: Path, value: Any) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2), encoding='utf-8')


def _public_record(record: dict[str, Any]) -> dict[str, Any]:
    output = dict(record)
    output.pop('document_path', None)
    output.pop('directory', None)
    output.pop('error', None)
    return output


class BatchTaskRequest(BaseModel):
    paper_ids: list[str] = Field(default_factory=list)


class SectionUpdateRequest(BaseModel):
    content: str = ''
    base_revision: int | None = None


class SuggestionRequest(BaseModel):
    instruction: str = ''
    base_revision: int = 0


class SuggestionApplyRequest(BaseModel):
    expected_revision: int | None = None


class AgentConfigRequest(BaseModel):
    protocol: str = ''
    api_base_url: str = ''
    model: str = ''
    api_key: str | None = None
    clear_api_key: bool = False
    codex_executable: str = ''
    codex_model: str = ''


def _sections_path(record: dict[str, Any]) -> Path:
    return Path(record['directory']) / 'sections.json'


def _analysis_section_content(analysis: dict[str, Any], section: str) -> str:
    if section == 'overview':
        parts = [analysis.get('summary', ''), analysis.get('abstract_zh', '')]
        return '\n\n'.join(str(item).strip() for item in parts if item)
    value = analysis.get(section)
    if value in (None, '', [], {}):
        return ''
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False, indent=2)


def _load_sections(record: dict[str, Any]) -> dict[str, dict[str, Any]]:
    path = _sections_path(record)
    sections: dict[str, dict[str, Any]] = {}
    if path.exists():
        try:
            raw = json.loads(path.read_text(encoding='utf-8'))
            if isinstance(raw, dict):
                sections = raw
        except (OSError, json.JSONDecodeError):
            sections = {}
    analysis = record.get('analysis') or {}
    changed = False
    for key in ANALYSIS_SECTION_KEYS:
        item = sections.get(key)
        if not isinstance(item, dict):
            item = {}
            sections[key] = item
            changed = True
        if 'content' not in item:
            item['content'] = _analysis_section_content(analysis, key)
            changed = True
        item.setdefault('paper_id', record['id'])
        item.setdefault('section', key)
        item.setdefault('label', ANALYSIS_SECTION_LABELS[key])
        item.setdefault('revision', 0)
        item.setdefault('updated_at', '')
        item.setdefault('source', 'analysis' if item['content'] else 'empty')
    if changed:
        _write_json(path, sections)
    return sections


def _public_sections(record: dict[str, Any]) -> dict[str, dict[str, Any]]:
    return _load_sections(record)


def _task_path(task_id: str) -> Path:
    return TASKS_DIR / f'{task_id}.json'


def _write_task(task: dict[str, Any]) -> None:
    _write_json(_task_path(task['id']), task)


def _read_task(task_id: str) -> dict[str, Any]:
    path = _task_path(task_id)
    if not path.exists():
        raise HTTPException(status_code=404, detail='Agent 任务不存在')
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=500, detail=f'Agent 任务损坏：{exc}') from exc


def _public_task(task: dict[str, Any]) -> dict[str, Any]:
    return {key: task.get(key) for key in ('id', 'paper_id', 'section', 'section_label', 'operation', 'status', 'result', 'base_revision', 'auto_applied', 'suggestion_available', 'error', 'created_at', 'updated_at')}


def _task_records(paper_ids: set[str] | None = None) -> list[dict[str, Any]]:
    records: list[dict[str, Any]] = []
    for path in TASKS_DIR.glob('*.json'):
        try:
            task = json.loads(path.read_text(encoding='utf-8'))
        except (OSError, json.JSONDecodeError):
            continue
        if paper_ids is None or task.get('paper_id') in paper_ids:
            records.append(task)
    return sorted(records, key=lambda item: item.get('created_at', ''), reverse=True)


def _update_paper_status(record: dict[str, Any]) -> None:
    sections = _load_sections(record)
    tasks = _task_records({record['id']})
    has_active = any(task.get('status') in {'queued', 'running'} for task in tasks)
    has_content = all(str(sections[key].get('content', '')).strip() for key in ANALYSIS_SECTION_KEYS)
    if has_active:
        record['status'] = 'analyzing'
    elif has_content:
        record['status'] = 'analyzed'
    elif record.get('status') == 'analyzing':
        record['status'] = 'pending'
    _write_json(Path(record['directory']) / 'paper.json', record)


async def _run_agent_task(task_id: str) -> None:
    task = _read_task(task_id)
    task['status'] = 'running'
    task['updated_at'] = datetime.now().isoformat(timespec='seconds')
    _write_task(task)
    try:
        record = _read_record(task['paper_id'])
        document_path = Path(record['document_path']) if record.get('document_path') else None
        if not document_path or not document_path.exists():
            raise AnalysisAdapterError('当前记录没有可分析的 PDF。请重新导入 PDF，或使用可下载 PDF 的 URL。')
        adapter = PaperQACompatibleAdapter(DATA_DIR, config=_agent_config())
        result = await adapter.analyze_section(document_path, record.get('pdfName') or record.get('title', 'paper'), task['section'], task.get('source_content', ''), task.get('instruction', ''), record.get('source', ''))
        sections = _load_sections(record)
        current = sections[task['section']]
        task['result'] = result
        task['auto_applied'] = False
        task['suggestion_available'] = True
        if task['operation'] == 'generate' and current.get('revision', 0) == task.get('base_revision', 0) and not str(current.get('content', '')).strip():
            current['content'] = result
            current['revision'] = int(current.get('revision', 0)) + 1
            current['updated_at'] = datetime.now().isoformat(timespec='seconds')
            current['source'] = 'agent'
            _write_json(_sections_path(record), sections)
            task['auto_applied'] = True
            task['suggestion_available'] = False
        task['status'] = 'completed'
        task['updated_at'] = datetime.now().isoformat(timespec='seconds')
        _write_task(task)
        _update_paper_status(record)
    except Exception as exc:
        task['status'] = 'failed'
        task['error'] = str(exc)
        task['updated_at'] = datetime.now().isoformat(timespec='seconds')
        _write_task(task)
        try:
            _update_paper_status(_read_record(task['paper_id']))
        except HTTPException:
            pass


async def _agent_worker() -> None:
    while True:
        task_id = await _task_queue.get()
        try:
            await _run_agent_task(task_id)
        finally:
            _task_queue.task_done()


@app.on_event('startup')
async def start_agent_workers() -> None:
    if _task_workers:
        return
    _task_workers.extend(asyncio.create_task(_agent_worker()) for _ in range(TASK_CONCURRENCY))
    for task in _task_records():
        if task.get('status') in {'queued', 'running'}:
            task['status'] = 'queued'
            _write_task(task)
            _task_queue.put_nowait(task['id'])


def _new_agent_task(record: dict[str, Any], section: str, operation: str, instruction: str = '') -> dict[str, Any]:
    sections = _load_sections(record)
    current = sections[section]
    now = datetime.now().isoformat(timespec='microseconds')
    return {'id': uuid.uuid4().hex, 'paper_id': record['id'], 'section': section, 'section_label': ANALYSIS_SECTION_LABELS[section], 'operation': operation, 'instruction': instruction, 'source_content': current.get('content', ''), 'base_revision': int(current.get('revision', 0)), 'status': 'queued', 'result': '', 'auto_applied': False, 'suggestion_available': False, 'error': '', 'created_at': now, 'updated_at': now}


async def _enqueue_tasks(tasks: list[dict[str, Any]]) -> None:
    for task in tasks:
        _write_task(task)
        _task_queue.put_nowait(task['id'])


def _title_from_url(url: str) -> str:
    clean = url.rstrip('/').split('/')[-1] or '在线文献'
    if clean.lower().endswith('.pdf'):
        clean = clean[:-4]
    return clean.replace('-', ' ').replace('_', ' ')[:160]


async def _download_pdf(url: str, target: Path) -> bool:
    candidates = [url]
    if 'arxiv.org/abs/' in url:
        candidates.insert(0, url.replace('/abs/', '/pdf/') + '.pdf')
    if 'arxiv.org/html/' in url:
        candidates.insert(0, url.replace('/html/', '/pdf/') + '.pdf')
    async with httpx.AsyncClient(follow_redirects=True, timeout=45) as client:
        for candidate in candidates:
            try:
                response = await client.get(candidate)
                content_type = response.headers.get('content-type', '').lower()
                if response.status_code < 400 and ('application/pdf' in content_type or response.content[:4] == b'%PDF'):
                    target.write_bytes(response.content)
                    return True
            except httpx.HTTPError:
                continue
    return False


@app.get('/api/health')
async def health() -> dict[str, Any]:
    config = _agent_config()
    key_env = os.getenv('LLM_API_KEY_ENV', '').strip()
    return {
        'ok': True,
        'data_dir': str(DATA_DIR),
        'api_configured': bool(config['api_key']) or config['protocol'] in {'codex', 'codex_cli'},
        'api_key_env': key_env or 'LLM_API_KEY',
        'api_protocol': config['protocol'],
        'model': config['model'],
    }


@app.get('/api/agent-config')
async def get_agent_config() -> dict[str, Any]:
    return _public_agent_config()


@app.patch('/api/agent-config')
async def update_agent_config(payload: AgentConfigRequest) -> dict[str, Any]:
    protocol = payload.protocol.strip().lower()
    if protocol and protocol not in SUPPORTED_AGENT_PROTOCOLS:
        raise HTTPException(status_code=400, detail='不支持的 Agent 协议')
    if protocol:
        _runtime_agent_config['protocol'] = protocol
    if payload.api_base_url.strip():
        _runtime_agent_config['api_base_url'] = payload.api_base_url.strip().rstrip('/')
    if payload.model.strip():
        _runtime_agent_config['model'] = payload.model.strip()
    if payload.codex_executable.strip():
        _runtime_agent_config['codex_executable'] = payload.codex_executable.strip()
    if payload.codex_model.strip():
        _runtime_agent_config['codex_model'] = payload.codex_model.strip()
    if payload.clear_api_key:
        _runtime_agent_config['api_key'] = ''
    elif payload.api_key is not None and payload.api_key.strip():
        _runtime_agent_config['api_key'] = payload.api_key.strip()
    return _public_agent_config()


@app.get('/api/papers')
async def list_papers() -> list[dict[str, Any]]:
    records = []
    for record_path in PAPERS_DIR.glob('*/paper.json'):
        try:
            records.append(_public_record(json.loads(record_path.read_text(encoding='utf-8'))))
        except (OSError, json.JSONDecodeError):
            continue
    return sorted(records, key=lambda item: item.get('created_at', ''), reverse=True)


@app.post('/api/import')
async def import_papers(files: list[UploadFile] = File(default=[]), source_url: str = Form(default=''), title: str = Form(default=''), subtitle: str = Form(default='')) -> dict[str, Any]:
    if not files and not source_url.strip():
        raise HTTPException(status_code=400, detail='请上传 PDF 或填写 DOI / arXiv / URL')
    imported: list[dict[str, Any]] = []
    for upload in files:
        if not upload.filename or not upload.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail='目前只支持 PDF 文件')
        paper_id = uuid.uuid4().hex
        directory = PAPERS_DIR / paper_id
        directory.mkdir(parents=True, exist_ok=True)
        filename = _safe_name(upload.filename)
        document = directory / filename
        document.write_bytes(await upload.read())
        record = _new_record(paper_id, directory, document, filename, '', 'PDF 文献', 'Imported PDF · 等待分析', title=title, custom_subtitle=subtitle)
        _write_json(directory / 'paper.json', record)
        imported.append(_public_record(record))
    if source_url.strip():
        paper_id = uuid.uuid4().hex
        directory = PAPERS_DIR / paper_id
        directory.mkdir(parents=True, exist_ok=True)
        document = directory / 'source.pdf'
        downloaded = await _download_pdf(source_url.strip(), document)
        record = _new_record(paper_id, directory, document if downloaded else None, 'source.pdf' if downloaded else '', source_url.strip(), '在线来源', 'Imported URL · 等待分析', title=title, custom_subtitle=subtitle)
        _write_json(directory / 'paper.json', record)
        imported.append(_public_record(record))
    return {'papers': imported, 'data_dir': str(DATA_DIR)}


@app.get('/api/papers/{paper_id}/sections')
async def list_sections(paper_id: str) -> dict[str, Any]:
    record = _read_record(paper_id)
    return {'paper_id': paper_id, 'labels': ANALYSIS_SECTION_LABELS, 'sections': _public_sections(record)}


@app.patch('/api/papers/{paper_id}/sections/{section}')
async def update_section(paper_id: str, section: str, payload: SectionUpdateRequest) -> dict[str, Any]:
    if section not in ANALYSIS_SECTION_KEYS:
        raise HTTPException(status_code=404, detail='分析维度不存在')
    record = _read_record(paper_id)
    sections = _load_sections(record)
    current = sections[section]
    if payload.base_revision is not None and payload.base_revision != current.get('revision', 0):
        raise HTTPException(status_code=409, detail={'message': '这一栏已被其他操作更新，请先查看最新内容。', 'section': current})
    current['content'] = payload.content
    current['revision'] = int(current.get('revision', 0)) + 1
    current['updated_at'] = datetime.now().isoformat(timespec='seconds')
    current['source'] = 'user'
    _write_json(_sections_path(record), sections)
    _update_paper_status(record)
    return {'section': current}


@app.get('/api/agent-tasks')
async def list_agent_tasks(paper_ids: str = '') -> list[dict[str, Any]]:
    selected = {item.strip() for item in paper_ids.split(',') if item.strip()} if paper_ids else None
    return [_public_task(task) for task in _task_records(selected)]


@app.post('/api/agent-tasks/batch')
async def enqueue_batch_tasks(payload: BatchTaskRequest) -> dict[str, Any]:
    if not payload.paper_ids:
        raise HTTPException(status_code=400, detail='请先选择至少一篇论文')
    tasks: list[dict[str, Any]] = []
    for paper_id in dict.fromkeys(payload.paper_ids):
        record = _read_record(paper_id)
        sections = _load_sections(record)
        existing = _task_records({paper_id})
        active_sections = {task.get('section') for task in existing if task.get('status') in {'queued', 'running'}}
        paper_tasks = []
        for section in ANALYSIS_SECTION_KEYS:
            if str(sections[section].get('content', '')).strip() or section in active_sections:
                continue
            paper_tasks.append(_new_agent_task(record, section, 'generate'))
        tasks.extend(paper_tasks)
        if paper_tasks:
            record['status'] = 'analyzing'
            _write_json(Path(record['directory']) / 'paper.json', record)
    await _enqueue_tasks(tasks)
    return {'tasks': [_public_task(task) for task in tasks], 'paper_ids': payload.paper_ids, 'queued': len(tasks)}


@app.post('/api/papers/{paper_id}/sections/{section}/suggest')
async def enqueue_section_suggestion(paper_id: str, section: str, payload: SuggestionRequest) -> dict[str, Any]:
    if section not in ANALYSIS_SECTION_KEYS:
        raise HTTPException(status_code=404, detail='分析维度不存在')
    if not payload.instruction.strip():
        raise HTTPException(status_code=400, detail='请告诉 Agent 希望如何修改这一栏')
    record = _read_record(paper_id)
    sections = _load_sections(record)
    current = sections[section]
    if payload.base_revision != current.get('revision', 0):
        raise HTTPException(status_code=409, detail={'message': '这一栏刚刚发生变化，请先重新加载。', 'section': current})
    task = _new_agent_task(record, section, 'revise', payload.instruction.strip())
    await _enqueue_tasks([task])
    record['status'] = 'analyzing'
    _write_json(Path(record['directory']) / 'paper.json', record)
    return {'task': _public_task(task)}


@app.post('/api/agent-tasks/{task_id}/apply')
async def apply_agent_suggestion(task_id: str, payload: SuggestionApplyRequest | None = None) -> dict[str, Any]:
    task = _read_task(task_id)
    if task.get('status') != 'completed' or not task.get('suggestion_available'):
        raise HTTPException(status_code=409, detail='当前任务没有可应用的建议')
    record = _read_record(task['paper_id'])
    sections = _load_sections(record)
    current = sections[task['section']]
    current_revision = current.get('revision', 0)
    expected_revision = payload.expected_revision if payload and payload.expected_revision is not None else task.get('base_revision', 0)
    if current_revision != expected_revision:
        raise HTTPException(status_code=409, detail={'message': '这一栏已被人工修改，建议保留为待处理结果。', 'section': current})
    current['content'] = str(task.get('result', '')).strip()
    current['revision'] = int(current.get('revision', 0)) + 1
    current['updated_at'] = datetime.now().isoformat(timespec='seconds')
    current['source'] = 'agent'
    _write_json(_sections_path(record), sections)
    task['suggestion_available'] = False
    task['auto_applied'] = True
    task['updated_at'] = datetime.now().isoformat(timespec='seconds')
    _write_task(task)
    _update_paper_status(record)
    return {'task': _public_task(task), 'section': current}


def _new_record(paper_id: str, directory: Path, document: Path | None, filename: str, source: str, venue: str, subtitle: str, title: str = '', custom_subtitle: str = '') -> dict[str, Any]:
    generated_title = Path(filename).stem.replace('_', ' ').replace('-', ' ') if filename else _title_from_url(source)
    custom_title = title.strip()[:200]
    custom_subtitle = custom_subtitle.strip()[:200]
    return {'id': paper_id, 'title': custom_title or generated_title or '新导入文献', 'subtitle': custom_subtitle or subtitle, 'title_customized': bool(custom_title), 'subtitle_customized': bool(custom_subtitle), 'authors': '待补充作者信息', 'venue': venue, 'year': '', 'tags': ['待整理'], 'summary': '文献已保存到 data，点击 AI 分析后生成结构化摘要。', 'status': 'pending', 'source': source, 'pdfName': filename, 'document_path': str(document) if document else '', 'directory': str(directory), 'analysis': None, 'created_at': datetime.now().isoformat(timespec='seconds')}


@app.post('/api/papers/{paper_id}/analyze')
async def analyze_paper(paper_id: str) -> dict[str, Any]:
    return await enqueue_batch_tasks(BatchTaskRequest(paper_ids=[paper_id]))


@app.get('/api/papers/{paper_id}/file')
async def paper_file(paper_id: str) -> FileResponse:
    record = _read_record(paper_id)
    document_path = record.get('document_path')
    path = Path(document_path) if document_path else None
    if not path or not path.exists():
        raise HTTPException(status_code=404, detail='当前记录没有 PDF 文件')
    return FileResponse(path, media_type='application/pdf', filename=record.get('pdfName') or path.name)


@app.get('/api/papers/{paper_id}/analysis.json')
async def paper_analysis_json(paper_id: str) -> FileResponse:
    record = _read_record(paper_id)
    path = Path(record['directory']) / 'analysis.json'
    if not path.exists():
        raise HTTPException(status_code=404, detail='当前文献还没有分析结果')
    return FileResponse(path, media_type='application/json', filename='analysis.json')


def _analysis_markdown(record: dict[str, Any], analysis: dict[str, Any]) -> str:
    metadata = analysis.get('metadata', {})
    title = metadata.get('title') or record.get('title') or '未命名文献'
    authors = ', '.join(metadata.get('authors', [])) or '未找到'
    venue = metadata.get('venue') or '未找到'
    year = metadata.get('year') or ''
    lines = [f'# {title}', '', f'- 作者：{authors}', f'- 发表：{venue} {year}'.rstrip(), '']
    lines.extend(['## 摘要', analysis.get('summary', ''), '', '## 中文摘要', analysis.get('abstract_zh', ''), ''])
    for key, heading in (('question', '研究问题'), ('contributions', '核心贡献'), ('method', '方法'), ('experiment', '实验'), ('results', '结果'), ('limitations', '局限性'), ('inspiration', '研究启发'), ('evidence', '证据索引')):
        lines.extend([f'## {heading}', '', '```json', json.dumps(analysis.get(key), ensure_ascii=False, indent=2), '```', ''])
    return chr(10).join(lines)
