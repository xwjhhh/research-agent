# Literature API Adapter

This service connects the static frontend to `论文/1_find_paper/data` and uses the
configured LLM to generate a structured literature analysis.

## Install

```powershell
cd C:\Users\Administrator\Desktop\rebirth\论文\frontend\backend
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

The default `.env` is configured for the ModCon Responses API:

```env
LLM_API_BASE_URL=https://modcon.top
LLM_API_PROTOCOL=responses
LLM_API_KEY_ENV=codex_modcon_api
LLM_MODEL=gpt-6-sol
LLM_REASONING_EFFORT=xhigh
LLM_DISABLE_RESPONSE_STORAGE=true
LLM_RESPONSES_PATH=/responses
```

The adapter reads the key from the existing `codex_modcon_api` environment
variable. The secret is intentionally not stored in `.env`. If the variable was
recently added to Windows, restart PowerShell before starting Uvicorn so the
child process can see it. The adapter also supports OpenAI-compatible
Chat Completions providers by changing `LLM_API_PROTOCOL` and the endpoint.

Check the effective configuration without exposing the key:

```powershell
Invoke-RestMethod http://127.0.0.1:8787/api/health
```

## Run

```powershell
uvicorn server:app --host 127.0.0.1 --port 8787 --reload
```

Then serve `论文/frontend` with a static server. Opening `index.html` directly also works for the browser UI, but a static server is preferred for PDF viewing.

## Data layout

Each imported paper is saved below `论文/1_find_paper/data/papers/<paper-id>`:

- Original PDF
- `paper.json` metadata and UI status
- `analysis.json` structured eight-dimension analysis
- `analysis.md` readable research note

Each paper has eight editable sections in `sections.json`. Manual edits autosave with revision checks. Batch generation queues one task per blank section, runs 2–4 tasks concurrently (default 3), and saves task state in `data/agent_tasks`. Existing text is never overwritten by an Agent task; section revisions instead produce an explicit suggestion for the user to apply. If the section changed during generation, applying the old suggestion requires a second explicit confirmation against its current revision.

### Optional local Codex runtime

The browser always calls this FastAPI service, never Codex or a model provider directly. To use the open-source Codex runtime from `api/codex-main`, build/install its CLI first (or use an already installed `codex` executable) and configure:

```env
LLM_API_PROTOCOL=codex
CODEX_EXECUTABLE=codex
AGENT_CONCURRENCY=3
```

Set `CODEX_EXECUTABLE` to the compiled executable path if building from the checked-out source. Optionally set `CODEX_MODEL` to choose a model; otherwise the Codex CLI uses its configured default. Sign in to Codex separately. The backend runs one ephemeral, read-only Codex turn per section and parses its JSON response. PDF text is passed as context; task results still pass through the same revision-safe save rules. No browser-side API key is needed.

## 前端配置 Agent

也可以直接在前端顶部的“Agent 设置”中填写 API Key。前端通过本机 FastAPI 调用模型，不会让浏览器直接请求第三方模型服务。运行时配置只保存在当前后端进程内，重启 Uvicorn 后清空；GET 配置接口只返回“是否已配置”和来源，不返回明文密钥。若选择本机 Codex CLI，填写的密钥会通过子进程环境变量传给 Codex；也可以继续使用 Codex 自己的登录状态。
