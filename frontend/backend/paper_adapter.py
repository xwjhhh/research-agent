'''PaperQA-inspired document to LLM adaptation layer.'''

from __future__ import annotations

import asyncio
import importlib.util
import json
import os
from pathlib import Path
from typing import Any

import httpx
try:
    from .prompts import ANALYSIS_SCHEMA, ANALYSIS_SYSTEM_PROMPT, SECTION_RESPONSE_SCHEMA, build_analysis_prompt, build_section_prompt
except ImportError:
    from prompts import ANALYSIS_SCHEMA, ANALYSIS_SYSTEM_PROMPT, SECTION_RESPONSE_SCHEMA, build_analysis_prompt, build_section_prompt



class AnalysisAdapterError(RuntimeError):
    '''Raised when extraction or the configured language model fails.'''


def _text(value: Any, default: str = '') -> str:
    if value is None:
        return default
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False)
    return str(value)


def _list(value: Any) -> list[Any]:
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def _index(value: Any, length: int) -> int:
    try:
        value = int(value)
    except (TypeError, ValueError):
        return 0
    return value if 0 <= value < length else 0


class PaperQACompatibleAdapter:
    '''Extract, retrieve, and analyze a paper through a configurable API.'''

    def __init__(self, data_dir: Path, config: dict[str, str] | None = None) -> None:
        self.data_dir = data_dir
        config = config or {}
        self.api_base = config.get('api_base_url', os.getenv('LLM_API_BASE_URL', 'https://api.openai.com/v1')).rstrip('/')
        self.protocol = config.get('protocol', os.getenv('LLM_API_PROTOCOL', 'chat_completions')).strip().lower()
        self.api_key_env = os.getenv('LLM_API_KEY_ENV', '').strip()
        self.api_key = config.get('api_key', os.getenv('LLM_API_KEY') or os.getenv(self.api_key_env, '') or os.getenv('OPENAI_API_KEY', ''))
        self.model = config.get('model', os.getenv('LLM_MODEL', 'gpt-4o-mini'))
        self.codex_executable = config.get('codex_executable', os.getenv('CODEX_EXECUTABLE', 'codex')).strip() or 'codex'
        self.codex_model = config.get('codex_model', os.getenv('CODEX_MODEL', '')).strip()
        self.reasoning_effort = os.getenv('LLM_REASONING_EFFORT', '').strip()
        self.disable_response_storage = os.getenv('LLM_DISABLE_RESPONSE_STORAGE', 'false').strip().lower() in ('1', 'true', 'yes', 'on')
        self.responses_path = os.getenv('LLM_RESPONSES_PATH', '/responses').strip()
        self.timeout = float(os.getenv('LLM_TIMEOUT_SECONDS', '240'))
        self.max_context_chars = int(os.getenv('LLM_MAX_CONTEXT_CHARS', '90000'))
        self.paperqa_available = importlib.util.find_spec('paperqa') is not None

    async def analyze(self, document_path: Path, document_name: str, source_url: str = '') -> dict[str, Any]:
        pages = self._extract_pages(document_path)
        if not pages and source_url:
            pages = [{'page': 'Source URL', 'text': source_url}]
        if not pages:
            raise AnalysisAdapterError('没有从文献中提取到可分析的文本，请确认文件是可复制文本的 PDF。')
        context = self._build_retrieval_context(pages)
        raw = await self._complete_json(build_analysis_prompt(context, document_name))
        return self._normalise_analysis(raw, pages)

    async def analyze_section(self, document_path: Path, document_name: str, section: str, current_content: str = '', instruction: str = '', source_url: str = '') -> str:
        pages = self._extract_pages(document_path)
        if not pages and source_url:
            pages = [{'page': 'Source URL', 'text': source_url}]
        if not pages:
            raise AnalysisAdapterError('没有从文献中提取到可分析的文本，请确认文件是可复制文本的 PDF。')
        context = self._build_retrieval_context(pages)
        raw = await self._complete_json(build_section_prompt(context, document_name, section, current_content, instruction), SECTION_RESPONSE_SCHEMA)
        content = raw.get('content') if isinstance(raw, dict) else ''
        if not isinstance(content, str) or not content.strip():
            raise AnalysisAdapterError('Agent 没有返回可保存的栏内容。')
        return content.strip()

    def _extract_pages(self, path: Path) -> list[dict[str, str]]:
        pages: list[dict[str, str]] = []
        try:
            import fitz

            with fitz.open(path) as document:
                for number, page in enumerate(document, start=1):
                    text = page.get_text('text').strip()
                    if text:
                        pages.append({'page': f'Page {number}', 'text': text})
        except Exception:
            pages = []
        if pages:
            return pages
        try:
            from pypdf import PdfReader

            reader = PdfReader(str(path))
            for number, page in enumerate(reader.pages, start=1):
                text = (page.extract_text() or '').strip()
                if text:
                    pages.append({'page': f'Page {number}', 'text': text})
        except Exception as exc:
            raise AnalysisAdapterError(f'PDF 文本提取失败：{exc}') from exc
        return pages

    def _build_retrieval_context(self, pages: list[dict[str, str]]) -> str:
        terms = 'abstract introduction background problem motivation contribution novelty method algorithm architecture implementation training dataset baseline metric experiment result table figure limitation future conclusion'.split()
        chunks: list[dict[str, Any]] = []
        chunk_size = 5200
        overlap = 450
        for page in pages:
            text = ' '.join(page['text'].split())
            start = 0
            while start < len(text):
                end = min(len(text), start + chunk_size)
                chunk_text = text[start:end]
                lowered = chunk_text.lower()
                score = sum(lowered.count(term) for term in terms)
                chunks.append({'page': page['page'], 'text': chunk_text, 'score': score, 'order': len(chunks)})
                if end == len(text):
                    break
                start = end - overlap
        ranked = sorted(chunks, key=lambda item: (-item['score'], item['order']))
        selected: list[dict[str, Any]] = []
        used = 0
        for chunk in ranked:
            block_size = len(chunk['text']) + len(chunk['page']) + 12
            if used + block_size > self.max_context_chars:
                continue
            selected.append(chunk)
            used += block_size
            if used >= self.max_context_chars * 0.86:
                break
        selected.sort(key=lambda item: item['order'])
        return chr(10).join(self._format_context_item(item) for item in selected)

    async def _complete_responses_json(self, user_prompt: str, schema: str = ANALYSIS_SCHEMA) -> dict[str, Any]:
        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        path = self.responses_path if self.responses_path.startswith('/') else '/' + self.responses_path
        payload: dict[str, Any] = {
            'model': self.model,
            'instructions': ANALYSIS_SYSTEM_PROMPT,
            'input': f'{user_prompt}{chr(10)}{chr(10)}{schema}',
            'max_output_tokens': 14000,
            'store': not self.disable_response_storage,
            'text': {'format': {'type': 'json_object'}},
        }
        if self.reasoning_effort:
            payload['reasoning'] = {'effort': self.reasoning_effort}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f'{self.api_base}{path}', headers=headers, json=payload)
                if response.status_code >= 400:
                    payload.pop('text', None)
                    response = await client.post(f'{self.api_base}{path}', headers=headers, json=payload)
                if response.status_code >= 400 and 'reasoning' in payload:
                    payload.pop('reasoning', None)
                    response = await client.post(f'{self.api_base}{path}', headers=headers, json=payload)
                if response.status_code >= 400:
                    raise AnalysisAdapterError(f'Responses API 返回 HTTP {response.status_code}：{response.text[:1000]}')
        except httpx.HTTPError as exc:
            raise AnalysisAdapterError(f'调用 Responses API 失败：{exc}') from exc
        try:
            content = self._extract_responses_text(response.json())
            return self._parse_json(content)
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise AnalysisAdapterError(f'Responses API 返回内容不是有效的结构化 JSON：{response.text[:800]}') from exc

    @staticmethod
    def _extract_responses_text(body: dict[str, Any]) -> str:
        if isinstance(body.get('output_text'), str) and body['output_text'].strip():
            return body['output_text']
        parts: list[str] = []
        for item in body.get('output', []):
            if not isinstance(item, dict):
                continue
            for content in item.get('content', []):
                if isinstance(content, str):
                    parts.append(content)
                elif isinstance(content, dict):
                    value = content.get('text') or content.get('value')
                    if isinstance(value, str):
                        parts.append(value)
        if parts:
            return ''.join(parts)
        raise ValueError('Responses API response has no text content')

    @staticmethod
    def _format_context_item(item: dict[str, Any]) -> str:
        return '[' + item['page'] + ']' + chr(10) + item['text']

    async def _complete_json(self, user_prompt: str, schema: str = ANALYSIS_SCHEMA) -> dict[str, Any]:
        if self.protocol in ('codex', 'codex_cli'):
            return await self._complete_codex_json(user_prompt, schema)
        is_local = any(host in self.api_base for host in ('localhost', '127.0.0.1', '0.0.0.0'))
        if not self.api_key and not is_local:
            source = self.api_key_env or 'LLM_API_KEY'
            raise AnalysisAdapterError(f'未配置 {source}。请检查 backend/.env，或配置本地 OpenAI 兼容服务。')
        if self.protocol in ('responses', 'response'):
            return await self._complete_responses_json(user_prompt, schema)
        headers = {'Content-Type': 'application/json'}
        if self.api_key:
            headers['Authorization'] = f'Bearer {self.api_key}'
        payload: dict[str, Any] = {
            'model': self.model,
            'messages': [
                {'role': 'system', 'content': ANALYSIS_SYSTEM_PROMPT},
                {'role': 'user', 'content': f'{user_prompt}{chr(10)}{chr(10)}{schema}'},
            ],
            'temperature': 0.1,
            'max_tokens': 14000,
            'response_format': {'type': 'json_object'},
        }
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(f'{self.api_base}/chat/completions', headers=headers, json=payload)
                if response.status_code >= 400:
                    payload.pop('response_format', None)
                    response = await client.post(f'{self.api_base}/chat/completions', headers=headers, json=payload)
                if response.status_code >= 400:
                    raise AnalysisAdapterError(f'LLM API 返回 HTTP {response.status_code}：{response.text[:1000]}')
        except httpx.HTTPError as exc:
            raise AnalysisAdapterError(f'调用 LLM API 失败：{exc}') from exc
        try:
            body = response.json()
            content = body['choices'][0]['message']['content']
            if isinstance(content, list):
                content = ''.join(_text(item.get('text', item)) if isinstance(item, dict) else _text(item) for item in content)
            return self._parse_json(_text(content))
        except (KeyError, IndexError, TypeError, ValueError) as exc:
            raise AnalysisAdapterError(f'LLM 返回内容不是有效的结构化 JSON：{response.text[:800]}') from exc

    async def _complete_codex_json(self, user_prompt: str, schema: str) -> dict[str, Any]:
        executable = self.codex_executable
        command = [
            executable, 'exec', '--json', '--color', 'never', '--sandbox', 'read-only',
            '--ephemeral', '--skip-git-repo-check', '-C', str(self.data_dir),
            '-c', 'approval_policy="never"',
        ]
        if self.codex_model:
            command.extend(['--model', self.codex_model])
        command.append('-')
        prompt = f'{ANALYSIS_SYSTEM_PROMPT}\n\n{user_prompt}\n\n{schema}\n\nOnly return the requested JSON object. Do not modify files or execute commands.'
        try:
            environment = os.environ.copy()
            if self.api_key:
                environment['CODEX_API_KEY'] = self.api_key
                environment['OPENAI_API_KEY'] = self.api_key
            process = await asyncio.create_subprocess_exec(
                *command, stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE,
                env=environment,
            )
            try:
                stdout, stderr = await asyncio.wait_for(process.communicate(prompt.encode('utf-8')), self.timeout)
            except TimeoutError as exc:
                process.kill()
                await process.communicate()
                raise AnalysisAdapterError('Codex 任务超时，请稍后重试。') from exc
        except OSError as exc:
            raise AnalysisAdapterError(f'无法启动 Codex CLI：{exc}。请安装 Codex 或设置 CODEX_EXECUTABLE。') from exc
        messages = []
        failure = ''
        for line in stdout.decode('utf-8', errors='replace').splitlines():
            try:
                event = json.loads(line)
            except json.JSONDecodeError:
                continue
            if event.get('type') == 'item.completed' and event.get('item', {}).get('type') == 'agent_message':
                messages.append(event['item'].get('text', ''))
            if event.get('type') == 'turn.failed':
                failure = event.get('error', {}).get('message', '')
            if event.get('type') == 'error':
                failure = event.get('message', '')
        if process.returncode or failure or not messages:
            reason = failure or stderr.decode('utf-8', errors='replace').strip()[-500:] or '未返回结果'
            raise AnalysisAdapterError(f'Codex 分析失败：{reason}')
        try:
            return self._parse_json(messages[-1])
        except (TypeError, ValueError) as exc:
            raise AnalysisAdapterError('Codex 没有返回有效的 JSON 栏内容。') from exc

    @staticmethod
    def _parse_json(content: str) -> dict[str, Any]:
        cleaned = content.strip()
        if cleaned.startswith('```'):
            cleaned = cleaned.removeprefix('```json').removeprefix('```').strip()
            cleaned = cleaned.removesuffix('```').strip()
        try:
            value = json.loads(cleaned)
        except json.JSONDecodeError:
            start = cleaned.find('{')
            end = cleaned.rfind('}')
            if start < 0 or end <= start:
                raise
            value = json.loads(cleaned[start : end + 1])
        if not isinstance(value, dict):
            raise ValueError('structured response must be an object')
        return value

    def _normalise_analysis(self, raw: dict[str, Any], pages: list[dict[str, str]]) -> dict[str, Any]:
        raw_evidence = raw.get('evidence')
        evidence = []
        for item in _list(raw_evidence):
            if isinstance(item, dict):
                evidence.append({
                    'label': _text(item.get('label'), 'Source evidence'),
                    'section': _text(item.get('section')),
                    'text': _text(item.get('text') or item.get('quote'), '未提供证据摘录'),
                    'quote': _text(item.get('quote') or item.get('text')),
                    'page': _text(item.get('page'), '未标注页码'),
                    'confidence': _text(item.get('confidence'), '中'),
                })
        if not evidence:
            first = pages[0] if pages else {'page': '未知', 'text': ''}
            evidence.append({'label': f'Document context · {first[page]}', 'section': 'Document', 'text': first['text'][:500] or '未提取到证据文本', 'quote': first['text'][:500], 'page': first['page'], 'confidence': '低'})

        metadata = raw.get('metadata') if isinstance(raw.get('metadata'), dict) else {}
        question = raw.get('question') if isinstance(raw.get('question'), dict) else {}
        method = raw.get('method') if isinstance(raw.get('method'), dict) else {}
        experiment = raw.get('experiment') if isinstance(raw.get('experiment'), dict) else {}
        result: dict[str, Any] = {
            'summary': _text(raw.get('summary'), '未生成摘要'),
            'abstract_zh': _text(raw.get('abstract_zh')),
            'metadata': {
                'title': _text(metadata.get('title')), 'subtitle': _text(metadata.get('subtitle')),
                'authors': [_text(item) for item in _list(metadata.get('authors'))], 'year': _text(metadata.get('year')),
                'venue': _text(metadata.get('venue')), 'doi': _text(metadata.get('doi')), 'url': _text(metadata.get('url')),
                'keywords': [_text(item) for item in _list(metadata.get('keywords'))], 'paper_type': _text(metadata.get('paper_type')),
                'abstract': _text(metadata.get('abstract')),
            },
            'question': {
                'background': _text(question.get('background')), 'core': _text(question.get('core')),
                'importance': _text(question.get('importance')), 'gap': [_text(item) for item in _list(question.get('gap'))],
                'scope': _text(question.get('scope')), 'assumptions': [_text(item) for item in _list(question.get('assumptions'))],
            },
            'contributions': [],
            'method': {
                'overview': _text(method.get('overview')), 'steps': [_text(item) for item in _list(method.get('steps'))],
                'data': _text(method.get('data')), 'setup': _text(method.get('setup')), 'components': [],
                'algorithm': [_text(item) for item in _list(method.get('algorithm'))], 'equations': [_text(item) for item in _list(method.get('equations'))],
                'losses': [_text(item) for item in _list(method.get('losses'))], 'training': _text(method.get('training')),
                'inference': _text(method.get('inference')), 'hyperparameters': [_text(item) for item in _list(method.get('hyperparameters'))],
                'complexity': _text(method.get('complexity')), 'implementation': _text(method.get('implementation')),
            },
            'experiment': {
                'datasets': [], 'baselines': [], 'metrics': [], 'setup': _text(experiment.get('setup')),
                'training_budget': _text(experiment.get('training_budget')), 'hardware': _text(experiment.get('hardware')),
                'software': _text(experiment.get('software')), 'ablations': [_text(item) for item in _list(experiment.get('ablations'))],
                'protocol': _text(experiment.get('protocol')), 'reproducibility': [_text(item) for item in _list(experiment.get('reproducibility'))],
            },
            'results': [], 'limitations': [], 'inspiration': [], 'evidence': evidence,
        }
        for item in _list(raw.get('contributions')):
            if isinstance(item, dict):
                result['contributions'].append({
                    'title': _text(item.get('title')), 'type': _text(item.get('type')), 'description': _text(item.get('description')),
                    'compared': _text(item.get('compared')), 'novelty': _text(item.get('novelty')), 'confidence': _text(item.get('confidence'), '中'),
                    'evidence': _index(item.get('evidence'), len(evidence)),
                })
        for item in _list(method.get('components')):
            if isinstance(item, dict):
                result['method']['components'].append({field: _text(item.get(field)) for field in ('name', 'input', 'operation', 'output')})
        field_map = {
            'datasets': ('name', 'split', 'purpose', 'notes'),
            'baselines': ('name', 'category', 'comparison'),
            'metrics': ('name', 'direction', 'definition'),
        }
        for key, fields in field_map.items():
            for item in _list(experiment.get(key)):
                if isinstance(item, dict):
                    result['experiment'][key].append({field: _text(item.get(field)) for field in fields})
                else:
                    result['experiment'][key].append({'name': _text(item)})
        for item in _list(raw.get('results')):
            if isinstance(item, dict):
                result['results'].append({
                    'metric': _text(item.get('metric')), 'proposed': _text(item.get('proposed')), 'baseline': _text(item.get('baseline')),
                    'delta': _text(item.get('delta')), 'setting': _text(item.get('setting')), 'interpretation': _text(item.get('interpretation')),
                    'evidence': _index(item.get('evidence'), len(evidence)),
                })
        for item in _list(raw.get('limitations')):
            if isinstance(item, dict):
                result['limitations'].append({
                    'item': _text(item.get('item')), 'source': _text(item.get('source')), 'impact': _text(item.get('impact')),
                    'condition': _text(item.get('condition')), 'severity': _text(item.get('severity'), '中'), 'evidence': _index(item.get('evidence'), len(evidence)),
                })
        for item in _list(raw.get('inspiration')):
            if isinstance(item, dict):
                result['inspiration'].append({
                    'idea': _text(item.get('idea')), 'gap': _text(item.get('gap')), 'rationale': _text(item.get('rationale')),
                    'experiment': _text(item.get('experiment')), 'risk': _text(item.get('risk')), 'priority': _text(item.get('priority'), '中'),
                    'evidence': _index(item.get('evidence'), len(evidence)),
                })
        return result
