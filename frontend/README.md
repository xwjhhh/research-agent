# 研序前端

直接打开 `index.html` 即可使用，无需安装依赖或启动后端。

第一阶段现在以文献库为核心，支持导入 PDF / DOI / arXiv / URL、搜索筛选、AI 分析状态、结构化论文详情、八个分析维度、结果证据弹窗和 JSON 导出。当前 AI 分析与 PDF 证据是前端原型演示，后续可以替换为真实后端调用。

后续五个阶段继续提供工作记录、阶段清单和资料名称记录。项目状态保存在当前浏览器的 `localStorage`；导入文献只保存文件名和来源，不上传文件内容。
## 接入真实文献分析

前端现在通过 `http://127.0.0.1:8787/api` 连接本地 FastAPI 适配层。导入 PDF 后，文件会保存到 `论文/1_find_paper/data/papers/<paper-id>`；点击“AI 分析”会调用配置的 OpenAI 兼容接口，并保存 `paper.json`、`analysis.json` 和 `analysis.md`。

启动方式：

```powershell
cd C:\Users\Administrator\Desktop\rebirth\论文\frontend\backend
python -m pip install -r requirements.txt
Copy-Item .env.example .env
# 在 .env 填入 LLM_API_KEY 和 LLM_MODEL
uvicorn server:app --host 127.0.0.1 --port 8787 --reload
```

分析适配层参考 `paper-qa-main` 的文档入库、检索上下文和问答分层，但前端使用的是稳定的结构化 JSON 协议。提示词覆盖基本信息、研究问题、核心贡献、方法、实验、结果、局限性和研究启发八个维度，并要求证据页码、数值核对和不确定性标注。
