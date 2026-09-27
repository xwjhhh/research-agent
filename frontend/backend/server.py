'''Local FastAPI service for the literature library.'''

from __future__ import annotations

import json
import os
import re
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

import httpx
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

try:
    from .paper_adapter import AnalysisAdapterError, PaperQACompatibleAdapter
except ImportError:
    from paper_adapter import AnalysisAdapterError, PaperQACompatibleAdapter


if load_dotenv:
    load_dotenv(Path(__file__).with_name('.env'))

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = Path(os.getenv('REBIRTH_DATA_DIR', str(ROOT / '1_find_paper' / 'data'))).resolve()
PAPERS_DIR = DATA_DIR / 'papers'
DATA_DIR.mkdir(parents=True, exist_ok=True)
PAPERS_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title='Rebirth Literature API', version='0.1.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=False, allow_methods=['*'], allow_headers=['*'])


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
    key_env = os.getenv('LLM_API_KEY_ENV', '').strip()
    configured = bool(
        os.getenv('LLM_API_KEY')
        or (os.getenv(key_env) if key_env else '')
        or os.getenv('OPENAI_API_KEY')
    )
    return {
        'ok': True,
        'data_dir': str(DATA_DIR),
        'api_configured': configured,
        'api_key_env': key_env or 'LLM_API_KEY',
        'api_protocol': os.getenv('LLM_API_PROTOCOL', 'chat_completions'),
        'model': os.getenv('LLM_MODEL', ''),
    }


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


def _new_record(paper_id: str, directory: Path, document: Path | None, filename: str, source: str, venue: str, subtitle: str, title: str = '', custom_subtitle: str = '') -> dict[str, Any]:
    generated_title = Path(filename).stem.replace('_', ' ').replace('-', ' ') if filename else _title_from_url(source)
    custom_title = title.strip()[:200]
    custom_subtitle = custom_subtitle.strip()[:200]
    return {'id': paper_id, 'title': custom_title or generated_title or '新导入文献', 'subtitle': custom_subtitle or subtitle, 'title_customized': bool(custom_title), 'subtitle_customized': bool(custom_subtitle), 'authors': '待补充作者信息', 'venue': venue, 'year': '', 'tags': ['待整理'], 'summary': '文献已保存到 data，点击 AI 分析后生成结构化摘要。', 'status': 'pending', 'source': source, 'pdfName': filename, 'document_path': str(document) if document else '', 'directory': str(directory), 'analysis': None, 'created_at': datetime.now().isoformat(timespec='seconds')}


@app.post('/api/papers/{paper_id}/analyze')
async def analyze_paper(paper_id: str) -> dict[str, Any]:
    record = _read_record(paper_id)
    directory = Path(record['directory'])
    document_path = Path(record['document_path']) if record.get('document_path') else None
    record['status'] = 'analyzing'
    _write_json(directory / 'paper.json', record)
    try:
        if not document_path or not document_path.exists():
            raise AnalysisAdapterError('当前记录没有可分析的 PDF。请重新导入 PDF，或使用可下载 PDF 的 URL。')
        adapter = PaperQACompatibleAdapter(DATA_DIR)
        analysis = await adapter.analyze(document_path, record.get('pdfName') or record.get('title', 'paper'), record.get('source', ''))
        record['analysis'] = analysis
        metadata = analysis.get('metadata', {})
        if not record.get('title_customized'):
            record['title'] = metadata.get('title') or record['title']
        if not record.get('subtitle_customized'):
            record['subtitle'] = metadata.get('subtitle') or record['subtitle']
        record['authors'] = ', '.join(metadata.get('authors', [])) or record['authors']
        record['venue'] = metadata.get('venue') or record['venue']
        record['year'] = metadata.get('year') or record['year']
        record['tags'] = metadata.get('keywords') or record.get('tags', [])
        record['summary'] = analysis.get('summary') or record['summary']
        record['status'] = 'analyzed'
        _write_json(directory / 'analysis.json', analysis)
        (directory / 'analysis.md').write_text(_analysis_markdown(record, analysis), encoding='utf-8')
        _write_json(directory / 'paper.json', record)
        return _public_record(record)
    except AnalysisAdapterError as exc:
        record['status'] = 'pending'
        record['error'] = str(exc)
        _write_json(directory / 'paper.json', record)
        raise HTTPException(status_code=502, detail=str(exc)) from exc


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
