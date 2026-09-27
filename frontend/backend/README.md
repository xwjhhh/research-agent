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

The analysis flow follows the useful boundary from PaperQA: extract document text, assemble retrieval-oriented context, call the LLM with evidence rules, normalize the JSON, and persist the result.
