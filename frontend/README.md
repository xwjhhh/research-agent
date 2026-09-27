# 研序前端

启动本地后端并通过静态服务器打开 `index.html`；导入、保存和 Agent 任务依赖本地文献服务。

文献库支持导入 PDF 或 PDF URL 并自定义标题，选择论文后可批量生成八项分析。打开论文可直接编辑八栏正文，右侧按需打开 Agent 面板，查看并应用单栏修改建议；已有内容不会被批量生成覆盖。

项目的辅助工作记录保存在浏览器 `localStorage`；论文 PDF、分析正文和 Agent 任务由后端保存在 `1_find_paper/data`。
## 接入真实文献分析

前端通过 `http://127.0.0.1:8787/api` 连接本地 FastAPI 适配层。论文保存在 `1_find_paper/data/papers/<paper-id>`，八栏正文保存在 `sections.json`。后端可以调用配置的 OpenAI 兼容接口，也可以按 `backend/README.md` 配置本地 Codex CLI。

启动方式：

```powershell
cd C:\Users\Administrator\Desktop\rebirth\论文\frontend\backend
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# 设置后端服务所需的模型配置或 Codex CLI 配置
uvicorn server:app --host 127.0.0.1 --port 8787 --reload
```

后端按八个维度预设提示词，队列并发生成空白栏；已有内容的 Agent 修改只返回建议，需用户确认后应用。手动编辑使用修订号保护，不会被异步任务覆盖。

## 前端 Agent 设置

点击顶部“Agent 设置”即可选择本机 Codex CLI、Responses API 或 OpenAI-compatible API，并填写 API Base URL、模型和 API Key。浏览器只把配置发送到本机 FastAPI；API Key 只保存在当前后端进程内，不写入 `localStorage`、论文 JSON、`sections.json` 或 Git 文件。后端重启后，前端配置会清空；需要持久化时请使用未提交的 `backend/.env` 或系统环境变量。
