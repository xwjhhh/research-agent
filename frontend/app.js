const stages = [
  { nav: "文献检索", title: "文献检索与分析", description: "把论文保存下来，围绕研究问题形成可回看的证据。", tasks: [], fields: [{ label: "研究问题", placeholder: "这项研究想解决什么问题？", multiline: false }, { label: "检索关键词", placeholder: "记录关键词、检索范围或筛选条件", multiline: true }, { label: "文献笔记", placeholder: "记录论文的目标、方法、结果与待核实之处", multiline: true }], tools: [] },
  { nav: "方法设计", title: "研究方法设计", description: "形成问题、方法和可执行的实验方案。", tasks: [], fields: [{ label: "研究假设", placeholder: "写下要验证的核心假设", multiline: false }, { label: "方法设计", placeholder: "描述方法、输入输出及领域约束", multiline: true }, { label: "实验方案与反馈", placeholder: "记录对照设计、评价指标和评审修改", multiline: true }], tools: [{ name: "ResearchAgent", url: "https://github.com/JinheonBaek/ResearchAgent" }] },
  { nav: "自动实验", title: "实验执行与迭代", description: "明确实验计划，持续记录运行与反馈。", tasks: [], fields: [{ label: "实验计划", placeholder: "列出数据、模型和需要运行的实验", multiline: false }, { label: "环境与参数", placeholder: "记录运行环境、配置和参数", multiline: true }, { label: "运行与迭代记录", placeholder: "记录每次运行、遇到的问题和下一步", multiline: true }], tools: [{ name: "RD-Agent", url: "https://github.com/microsoft/RD-Agent" }, { name: "AI Scientist v2", url: "https://github.com/SakanaAI/AI-Scientist-v2" }] },
  { nav: "结果核查", title: "结果整理与核查", description: "汇总指标，逐项确认结果的可靠性。", tasks: [], fields: [{ label: "关键结果", placeholder: "汇总主要指标及其来源", multiline: false }, { label: "核查记录", placeholder: "记录分项检查、异常和复核情况", multiline: true }, { label: "结论与局限", placeholder: "哪些结果成立？仍有哪些不确定性？", multiline: true }], tools: [{ name: "MLflow Tracking", url: "https://mlflow.org/docs/latest/ml/tracking/" }, { name: "PaperBench", url: "https://proceedings.mlr.press/v267/starace25a.html" }] },
  { nav: "论文写作", title: "论文写作", description: "组织论证结构，完成可核对的草稿。", tasks: [], fields: [{ label: "章节提纲", placeholder: "列出论文的主要章节和论证顺序", multiline: false }, { label: "写作草稿", placeholder: "记录各章节要点或草稿内容", multiline: true }, { label: "待补证据", placeholder: "标记需要补充的引用、数据或解释", multiline: true }], tools: [{ name: "Agent Laboratory", url: "https://github.com/SamuelSchmidgall/AgentLaboratory" }] },
  { nav: "图表制作", title: "图表制作", description: "从核验后的数据生成图表并留存代码。", tasks: [], fields: [{ label: "图表清单", placeholder: "列出各图表要表达的结论", multiline: false }, { label: "数据来源", placeholder: "记录核验后的数据位置和处理方式", multiline: true }, { label: "绘图代码与备注", placeholder: "记录绘图脚本位置、样式调整与检查结果", multiline: true }], tools: [{ name: "LIDA", url: "https://github.com/microsoft/lida" }, { name: "Data Formulator", url: "https://github.com/microsoft/data-formulator" }] },
];

const detailTabs = [["overview", "概览"], ["question", "研究问题"], ["contributions", "核心贡献"], ["method", "方法"], ["experiment", "实验"], ["results", "结果"], ["limitations", "局限性"], ["inspiration", "研究启发"]];
const methodDetailTabs = [["overview", "概览"], ["architecture", "架构"], ["algorithm", "算法"], ["loss", "Loss"], ["training", "训练"], ["novelty", "创新性"], ["validation", "实验计划"]];
const approachOptions = [
  { key: "merging", letter: "A", title: "Adaptive Gaussian Merging", description: "利用 spatial + feature similarity 识别冗余 Gaussian，并进行自适应合并。", fit: "最贴合当前假设", tags: ["Feature-aware", "Compression"] },
  { key: "scoring", letter: "B", title: "Learnable Importance Scoring", description: "学习每个 Gaussian 的重要性分数，结合质量预算进行渐进式压缩。", fit: "适合端到端训练", tags: ["Learnable", "Pruning"] },
  { key: "hierarchical", letter: "C", title: "Hierarchical Gaussian Representation", description: "建立层次化 Gaussian 表示，在不同观察尺度下动态选择表示粒度。", fit: "适合多尺度场景", tags: ["Hierarchical", "Multi-scale"] },
];
const storageKey = "yanxu-workspace-v2";
const ids = [
  "sidebar", "sidebarToggle", "stageNav", "projectSelect", "newProjectButton", "agentSettingsButton", "agentSettingsDialog", "agentSettingsForm", "closeAgentSettingsButton", "cancelAgentSettingsButton", "saveAgentSettingsButton", "agentSettingsStatus", "agentProtocol", "agentApiBaseGroup", "agentApiBase", "agentModel", "agentApiKey", "agentKeyState", "clearAgentKey", "codexSettingsGroup", "codexExecutable", "codexModel", "saveStatus", "projectTitle", "projectOverview", "overallProgress", "overallProgressBar", "overallProgressFill", "overallDetail", "stageHeading", "stageIndex", "stageTitle", "stageDescription", "stageBadge", "stageFooter", "footerPosition", "fieldGrid", "taskProgress", "taskList", "addTaskButton", "toolList", "addFileButton", "fileInput", "fileList", "previousButton", "nextButton", "genericStageView", "methodDesignView", "methodAssistButton", "methodStepper", "methodProblemInput", "methodGoalInput", "methodConstraintsInput", "methodMotivationInput", "methodObservationInput", "methodHypothesisInput", "methodInterventionInput", "methodEffectInput", "approachList", "candidateCount", "selectedMethodPanel", "selectedMethodTitle", "selectedMethodSubtitle", "methodDetailTabs", "methodDetailContent", "libraryView", "libraryProjectName", "libraryStageStatus", "savedPaperCount", "analyzedPaperCount", "pendingPaperCount", "paperSearch", "paperStatusFilters", "libraryTaskStrip", "addLibraryTaskButton", "batchAnalyzeButton", "paperList", "importPaperButton", "importDialog", "importForm", "closeImportButton", "cancelImportButton", "paperDropZone", "paperFileInput", "selectedFileNames", "paperTitle", "paperSubtitle", "paperUrl", "paperDetailDialog", "closeDetailButton", "detailStatus", "paperDetailTitle", "paperDetailSubtitle", "paperDetailMeta", "paperDetailTags", "agentPanel", "closeAgentPanel", "toggleAgentPanel", "agentComposer", "agentPrompt", "agentSendButton", "agentPanelContext", "agentTaskState", "agentSuggestion", "agentSuggestionInput", "applyAgentSuggestion", "sectionEditorStatus", "sectionEditorLabel", "sectionEditorSource", "sectionEditorInput", "sectionEditorHint", "detailPdfButton", "detailReanalyzeButton", "detailExportButton", "paperDetailTabs", "paperDetailContent", "evidenceDialog", "closeEvidenceButton", "evidenceLabel", "evidenceText", "evidencePage", "evidencePdfButton", "projectDialog", "projectForm", "projectName", "cancelProjectButton",
];
const elements = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
let state;
let sidebarCollapsed = false;
let paperStatusFilter = "all";
let paperSearchValue = "";
let detailPaperId = null;
let detailTab = "overview";
const selectedPaperIds = new Set();
const sectionSaveTimers = new Map();
const sectionSavesInFlight = new Map();
const dirtySections = new Set();
const savedSuggestions = new Map();
let activeAgentTaskId = null;
let activeAgentSection = null;
let activeAgentPaperId = null;
let activeAgentTask = null;
let pendingOverrideRevision = null;
let taskStatusPollTimer = null;
let agentConfig = null;

function newTask(title = "") { return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, completed: false }; }
function normalizeTasks(tasks) { return Array.isArray(tasks) ? tasks.map((task) => typeof task === "string" ? { ...newTask(task), title: task } : task && typeof task === "object" ? { ...newTask(), id: task.id || newTask().id, title: String(task.title || "").trim(), completed: Boolean(task.completed) } : null).filter((task) => task && task.title) : []; }
function stageDataTemplate() { return stages.map((stage) => ({ fields: stage.fields.map(() => ""), tasks: [], files: [] })); }
function makeAnalysis(paper) {
  const subject = paper.title.replace(/\.$/, "");
  return {
    summary: `${subject} 针对现有 3D Gaussian Splatting 流程中的质量与稳定性问题提出改进方案，并通过实验验证了方法的有效性。`,
    question: { background: "3D Gaussian Splatting 具备实时渲染优势，但不同观察尺度和采样条件会带来质量不稳定。", core: "如何在保持实时渲染效率的同时，构建更加稳定、具有尺度感知能力的 3D Gaussian 表示？", importance: "问题直接影响新视角合成的清晰度、跨尺度表现和方法能否稳定复现。", gap: ["缺少明确的低通滤波机制", "尺度变化下的表示一致性不足", "高频 Gaussian primitives 容易产生伪影"] },
    contributions: [{ title: "尺度感知表示", type: "Method", description: "将尺度信息纳入 Gaussian 表示和渲染过程，减少视角变化造成的质量波动。", compared: "相比原始 3DGS，方法对不同采样率更加稳定。", evidence: 0 }, { title: "抗混叠渲染模块", type: "Rendering", description: "引入平滑与滤波步骤，抑制高频结构在低分辨率下产生的 aliasing artifacts。", compared: "相比简单 dilation heuristic，模块更容易解释和复现。", evidence: 1 }, { title: "可复现实验协议", type: "Evaluation", description: "在多个场景和评价指标上进行对照，验证方法在质量与效率之间的平衡。", compared: "实验覆盖了训练、渲染和跨尺度评估。", evidence: 2 }],
    method: { steps: ["建立 3D Gaussian primitives 的初始化与优化流程", "根据输入尺度计算平滑与滤波参数", "将过滤后的表示用于新视角渲染"], data: "多场景新视角合成数据，覆盖室内外和不同相机轨迹。", setup: "与原始 3DGS 及代表性抗混叠方法进行相同训练预算下的对照。" },
    experiment: { datasets: ["Mip-NeRF 360", "Tanks & Temples", "Deep Blending"], metrics: ["PSNR", "SSIM", "LPIPS", "渲染帧率"], setup: "固定训练轮数、硬件和相机路径，分别比较训练质量与不同尺度下的渲染结果。" },
    results: [{ metric: "PSNR", proposed: "31.64", baseline: "30.21", delta: "+1.43", evidence: 3 }, { metric: "SSIM", proposed: "0.921", baseline: "0.903", delta: "+0.018", evidence: 4 }, { metric: "LPIPS", proposed: "0.104", baseline: "0.126", delta: "−0.022", evidence: 5 }],
    limitations: ["需要针对不同场景调整部分尺度相关参数", "实验主要集中在静态场景，动态场景仍需进一步验证", "滤波模块会带来少量额外计算成本"],
    inspiration: ["可以研究动态场景下的尺度感知 Gaussian 表示", "将证据定位和实验指标核查做成可复用的研究模板", "探索质量、速度和显存占用之间的自动化权衡"],
    evidence: [{ label: "Introduction · Page 2", text: "论文指出，改变 sampling rate 时会出现明显的 aliasing artifacts，影响不同分辨率下的渲染质量。", page: "Page 2" }, { label: "Method · Page 3", text: "方法部分描述了平滑与滤波模块如何共同作用于 Gaussian 表示和渲染过程。", page: "Page 3" }, { label: "Experiments · Page 5", text: "实验协议覆盖多个数据集，并将方法与原始 3DGS 置于相同训练设置下进行比较。", page: "Page 5" }, { label: "Table 2 · Page 7", text: "PSNR 对比结果显示，当前方法相较于 3DGS 提升 1.43。", page: "Page 7" }, { label: "Table 2 · Page 7", text: "SSIM 对比结果显示，当前方法相较于 3DGS 提升 0.018。", page: "Page 7" }, { label: "Table 2 · Page 7", text: "LPIPS 结果显示，当前方法获得更低的感知误差。", page: "Page 7" }],
  };
}
function makePaper(data = {}) {
  const paper = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, title: data.title || "未命名文献", subtitle: data.subtitle || "等待补充论文副标题", authors: data.authors || "待补充作者信息", venue: data.venue || "PDF 文献", year: String(data.year || "2026"), tags: data.tags || ["待整理"], summary: data.summary || "这篇论文已保存，点击 AI 分析后生成结构化摘要。", status: data.status || "pending", source: data.source || "", pdfName: data.pdfName || "", analysis: data.analysis || null };
  return paper;
}
function createSeedPapers() { return [makePaper({ title: "Mip-Splatting", subtitle: "Alias-free 3D Gaussian Splatting", authors: "Yu et al.", venue: "CVPR", year: "2024", tags: ["3DGS", "Anti-aliasing", "Rendering"], summary: "通过 3D smoothing 与 2D Mip filter 改善不同尺度下的渲染稳定性。", status: "analyzed" }), makePaper({ title: "Gaussian Splatting for Real-Time Radiance Field Rendering", subtitle: "Real-time novel-view synthesis with 3D Gaussians", authors: "Kerbl et al.", venue: "SIGGRAPH", year: "2023", tags: ["3DGS", "Rendering", "Novel View Synthesis"], summary: "提出基于 3D Gaussian 的实时辐射场渲染方法，建立后续研究的基础。", status: "analyzed" }), makePaper({ title: "Scaffold-GS", subtitle: "Structured 3D Gaussians for View Synthesis", authors: "Lu et al.", venue: "CVPR", year: "2024", tags: ["3DGS", "Structure", "View Synthesis"], summary: "结构化 Gaussian 表示，为大规模场景的高效建模提供思路。" }), makePaper({ title: "Dynamic 3D Gaussians", subtitle: "Tracking by persistent dynamic view synthesis", authors: "Luiten et al.", venue: "3DV", year: "2024", tags: ["Dynamic Scene", "Tracking", "3DGS"], summary: "将 Gaussian 表示扩展到动态场景，适合作为后续研究方向参考。" })]; }
function createMethodDesign() { return { selectedApproach: "merging", detailTab: "overview", assisted: false, fields: { problem: "高分辨率场景下 Gaussian 数量快速增长，导致显存和存储成本较高。", goal: "在尽可能保持 rendering quality 的情况下，降低 Gaussian 数量和模型存储。", constraints: "PSNR 下降 < X · Storage ↓ · FPS 不明显下降", motivation: "• pruning 容易损失细节\n• compression ratio 高，但训练复杂\n• vector quantization 存在 codebook overhead\n• 单个 Gaussian 的局部属性无法识别空间与特征冗余", observation: "相邻 Gaussian 存在大量相似 feature。", hypothesis: "部分 Gaussian 表达的是重复信息。", intervention: "根据 spatial + feature similarity 进行 adaptive Gaussian merging。", effect: "Gaussian 数量下降，同时比简单 pruning 更好地保留细节。" } }; }
function makeProject(name, seeded = false) { return { id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name, phase: 0, stages: stageDataTemplate(), papers: seeded ? createSeedPapers() : [], methodDesign: createMethodDesign() }; }
function normalizeState(saved) {
  if (!saved || !Array.isArray(saved.projects) || !saved.projects.length) return { projects: [makeProject("未命名课题")], activeProjectId: null };
  saved.projects = saved.projects.map((project) => ({ ...makeProject(project.name || "未命名课题"), ...project, methodDesign: { ...createMethodDesign(), ...(project.methodDesign || {}), fields: { ...createMethodDesign().fields, ...(project.methodDesign?.fields || {}) } }, phase: Math.min(Math.max(Number(project.phase) || 0, 0), stages.length - 1), stages: stages.map((stage, index) => ({ ...stageDataTemplate()[index], ...(project.stages?.[index] || {}), fields: stage.fields.map((_, fieldIndex) => project.stages?.[index]?.fields?.[fieldIndex] || ""), tasks: normalizeTasks(project.stages?.[index]?.tasks), files: project.stages?.[index]?.files || [] })), papers: Array.isArray(project.papers) ? project.papers.map((paper) => makePaper(paper)) : [] }));
  saved.activeProjectId = saved.projects.some((project) => project.id === saved.activeProjectId) ? saved.activeProjectId : saved.projects[0].id;
  return saved;
}
function loadState() { try { const saved = JSON.parse(localStorage.getItem(storageKey)); if (saved) return normalizeState(saved); } catch {} const project = makeProject("未命名课题"); return { projects: [project], activeProjectId: project.id }; }
state = loadState();
if (!state.activeProjectId) state.activeProjectId = state.projects[0].id;
function activeProject() { return state.projects.find((project) => project.id === state.activeProjectId) || state.projects[0]; }
function activeStageData() { return activeProject().stages[activeProject().phase]; }
function setSaveStatus(message, error = false) { elements.saveStatus.lastChild.textContent = message; elements.saveStatus.classList.toggle("is-error", error); }
function saveState() { try { localStorage.setItem(storageKey, JSON.stringify(state)); setSaveStatus("已保存至本地"); } catch { setSaveStatus("无法保存至本地", true); } }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function sectionLabels() { return Object.fromEntries(detailTabs); }
function sectionTextFromAnalysis(analysis, key) { if (!analysis) return ""; if (key === "overview") return [analysis.summary, analysis.abstract_zh].filter(Boolean).join("\n\n"); const value = analysis[key]; if (value === undefined || value === null || value === "") return ""; return typeof value === "string" ? value : JSON.stringify(value, null, 2); }
function localSectionsForPaper(paper) { const sections = {}; detailTabs.forEach(([key, label]) => { const existing = paper.sections?.[key]; sections[key] = existing ? { ...existing, label } : { paper_id: paper.id, section: key, label, content: sectionTextFromAnalysis(paper.analysis, key), revision: 0, source: paper.analysis ? "analysis" : "empty", updated_at: "" }; }); return sections; }
function paperSections(paper) { if (!paper.sections) paper.sections = localSectionsForPaper(paper); return paper.sections; }
function activeSection() { const paper = activeProject().papers.find((item) => item.id === detailPaperId); return paper ? paperSections(paper)[detailTab] : null; }
function setAgentPanel(open) { elements.agentPanel.hidden = !open; elements.agentPanel.closest('.paper-analysis-layout').classList.toggle('is-agent-open', open); if (open) { elements.agentPanelContext.textContent = `针对“${sectionLabels()[detailTab] || '当前维度'}”提出修改要求。`; elements.agentPrompt.focus(); } }
function updateBatchAnalyzeButton() { const count = selectedPaperIds.size; elements.batchAnalyzeButton.disabled = !count; elements.batchAnalyzeButton.textContent = count ? `生成八项分析（${count}）` : "生成八项分析"; }

function setSidebarCollapsed(collapsed) { sidebarCollapsed = collapsed; elements.sidebar.classList.toggle("is-collapsed", sidebarCollapsed); elements.sidebarToggle.textContent = sidebarCollapsed ? "›" : "‹"; elements.sidebarToggle.setAttribute("aria-expanded", String(!sidebarCollapsed)); const label = sidebarCollapsed ? "展开研究流程" : "折叠研究流程"; elements.sidebarToggle.setAttribute("aria-label", label); elements.sidebarToggle.setAttribute("title", label); }
function renderProjects() { elements.projectSelect.replaceChildren(); state.projects.forEach((project) => { const option = document.createElement("option"); option.value = project.id; option.textContent = project.name; elements.projectSelect.append(option); }); elements.projectSelect.value = activeProject().id; elements.projectTitle.textContent = activeProject().name; }
function renderNavigation() { const project = activeProject(); elements.stageNav.replaceChildren(); stages.forEach((stage, index) => { const tasks = project.stages[index].tasks || []; const complete = tasks.length > 0 && tasks.every((task) => task.completed); const button = document.createElement("button"); button.type = "button"; button.className = `stage-link${index === project.phase ? " is-active" : ""}${complete ? " is-complete" : ""}`; if (index === project.phase) button.setAttribute("aria-current", "step"); const number = document.createElement("span"); number.className = "stage-number"; number.textContent = String(index + 1).padStart(2, "0"); const label = document.createElement("span"); label.className = "stage-link-label"; const name = document.createElement("strong"); name.textContent = stage.nav; const status = document.createElement("small"); status.textContent = complete ? "已完成" : index === project.phase ? "当前阶段" : "待进行"; label.append(name, status); button.append(number, label); button.addEventListener("click", () => changeStage(index)); elements.stageNav.append(button); }); }
function renderFields(stage, data) { elements.fieldGrid.replaceChildren(); stage.fields.forEach((field, index) => { const group = document.createElement("div"); group.className = "field-group"; const label = document.createElement("label"); label.className = "field-label"; label.htmlFor = `field-${index}`; label.textContent = field.label; const input = document.createElement(field.multiline ? "textarea" : "input"); input.id = `field-${index}`; input.className = "field-input"; input.placeholder = field.placeholder; input.value = data.fields[index] || ""; input.addEventListener("input", () => { data.fields[index] = input.value; saveState(); }); group.append(label, input); elements.fieldGrid.append(group); }); }
function renderTaskItem(task, data, container, compact = false) { const row = document.createElement("label"); row.className = compact ? "library-task custom-task-item" : "task-item custom-task-item"; const checkbox = document.createElement("input"); checkbox.type = "checkbox"; checkbox.checked = task.completed; const check = document.createElement("span"); check.className = compact ? "library-task-mark" : "task-check"; check.textContent = task.completed ? "✓" : compact ? "•" : "✓"; const input = document.createElement("input"); input.type = "text"; input.className = compact ? "library-task-input" : "task-text-input"; input.value = task.title; input.placeholder = "输入小标题"; input.maxLength = 100; const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-task"; remove.setAttribute("aria-label", "删除小标题"); remove.textContent = "×"; checkbox.addEventListener("change", () => { task.completed = checkbox.checked; saveState(); refreshProgress(); renderNavigation(); renderLibraryTaskStrip(); }); input.addEventListener("input", () => { task.title = input.value; saveState(); refreshProgress(); renderNavigation(); }); remove.addEventListener("click", (event) => { event.preventDefault(); data.tasks.splice(data.tasks.indexOf(task), 1); saveState(); renderStage(); }); row.append(checkbox, check, input, remove); container.append(row); }
function addCustomTask(stageIndex) { const data = activeProject().stages[stageIndex]; const task = newTask(); data.tasks.push(task); saveState(); renderStage(); requestAnimationFrame(() => { const inputs = stageIndex === 0 ? elements.libraryTaskStrip.querySelectorAll(".library-task-input") : elements.taskList.querySelectorAll(".task-text-input"); inputs[inputs.length - 1]?.focus(); }); }
function renderTasks(stage, data) { elements.taskList.replaceChildren(); (data.tasks || []).forEach((task) => renderTaskItem(task, data, elements.taskList)); }
function renderTools(stage) { elements.toolList.replaceChildren(); stage.tools.forEach((tool) => { const link = document.createElement("a"); link.className = "tool-chip"; link.href = tool.url; link.target = "_blank"; link.rel = "noopener noreferrer"; link.textContent = tool.name; const arrow = document.createElement("span"); arrow.textContent = "↗"; link.append(arrow); elements.toolList.append(link); }); }
function renderFiles(data) { elements.fileList.replaceChildren(); if (!data.files.length) { const empty = document.createElement("div"); empty.className = "file-empty"; empty.textContent = "尚未添加资料"; elements.fileList.append(empty); return; } data.files.forEach((filename, index) => { const row = document.createElement("div"); row.className = "file-row"; const icon = document.createElement("span"); icon.className = "file-icon"; icon.textContent = filename.split(".").pop().slice(0, 4).toUpperCase() || "FILE"; const name = document.createElement("span"); name.className = "file-name"; name.title = filename; name.textContent = filename; const remove = document.createElement("button"); remove.type = "button"; remove.className = "remove-file"; remove.setAttribute("aria-label", `移除 ${filename}`); remove.textContent = "×"; remove.addEventListener("click", () => { data.files.splice(index, 1); saveState(); renderFiles(data); }); row.append(icon, name, remove); elements.fileList.append(row); }); }
function refreshProgress() { const project = activeProject(); const taskList = project.stages.map((stage) => (stage.tasks || []).filter((task) => task.title?.trim())); const completed = taskList.reduce((count, tasks) => count + tasks.filter((task) => task.completed).length, 0); const total = taskList.reduce((count, tasks) => count + tasks.length, 0); const percent = total ? Math.round((completed / total) * 100) : 0; const currentTasks = taskList[project.phase]; const stageCompleted = currentTasks.filter((task) => task.completed).length; elements.overallProgress.textContent = `${percent}%`; elements.overallProgressFill.style.width = `${percent}%`; elements.overallProgressBar.setAttribute("aria-valuenow", String(percent)); elements.overallDetail.textContent = `${completed} / ${total} 项已完成`; elements.taskProgress.textContent = `${stageCompleted} / ${currentTasks.length}`; const done = currentTasks.length > 0 && stageCompleted === currentTasks.length; elements.stageBadge.textContent = done ? "已完成" : "进行中"; elements.stageBadge.classList.toggle("is-done", done); }

function methodDesignData() { const project = activeProject(); if (!project.methodDesign) project.methodDesign = createMethodDesign(); return project.methodDesign; }
function renderMethodStepper() {
  const labels = [["01", "研究目标"], ["02", "设计动机"], ["03", "核心假设"], ["04", "候选方案"], ["05", "方法结构"], ["06", "技术细节"], ["07", "创新性"], ["08", "可验证性"]];
  elements.methodStepper.replaceChildren();
  labels.forEach(([number, label], index) => { const item = document.createElement("div"); item.className = `method-step${index < 4 ? " is-complete" : ""}${index === 3 ? " is-current" : ""}`; const numberEl = document.createElement("span"); numberEl.className = "method-step-number"; numberEl.textContent = number; const text = document.createElement("span"); text.textContent = label; item.append(numberEl, text); elements.methodStepper.append(item); });
}
function renderApproaches() {
  const data = methodDesignData();
  elements.approachList.replaceChildren();
  approachOptions.forEach((approach) => {
    const card = document.createElement("article"); card.className = `approach-card${data.selectedApproach === approach.key ? " is-selected" : ""}`;
    const marker = document.createElement("span"); marker.className = "approach-letter"; marker.textContent = approach.letter;
    const body = document.createElement("div"); body.className = "approach-body";
    const titleRow = document.createElement("div"); titleRow.className = "approach-title-row";
    const title = document.createElement("h3"); title.textContent = approach.title;
    const fit = document.createElement("span"); fit.className = "approach-fit"; fit.textContent = approach.fit;
    titleRow.append(title, fit);
    const description = document.createElement("p"); description.textContent = approach.description;
    const tags = document.createElement("div"); tags.className = "approach-tags"; approach.tags.forEach((tag) => { const chip = document.createElement("span"); chip.textContent = tag; tags.append(chip); });
    body.append(titleRow, description, tags);
    const actions = document.createElement("div"); actions.className = "approach-actions";
    const detail = document.createElement("button"); detail.type = "button"; detail.className = "paper-action"; detail.textContent = "查看详情"; detail.addEventListener("click", () => { data.selectedApproach = approach.key; data.detailTab = "overview"; saveState(); renderMethodCanvas(); });
    const select = document.createElement("button"); select.type = "button"; select.className = data.selectedApproach === approach.key ? "paper-action selected-action" : "paper-action paper-action-primary"; select.textContent = data.selectedApproach === approach.key ? "✓ 当前方案" : "采用此方案"; select.addEventListener("click", () => { data.selectedApproach = approach.key; data.detailTab = "overview"; saveState(); renderMethodCanvas(); });
    actions.append(detail, select); card.append(marker, body, actions); elements.approachList.append(card);
  });
  elements.candidateCount.textContent = `${approachOptions.length} 个候选 · 已选 ${approachOptions.findIndex((item) => item.key === data.selectedApproach) + 1}`;
}
function selectedApproach() { return approachOptions.find((approach) => approach.key === methodDesignData().selectedApproach) || approachOptions[0]; }
function methodDetailMarkup(tab, approach) {
  if (tab === "overview") return `<div class="method-detail-overview"><div class="method-summary-callout"><span>当前设计方向</span><strong>${approach.title}</strong><p>${approach.description}</p></div><div class="method-detail-columns"><section><span class="method-detail-label">输入</span><p>Original 3DGS Gaussian primitives、位置、feature 和 opacity。</p></section><section><span class="method-detail-label">输出</span><p>Compressed 3DGS，以及可用于微调的合并映射。</p></section></div><div class="method-next-step"><span>设计链路</span><strong>Research Gap → Objective → Hypothesis → ${approach.title}</strong></div></div>`;
  if (tab === "architecture") return `<div class="method-tab-section"><div class="architecture-flow"><span>Original 3DGS</span><i>↓</i><span>Redundancy Detection</span><i>↓</i><span>Gaussian Grouping</span><i>↓</i><span>Adaptive Merge</span><i>↓</i><span>Fine-tuning</span><i>↓</i><b>Compressed 3DGS</b></div><h3>核心模块</h3><div class="module-grid"><div><strong>01 · Redundancy Detection</strong><p>Input：位置与 feature。Output：相似度矩阵和冗余候选。</p><small>Inference + 可学习阈值</small></div><div><strong>02 · Adaptive Merge</strong><p>Input：Gaussian groups。Output：合并后的均值、协方差和 feature。</p><small>Training / Inference</small></div></div></div>`;
  if (tab === "algorithm") return `<div class="method-tab-section"><h3>Algorithm</h3><ol class="algorithm-list"><li>计算相邻 Gaussian 的 spatial similarity 与 feature similarity。</li><li>按照联合相似度构建冗余分组，并保留质量敏感区域。</li><li>对每个分组执行加权合并，再进行短周期 fine-tuning。</li></ol><div class="formula-block">s(i, j) = α · s<sub>spatial</sub>(i, j) + β · s<sub>feature</sub>(i, j)</div></div>`;
  if (tab === "loss") return `<div class="method-tab-section"><h3>Loss Function</h3><div class="formula-block">L<sub>total</sub> = L<sub>render</sub> + λ<sub>1</sub>L<sub>similarity</sub> + λ<sub>2</sub>L<sub>sparsity</sub></div><div class="loss-grid"><div><strong>L<sub>render</sub></strong><span>保证 rendering quality</span></div><div><strong>L<sub>similarity</sub></strong><span>鼓励冗余 Gaussian 聚合</span></div><div><strong>L<sub>sparsity</sub></strong><span>减少 Gaussian 数量</span></div></div></div>`;
  if (tab === "training") return `<div class="method-tab-section"><h3>训练与实现</h3><div class="implementation-list"><div><span>Training Strategy</span><strong>先预训练，再逐步提升 sparsity 权重进行微调。</strong></div><div><span>Hyperparameters</span><strong>α / β / λ<sub>1</sub> / λ<sub>2</sub> / merge threshold。</strong></div><div><span>Implementation Changes</span><strong>gaussian_model.py · train.py · renderer.py</strong></div></div></div>`;
  if (tab === "novelty") return `<div class="method-tab-section"><div class="novelty-status"><span>✓</span><strong>已与已保存论文进行初步比较</strong><em>18 篇文献</em></div><div class="novelty-table"><div><span>可能的新颖点</span><strong>Adaptive feature-aware merging</strong><b>高</b></div><div><span>可能的新颖点</span><strong>Spatial + feature 联合冗余检测</strong><b>中</b></div><div class="novelty-warning"><span>⚠ 相似性提醒</span><strong>与 Paper B 存在较高相似性</strong><button type="button" class="evidence-link">查看</button></div></div></div>`;
  return `<div class="method-tab-section"><h3>实验验证计划</h3><div class="validation-grid"><div><span>Datasets</span><strong>Mip-NeRF 360 · Tanks & Temples · Deep Blending</strong></div><div><span>Baselines</span><strong>3DGS · LightGaussian · Compact3D</strong></div><div><span>Metrics</span><strong>PSNR ↑ · SSIM ↑ · LPIPS ↓ · Storage ↓ · FPS ↑</strong></div><div><span>Ablations</span><strong>A no similarity · B no sparsity · C no fine-tuning · Full model</strong></div></div><button type="button" class="footer-button footer-button-primary method-experiment-button" data-go-experiment>进入自动实验 →</button></div>`;
}
function renderMethodDetail() {
  const data = methodDesignData(); const approach = selectedApproach();
  elements.selectedMethodTitle.textContent = approach.title; elements.selectedMethodSubtitle.textContent = approach.description; elements.methodDetailTabs.replaceChildren();
  methodDetailTabs.forEach(([key, label]) => { const button = document.createElement("button"); button.type = "button"; button.className = `method-detail-tab${data.detailTab === key ? " is-active" : ""}`; button.textContent = label; button.addEventListener("click", () => { data.detailTab = key; saveState(); renderMethodDetail(); }); elements.methodDetailTabs.append(button); });
  elements.methodDetailContent.innerHTML = methodDetailMarkup(data.detailTab, approach);
  elements.methodDetailContent.querySelector("[data-go-experiment]")?.addEventListener("click", () => changeStage(2));
}
function renderMethodCanvas() {
  const data = methodDesignData(); const fields = data.fields;
  elements.methodProblemInput.value = fields.problem; elements.methodGoalInput.value = fields.goal; elements.methodConstraintsInput.value = fields.constraints; elements.methodMotivationInput.value = fields.motivation; elements.methodObservationInput.value = fields.observation; elements.methodHypothesisInput.value = fields.hypothesis; elements.methodInterventionInput.value = fields.intervention; elements.methodEffectInput.value = fields.effect;
  elements.methodAssistButton.textContent = data.assisted ? "✓ Agent 已协助梳理" : "让 Agent 帮我梳理";
  renderMethodStepper(); renderApproaches(); renderMethodDetail();
}

function paperMatches(paper) {
  const query = paperSearchValue.trim().toLowerCase();
  const statusMatch = paperStatusFilter === "all" || paper.status === paperStatusFilter;
  const text = [paper.title, paper.subtitle, paper.authors, paper.venue, paper.year, ...(paper.tags || [])].join(" ").toLowerCase();
  return statusMatch && (!query || text.includes(query));
}
function renderLibraryTaskStrip() { const data = activeProject().stages[0]; const tasks = data.tasks || []; elements.libraryTaskStrip.replaceChildren(); elements.libraryTaskStrip.hidden = !tasks.length; tasks.forEach((task) => renderTaskItem(task, data, elements.libraryTaskStrip, true)); }
function renderPaperCard(paper) {
  const card = document.createElement("article"); card.className = `paper-card is-${paper.status}`;
  card.addEventListener("click", (event) => { if (!event.target.closest("button, a, input")) openPaperDetail(paper.id); });
  const header = document.createElement("div"); header.className = "paper-card-header";
  const titleBlock = document.createElement("div"); titleBlock.className = "paper-card-title-block";
  const selection = document.createElement("input"); selection.type = "checkbox"; selection.className = "paper-selection"; selection.checked = selectedPaperIds.has(paper.id); selection.setAttribute("aria-label", `选择 ${paper.title}`); selection.addEventListener("change", () => { if (selection.checked) selectedPaperIds.add(paper.id); else selectedPaperIds.delete(paper.id); updateBatchAnalyzeButton(); });
  const titleButton = document.createElement("button"); titleButton.type = "button"; titleButton.className = "paper-title-button"; titleButton.addEventListener("click", () => openPaperDetail(paper.id));
  const title = document.createElement("h3"); title.textContent = paper.title;
  const subtitle = document.createElement("p"); subtitle.textContent = paper.subtitle;
  titleButton.append(title, subtitle); titleBlock.append(titleButton);
  const status = document.createElement("span"); status.className = `paper-status is-${paper.status}`; status.innerHTML = paper.status === "analyzed" ? "✓ 已分析" : paper.status === "analyzing" ? '<span class="mini-spinner"></span>分析中' : "● 待分析";
  const statusBlock = document.createElement("div"); statusBlock.className = "paper-card-status"; statusBlock.append(status); const progress = paper.taskSummary?.total ? document.createElement("small") : null; if (progress) { progress.textContent = paper.taskSummary.active ? `正在分析 ${paper.taskSummary.active} 项 · ${paper.taskSummary.done}/${paper.taskSummary.total}` : paper.taskSummary.failed ? `${paper.taskSummary.failed} 项失败 · ${paper.taskSummary.done}/${paper.taskSummary.total}` : `${paper.taskSummary.done}/${paper.taskSummary.total} 项`; statusBlock.append(progress); } header.append(selection, titleBlock, statusBlock);
  const meta = document.createElement("div"); meta.className = "paper-card-meta"; meta.textContent = `${paper.authors} · ${paper.venue} ${paper.year}`;
  const tags = document.createElement("div"); tags.className = "paper-tags"; (paper.tags || []).forEach((tag) => { const chip = document.createElement("span"); chip.textContent = `#${tag}`; tags.append(chip); });
  const summary = document.createElement("p"); summary.className = "paper-summary"; summary.textContent = paper.summary;
  const footer = document.createElement("div"); footer.className = "paper-card-footer";
  const primary = document.createElement("button"); primary.type = "button"; primary.className = paper.status === "analyzed" ? "paper-action" : "paper-action paper-action-primary"; primary.disabled = paper.status === "analyzing"; primary.textContent = paper.status === "analyzed" ? "查看分析" : paper.status === "analyzing" ? "分析中…" : "开始分析"; primary.addEventListener("click", () => paper.status === "analyzed" ? openPaperDetail(paper.id) : analyzePaper(paper.id)); footer.append(primary);
  card.append(header, meta, tags, summary, footer); return card;
}
function renderLibrary() {
  const project = activeProject(); const papers = project.papers || []; const analyzed = papers.filter((paper) => paper.status === "analyzed").length; const pending = papers.length - analyzed;
  const libraryTasks = project.stages[0].tasks || []; const libraryDone = libraryTasks.length > 0 && libraryTasks.every((task) => task.completed); elements.libraryProjectName.textContent = project.name; elements.libraryStageStatus.textContent = libraryDone ? "已完成" : "进行中"; elements.savedPaperCount.textContent = papers.length; elements.analyzedPaperCount.textContent = analyzed; elements.pendingPaperCount.textContent = pending;
  renderLibraryTaskStrip(); updateBatchAnalyzeButton(); elements.paperList.replaceChildren();
  const filtered = papers.filter(paperMatches);
  if (!filtered.length) { const empty = document.createElement("div"); empty.className = "paper-empty"; empty.innerHTML = "<strong>没有匹配的文献</strong><span>调整筛选条件，或导入一篇新的论文。</span>"; elements.paperList.append(empty); } else filtered.forEach((paper) => elements.paperList.append(renderPaperCard(paper)));
}
function renderStage() {
  const project = activeProject(); const index = project.phase; const stage = stages[index]; const data = project.stages[index]; const isLibrary = index === 0; const isMethod = index === 1; const position = String(index + 1).padStart(2, "0");
  elements.projectOverview.hidden = isLibrary || isMethod; elements.stageHeading.hidden = isLibrary || isMethod; elements.stageFooter.hidden = isLibrary || isMethod; elements.libraryView.hidden = !isLibrary; elements.methodDesignView.hidden = !isMethod; elements.genericStageView.hidden = isLibrary || isMethod;
  elements.stageIndex.textContent = `阶段 ${position} / 06`; elements.stageTitle.textContent = stage.title; elements.stageDescription.textContent = stage.description; elements.footerPosition.textContent = `${position} / 06`; elements.previousButton.disabled = index === 0; elements.nextButton.disabled = index === stages.length - 1;
  if (isLibrary) renderLibrary(); else if (isMethod) renderMethodCanvas(); else { renderFields(stage, data); renderTasks(stage, data); renderTools(stage); renderFiles(data); }
  refreshProgress();
}
function renderAll() { renderProjects(); renderNavigation(); renderStage(); }
function changeStage(index) { if (index < 0 || index >= stages.length) return; activeProject().phase = index; saveState(); renderNavigation(); renderStage(); window.scrollTo({ top: 0, behavior: "smooth" }); }
function openPaperDetail(id) { detailPaperId = id; detailTab = "overview"; activeAgentTaskId = null; activeAgentSection = null; activeAgentPaperId = null; activeAgentTask = null; pendingOverrideRevision = null; elements.agentPrompt.value = ''; elements.agentSuggestionInput.value = ''; setAgentPanel(false); renderPaperDetail(); elements.paperDetailDialog.showModal(); void loadPaperSections(id); }
function renderPaperDetail() {
  const paper = activeProject().papers.find((item) => item.id === detailPaperId); if (!paper) return;
  const sections = paperSections(paper); const current = sections[detailTab] || sections.overview;
  elements.paperDetailTitle.textContent = paper.title; elements.paperDetailSubtitle.textContent = paper.subtitle || ""; elements.paperDetailMeta.textContent = `${paper.authors} · ${paper.venue} ${paper.year}`; elements.paperDetailTags.replaceChildren();
  (paper.tags || []).forEach((tag) => { const chip = document.createElement("span"); chip.textContent = `#${tag}`; elements.paperDetailTags.append(chip); });
  elements.detailStatus.className = `paper-status is-${paper.status}`; elements.detailStatus.innerHTML = paper.status === "analyzed" ? "✓ 已分析" : paper.status === "analyzing" ? '<span class="mini-spinner"></span>分析中' : "● 待分析"; elements.detailReanalyzeButton.textContent = paper.status === "analyzed" ? "生成空白栏" : "生成八项分析"; elements.detailReanalyzeButton.disabled = paper.status === "analyzing";
  elements.paperDetailTabs.replaceChildren(); detailTabs.forEach(([key, label]) => { const button = document.createElement("button"); button.type = "button"; button.className = `detail-tab${detailTab === key ? " is-active" : ""}`; button.textContent = label; button.setAttribute("aria-current", detailTab === key ? "true" : "false"); button.addEventListener("click", () => { if (detailTab === key) return; detailTab = key; renderPaperDetail(); }); elements.paperDetailTabs.append(button); });
  elements.sectionEditorLabel.textContent = current.label || sectionLabels()[detailTab]; elements.sectionEditorSource.textContent = current.source === "user" ? "手动编辑" : current.source === "agent" ? "Agent 生成" : current.source === "analysis" ? "已有分析" : "空白";
  elements.sectionEditorInput.value = current.content || ""; elements.sectionEditorInput.placeholder = `编辑“${current.label || sectionLabels()[detailTab]}”，或让 Agent 先生成内容。`; elements.sectionEditorStatus.textContent = current.content ? `修订 ${current.revision || 0}` : "这一栏还没有内容"; elements.sectionEditorHint.textContent = current.updated_at ? `最后保存：${current.updated_at}` : "内容会自动保存。";
  elements.sectionEditorInput.oninput = () => scheduleSectionSave(paper.id, detailTab);
  elements.agentPanelContext.textContent = `针对“${current.label || sectionLabels()[detailTab]}”提出修改要求。`; renderAgentTaskState();
}

function renderDetailTab(analysis, tab) {
  if (tab === "overview") return `<div class="detail-overview"><div class="detail-lead"><span>AI 摘要</span><p>${escapeHtml(analysis.summary)}</p></div><div class="detail-columns"><section class="detail-block"><h3>研究判断</h3><p>${escapeHtml(analysis.question.core)}</p></section><section class="detail-block"><h3>结果速览</h3><div class="result-mini-list">${analysis.results.map((item) => `<div><strong>${escapeHtml(item.metric)}</strong><span>${escapeHtml(item.proposed)}</span><em>${escapeHtml(item.delta)}</em></div>`).join("")}</div></section></div><button class="evidence-link" type="button" data-evidence-index="0">查看原文证据 · ${escapeHtml(analysis.evidence[0].label)} →</button></div>`;
  if (tab === "question") return `<div class="detail-section"><h3>研究背景</h3><p>${escapeHtml(analysis.question.background)}</p><h3>核心问题</h3><p class="quote-block">${escapeHtml(analysis.question.core)}</p><h3>为什么重要</h3><p>${escapeHtml(analysis.question.importance)}</p><h3>现有方法的不足</h3><ul>${analysis.question.gap.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`;
  if (tab === "contributions") return `<div class="detail-section"><div class="detail-section-title"><div><span class="panel-kicker">CONTRIBUTIONS</span><h3>核心贡献</h3></div><strong>${analysis.contributions.length} 项</strong></div><div class="contribution-list">${analysis.contributions.map((item, index) => `<section class="contribution-item"><span class="contribution-number">${String(index + 1).padStart(2, "0")}</span><div><h3>${escapeHtml(item.title)}</h3><span class="type-badge">${escapeHtml(item.type)}</span><p>${escapeHtml(item.description)}</p><small>相比已有工作：${escapeHtml(item.compared)}</small><button class="evidence-link" type="button" data-evidence-index="${item.evidence}">查看原文 · ${escapeHtml(analysis.evidence[item.evidence].label)} →</button></div></section>`).join("")}</div></div>`;
  if (tab === "method") return `<div class="detail-section"><h3>方法流程</h3><ol class="method-list">${analysis.method.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol><div class="info-grid"><div><span>数据</span><p>${escapeHtml(analysis.method.data)}</p></div><div><span>对照设置</span><p>${escapeHtml(analysis.method.setup)}</p></div></div></div>`;
  if (tab === "experiment") return `<div class="detail-section"><h3>实验设计</h3><div class="info-grid"><div><span>数据集</span><p>${analysis.experiment.datasets.map(escapeHtml).join(" · ")}</p></div><div><span>评价指标</span><p>${analysis.experiment.metrics.map(escapeHtml).join(" · ")}</p></div></div><h3>实验设置</h3><p>${escapeHtml(analysis.experiment.setup)}</p></div>`;
  if (tab === "results") return `<div class="detail-section"><h3>主要结果</h3><div class="result-table"><div class="result-row result-head"><span>指标</span><span>本文方法</span><span>基线 3DGS</span><span>变化</span></div>${analysis.results.map((item) => `<div class="result-row"><strong>${escapeHtml(item.metric)}</strong><span>${escapeHtml(item.proposed)}</span><span>${escapeHtml(item.baseline)}</span><em>${escapeHtml(item.delta)}</em><button class="evidence-link" type="button" data-evidence-index="${item.evidence}">查看证据 · ${escapeHtml(analysis.evidence[item.evidence].label)} →</button></div>`).join("")}</div></div>`;
  if (tab === "limitations") return `<div class="detail-section"><h3>局限性</h3><ul class="large-list">${analysis.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`;
  return `<div class="detail-section"><h3>研究启发</h3><ul class="large-list inspiration-list">${analysis.inspiration.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`;
}

function showEvidence(evidence) {
  elements.evidenceLabel.textContent = evidence.label;
  elements.evidenceText.textContent = evidence.text;
  elements.evidencePage.textContent = evidence.page;
  elements.evidenceDialog.showModal();
}

function createImportedPaper({ file, url, title, subtitle }) {
  const filename = file?.name || "";
  const cleanName = filename.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim();
  const urlLabel = url ? (url.match(/arxiv\.org\/abs\/([^/?#]+)/i)?.[1] || url.replace(/^https?:\/\//, "").slice(0, 60)) : "";
  const customTitle = title?.trim() || "";
  const customSubtitle = subtitle?.trim() || "";
  return makePaper({ title: customTitle || cleanName || urlLabel || "新导入文献", subtitle: customSubtitle || (file ? "Imported PDF · 等待分析" : "Imported URL · 等待分析"), authors: "待补充作者信息", venue: file ? "PDF 文献" : "在线来源", year: "2026", tags: ["待整理"], source: url || "", pdfName: filename, title_customized: Boolean(customTitle), subtitle_customized: Boolean(customSubtitle) });
}
function updateSelectedFileNames() { const names = [...elements.paperFileInput.files].map((file) => file.name); elements.selectedFileNames.textContent = names.length ? names.join("、") : "支持 PDF，文件内容暂不上传"; }
function exportPaper() {
  const paper = activeProject().papers.find((item) => item.id === detailPaperId); if (!paper) return;
  const blob = new Blob([JSON.stringify(paper, null, 2)], { type: "application/json" }); const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = `${paper.title.replace(/[^\w\u4e00-\u9fff-]+/g, "-")}-analysis.json`; link.click(); URL.revokeObjectURL(link.href);
}

elements.projectSelect.addEventListener("change", (event) => { state.activeProjectId = event.target.value; saveState(); renderAll(); });
elements.newProjectButton.addEventListener("click", () => elements.projectDialog.showModal());
elements.cancelProjectButton.addEventListener("click", () => elements.projectDialog.close());
elements.projectDialog.addEventListener("close", () => { elements.projectForm.reset(); elements.projectName.classList.remove("is-invalid"); });
elements.projectForm.addEventListener("submit", (event) => { event.preventDefault(); const name = elements.projectName.value.trim(); if (!name) { elements.projectName.classList.add("is-invalid"); elements.projectName.focus(); return; } const project = makeProject(name); state.projects.push(project); state.activeProjectId = project.id; saveState(); elements.projectDialog.close(); renderAll(); });
elements.projectName.addEventListener("input", () => elements.projectName.classList.remove("is-invalid"));
elements.sidebarToggle.addEventListener("click", () => setSidebarCollapsed(!sidebarCollapsed));
elements.previousButton.addEventListener("click", () => changeStage(activeProject().phase - 1));
elements.nextButton.addEventListener("click", () => changeStage(activeProject().phase + 1));
elements.addFileButton.addEventListener("click", () => elements.fileInput.click());
elements.fileInput.addEventListener("change", (event) => { const data = activeStageData(); data.files.push(...Array.from(event.target.files, (file) => file.name)); elements.fileInput.value = ""; saveState(); renderFiles(data); });
elements.addTaskButton.addEventListener("click", () => addCustomTask(activeProject().phase));
elements.addLibraryTaskButton.addEventListener("click", () => addCustomTask(0));
elements.importPaperButton.addEventListener("click", () => elements.importDialog.showModal());
elements.closeImportButton.addEventListener("click", () => elements.importDialog.close());
elements.cancelImportButton.addEventListener("click", () => elements.importDialog.close());
elements.importDialog.addEventListener("close", () => { elements.importForm.reset(); updateSelectedFileNames(); elements.paperDropZone.classList.remove("is-invalid"); });
elements.paperFileInput.addEventListener("change", updateSelectedFileNames);
elements.paperDropZone.addEventListener("dragover", (event) => { event.preventDefault(); elements.paperDropZone.classList.add("is-dragging"); });
elements.paperDropZone.addEventListener("dragleave", () => elements.paperDropZone.classList.remove("is-dragging"));
elements.paperDropZone.addEventListener("drop", (event) => { event.preventDefault(); elements.paperDropZone.classList.remove("is-dragging"); elements.paperFileInput.files = event.dataTransfer.files; updateSelectedFileNames(); });
elements.importForm.addEventListener("submit", (event) => { event.preventDefault(); const files = [...elements.paperFileInput.files]; const url = elements.paperUrl.value.trim(); const title = elements.paperTitle.value.trim(); const subtitle = elements.paperSubtitle.value.trim(); if (!files.length && !url) { elements.paperDropZone.classList.add("is-invalid"); elements.paperUrl.focus(); return; } const papers = files.map((file) => createImportedPaper({ file, title, subtitle })); if (url) papers.push(createImportedPaper({ url, title, subtitle })); activeProject().papers.unshift(...papers); saveState(); elements.importDialog.close(); renderLibrary(); });
elements.paperSearch.addEventListener("input", (event) => { paperSearchValue = event.target.value; renderLibrary(); });
elements.paperStatusFilters.addEventListener("click", (event) => { const button = event.target.closest("[data-status]"); if (!button) return; paperStatusFilter = button.dataset.status; elements.paperStatusFilters.querySelectorAll(".paper-filter").forEach((item) => item.classList.toggle("is-active", item === button)); renderLibrary(); });
elements.batchAnalyzeButton.addEventListener("click", () => enqueueBatchAnalysis([...selectedPaperIds]));
elements.closeDetailButton.addEventListener("click", () => elements.paperDetailDialog.close());
elements.detailReanalyzeButton.addEventListener("click", () => { const paper = activeProject().papers.find((item) => item.id === detailPaperId); if (paper) analyzePaper(paper.id); });
elements.toggleAgentPanel.addEventListener("click", () => setAgentPanel(true));
elements.closeAgentPanel.addEventListener("click", () => setAgentPanel(false));
elements.agentComposer.addEventListener("submit", submitAgentSuggestion);
elements.applyAgentSuggestion.addEventListener("click", applySuggestion);
elements.detailPdfButton.addEventListener("click", () => { const paper = activeProject().papers.find((item) => item.id === detailPaperId); if (paper) showEvidence({ label: "论文原文", text: paper.pdfName ? `${paper.pdfName} 已保存到当前文献记录中。` : "当前原型仅保存文献元数据，后续接入 PDF 查看器。", page: "PDF" }); });
elements.detailExportButton.addEventListener("click", exportPaper);
elements.closeEvidenceButton.addEventListener("click", () => elements.evidenceDialog.close());
elements.evidencePdfButton.addEventListener("click", () => elements.evidenceDialog.close());

const methodFieldBindings = [["methodProblemInput", "problem"], ["methodGoalInput", "goal"], ["methodConstraintsInput", "constraints"], ["methodMotivationInput", "motivation"], ["methodObservationInput", "observation"], ["methodHypothesisInput", "hypothesis"], ["methodInterventionInput", "intervention"], ["methodEffectInput", "effect"]];
methodFieldBindings.forEach(([id, key]) => elements[id].addEventListener("input", (event) => { methodDesignData().fields[key] = event.target.value; saveState(); }));
elements.methodAssistButton.addEventListener("click", () => { const data = methodDesignData(); data.assisted = true; saveState(); renderMethodCanvas(); });
document.querySelectorAll("[data-method-source]").forEach((button) => button.addEventListener("click", () => button.classList.toggle("is-selected")));

renderAll();
if (activeProject().phase === 0) renderLibrary();
saveState();
const BACKEND_API_BASE = 'http://127.0.0.1:8787/api';

function paperFromServer(data) {
  const paper = makePaper(data);
  paper.id = data.id || paper.id;
  return paper;
}

async function backendRequest(path, options = {}) {
  const response = await fetch(`${BACKEND_API_BASE}${path}`, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = body.detail;
    const error = new Error(typeof detail === 'string' ? detail : detail?.message || `后端请求失败：HTTP ${response.status}`);
    error.status = response.status;
    error.detail = detail;
    throw error;
  }
  return body;
}

function renderAgentSettingsFields() {
  const protocol = elements.agentProtocol.value;
  const usesCodex = protocol === 'codex' || protocol === 'codex_cli';
  elements.agentApiBaseGroup.hidden = usesCodex;
  elements.codexSettingsGroup.hidden = !usesCodex;
  elements.agentKeyState.textContent = agentConfig?.api_key_configured ? `已配置 · ${agentConfig.api_key_source === 'browser' ? '本次会话' : agentConfig.api_key_source}` : '未配置';
}

function fillAgentSettings(config) {
  agentConfig = config;
  elements.agentProtocol.value = config.protocol === 'codex_cli' ? 'codex' : config.protocol || 'codex';
  elements.agentApiBase.value = config.api_base_url || '';
  elements.agentModel.value = config.model || '';
  elements.agentApiKey.value = '';
  elements.clearAgentKey.checked = false;
  elements.codexExecutable.value = config.codex_executable || 'codex';
  elements.codexModel.value = config.codex_model || '';
  elements.agentSettingsStatus.textContent = config.api_key_configured ? `当前已配置 Agent（${config.api_key_source}）。密钥不会回显。` : '尚未配置 API Key；Codex CLI 可使用本机登录状态。';
  renderAgentSettingsFields();
}

async function loadAgentSettings() {
  try {
    fillAgentSettings(await backendRequest('/agent-config'));
  } catch (error) {
    elements.agentSettingsStatus.textContent = `无法读取 Agent 配置：${error.message}`;
  }
}

async function saveAgentSettings(event) {
  event.preventDefault();
  const submitButton = elements.saveAgentSettingsButton;
  submitButton.disabled = true;
  const payload = {
    protocol: elements.agentProtocol.value,
    api_base_url: elements.agentApiBase.value.trim(),
    model: elements.agentModel.value.trim(),
    codex_executable: elements.codexExecutable.value.trim(),
    codex_model: elements.codexModel.value.trim(),
    clear_api_key: elements.clearAgentKey.checked,
  };
  const apiKey = elements.agentApiKey.value.trim();
  if (apiKey) payload.api_key = apiKey;
  try {
    const result = await backendRequest('/agent-config', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    fillAgentSettings(result);
    elements.agentSettingsDialog.close();
    setSaveStatus('Agent 设置已更新');
  } catch (error) {
    elements.agentSettingsStatus.textContent = error.message;
    setSaveStatus(error.message, true);
  } finally {
    submitButton.disabled = false;
  }
}

function taskSummaryForPaper(tasks, paperId) {
  const latest = new Map();
  tasks.filter((task) => task.paper_id === paperId && task.operation === 'generate').forEach((task) => {
    const previous = latest.get(task.section);
    if (!previous || String(task.created_at || '') > String(previous.created_at || '')) latest.set(task.section, task);
  });
  const values = [...latest.values()];
  if (!values.length) return null;
  const active = values.filter((task) => ['queued', 'running'].includes(task.status)).length;
  const done = values.filter((task) => task.status === 'completed').length;
  const failed = values.filter((task) => task.status === 'failed').length;
  return { total: values.length, done, failed, active };
}

function applyTaskSummaries(tasks) {
  const project = activeProject();
  savedSuggestions.clear();
  tasks.filter((task) => task.suggestion_available && task.status === 'completed').reverse().forEach((task) => savedSuggestions.set(`${task.paper_id}:${task.section}`, task));
  project.papers.forEach((paper) => {
    paper.taskSummary = taskSummaryForPaper(tasks, paper.id);
    const summary = paper.taskSummary;
    if (summary?.active) paper.status = 'analyzing';
    else if (summary && summary.done === summary.total && summary.failed === 0 && summary.total === detailTabs.length) paper.status = 'analyzed';
    else if (summary && paper.status === 'analyzing') paper.status = 'pending';
  });
  saveState();
  renderLibrary();
  if (elements.paperDetailDialog.open) renderAgentTaskState();
}

function updatePaperStatusFromSections(paper) {
  const sections = paperSections(paper);
  const complete = detailTabs.every(([key]) => String(sections[key]?.content || '').trim());
  if (complete) paper.status = 'analyzed';
  else if (paper.status === 'analyzing' && !paper.taskSummary?.active) paper.status = 'pending';
}

function stopTaskPolling() {
  if (taskStatusPollTimer) window.clearTimeout(taskStatusPollTimer);
  taskStatusPollTimer = null;
}

function scheduleTaskPolling(paperIds = []) {
  stopTaskPolling();
  const poll = async () => {
    try {
      const tasks = await backendRequest('/agent-tasks');
      applyTaskSummaries(tasks);
      const active = tasks.some((task) => ['queued', 'running'].includes(task.status));
      const count = tasks.filter((task) => ['queued', 'running'].includes(task.status)).length;
      if (count) setSaveStatus(`正在分析 ${count} 项`);
      if (detailPaperId && elements.paperDetailDialog.open) {
        const currentTask = activeAgentTaskId ? tasks.find((task) => task.id === activeAgentTaskId) : null;
        if (currentTask) updateAgentTask(currentTask);
        if (paperIds.includes(detailPaperId)) void loadPaperSections(detailPaperId, !active);
      }
      if (active) taskStatusPollTimer = window.setTimeout(poll, 1200);
    } catch (error) {
      setSaveStatus(error.message, true);
    }
  };
  void poll();
}

async function enqueueBatchAnalysis(paperIds) {
  const ids = [...new Set(paperIds.filter(Boolean))];
  if (!ids.length) return;
  ids.forEach((id) => {
    const paper = activeProject().papers.find((item) => item.id === id);
    if (paper) { paper.status = 'analyzing'; paper.error = ''; }
  });
  saveState();
  renderLibrary();
  try {
    const result = await backendRequest('/agent-tasks/batch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paper_ids: ids }) });
    selectedPaperIds.clear(); updateBatchAnalyzeButton();
    ids.forEach((id) => { const paper = activeProject().papers.find((item) => item.id === id); if (paper && !result.queued) updatePaperStatusFromSections(paper); });
    setSaveStatus(result.queued ? `已加入 ${result.queued} 项分析任务` : '没有空白栏需要生成');
    scheduleTaskPolling(ids);
    if (detailPaperId && ids.includes(detailPaperId) && elements.paperDetailDialog.open) renderPaperDetail();
    return result;
  } catch (error) {
    ids.forEach((id) => { const paper = activeProject().papers.find((item) => item.id === id); if (paper) paper.status = 'pending'; });
    saveState(); renderLibrary(); setSaveStatus(error.message, true);
  }
}

async function loadPaperSections(paperId, rerender = true) {
  try {
    const result = await backendRequest(`/papers/${encodeURIComponent(paperId)}/sections`);
    const paper = activeProject().papers.find((item) => item.id === paperId);
    if (!paper) return;
    const sections = result.sections;
    Object.keys(sections).forEach((sectionKey) => {
      if (dirtySections.has(`${paperId}:${sectionKey}`)) sections[sectionKey] = paperSections(paper)[sectionKey];
    });
    paper.sections = sections;
    updatePaperStatusFromSections(paper);
    saveState();
    if (rerender && detailPaperId === paperId && elements.paperDetailDialog.open && !dirtySections.has(`${paperId}:${detailTab}`)) renderPaperDetail();
  } catch (error) {
    setSaveStatus(error.message, true);
  }
}

function scheduleSectionSave(paperId, sectionKey) {
  const paper = activeProject().papers.find((item) => item.id === paperId);
  const section = paper ? paperSections(paper)[sectionKey] : null;
  if (!section) return;
  const key = `${paperId}:${sectionKey}`;
  section.content = elements.sectionEditorInput.value;
  section.source = 'user';
  dirtySections.add(key);
  elements.sectionEditorStatus.textContent = '保存中…';
  saveState();
  if (sectionSaveTimers.has(key)) window.clearTimeout(sectionSaveTimers.get(key));
  sectionSaveTimers.set(key, window.setTimeout(() => { sectionSaveTimers.delete(key); void persistSection(paperId, sectionKey); }, 650));
}

async function persistSection(paperId, sectionKey) {
  const key = `${paperId}:${sectionKey}`;
  if (sectionSaveTimers.has(key)) { window.clearTimeout(sectionSaveTimers.get(key)); sectionSaveTimers.delete(key); }
  if (sectionSavesInFlight.has(key)) {
    try { await sectionSavesInFlight.get(key); } catch { return; }
    if (dirtySections.has(key)) return persistSection(paperId, sectionKey);
    return;
  }
  if (!dirtySections.has(key)) return;
  const paper = activeProject().papers.find((item) => item.id === paperId);
  if (!paper) return;
  const section = paperSections(paper)[sectionKey];
  const content = section.content;
  const request = backendRequest(`/papers/${encodeURIComponent(paperId)}/sections/${encodeURIComponent(sectionKey)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content, base_revision: section.revision || 0 }) });
  sectionSavesInFlight.set(key, request);
  let changedDuringSave = false;
  try {
    const result = await request;
    const draft = section.content;
    Object.assign(section, result.section);
    if (draft !== content) {
      section.content = draft;
      changedDuringSave = true;
    } else {
      dirtySections.delete(key);
      if (detailPaperId === paperId && detailTab === sectionKey) {
        elements.sectionEditorStatus.textContent = `修订 ${section.revision}`;
        elements.sectionEditorHint.textContent = `最后保存：${section.updated_at}`;
      }
    }
    saveState(); renderLibrary();
  } catch (error) {
    if (error.status === 409 && error.detail?.section) section.revision = error.detail.section.revision;
    if (detailPaperId === paperId && detailTab === sectionKey) elements.sectionEditorStatus.textContent = '保存冲突，草稿仍在编辑框中';
    setSaveStatus(error.message, true);
  } finally {
    sectionSavesInFlight.delete(key);
  }
  if (changedDuringSave) return persistSection(paperId, sectionKey);
}

function renderAgentTaskState() {
  if (!activeAgentTaskId || activeAgentPaperId !== detailPaperId || activeAgentSection !== detailTab) {
    const suggestion = savedSuggestions.get(`${detailPaperId}:${detailTab}`);
    if (suggestion && (!activeAgentTaskId || activeAgentPaperId !== detailPaperId || activeAgentSection !== detailTab)) {
      activeAgentTaskId = suggestion.id;
      activeAgentPaperId = suggestion.paper_id;
      activeAgentSection = suggestion.section;
      activeAgentTask = suggestion;
      pendingOverrideRevision = null;
    }
  }
  if (!activeAgentTaskId || activeAgentPaperId !== detailPaperId || activeAgentSection !== detailTab) {
    elements.agentTaskState.hidden = true;
    elements.agentSuggestion.hidden = true;
    return;
  }
  if (activeAgentTask) updateAgentTask(activeAgentTask);
}

function updateAgentTask(task) {
  if (!task || task.id !== activeAgentTaskId) return;
  activeAgentTask = task;
  if (activeAgentPaperId !== detailPaperId || activeAgentSection !== detailTab) return;
  elements.agentTaskState.hidden = false;
  elements.agentTaskState.textContent = task.status === 'queued' ? '已加入队列，等待 Agent 处理…' : task.status === 'running' ? 'Agent 正在核对论文并生成建议…' : task.status === 'failed' ? `生成失败：${task.error || '未知错误'}` : '建议已生成，请查看后应用。';
  elements.agentSendButton.disabled = ['queued', 'running'].includes(task.status);
  if (task.status === 'completed' && task.suggestion_available) {
    elements.agentSuggestionInput.value = task.result || '';
    elements.agentSuggestion.hidden = false;
    elements.applyAgentSuggestion.textContent = pendingOverrideRevision === null ? '应用建议' : '确认覆盖当前栏';
  } else if (task.status !== 'completed') elements.agentSuggestion.hidden = true;
  if (task.status === 'completed' || task.status === 'failed') setSaveStatus(task.status === 'completed' ? 'Agent 建议已生成' : task.error || 'Agent 任务失败', task.status === 'failed');
}

async function submitAgentSuggestion(event) {
  event.preventDefault();
  const paper = activeProject().papers.find((item) => item.id === detailPaperId);
  const section = paper ? paperSections(paper)[detailTab] : null;
  const instruction = elements.agentPrompt.value.trim();
  if (!paper || !section || !instruction) return;
  const sectionKey = detailTab;
  await persistSection(paper.id, sectionKey);
  if (dirtySections.has(`${paper.id}:${sectionKey}`)) { setSaveStatus('请先处理未保存的编辑，再让 Agent 修改', true); return; }
  elements.agentSendButton.disabled = true;
  elements.agentSuggestion.hidden = true;
  try {
    const result = await backendRequest(`/papers/${encodeURIComponent(paper.id)}/sections/${encodeURIComponent(sectionKey)}/suggest`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ instruction, base_revision: section.revision || 0 }) });
    activeAgentTaskId = result.task.id;
    activeAgentPaperId = paper.id;
    activeAgentSection = sectionKey;
    pendingOverrideRevision = null;
    elements.agentPrompt.value = '';
    updateAgentTask(result.task);
    scheduleTaskPolling([paper.id]);
  } catch (error) {
    elements.agentSendButton.disabled = false;
    setSaveStatus(error.message, true);
  }
}

async function applySuggestion() {
  if (!activeAgentTaskId) return;
  await persistSection(activeAgentPaperId, activeAgentSection);
  if (dirtySections.has(`${activeAgentPaperId}:${activeAgentSection}`)) {
    setSaveStatus('请先处理未保存的编辑，再应用建议', true);
    return;
  }
  try {
    const result = await backendRequest(`/agent-tasks/${encodeURIComponent(activeAgentTaskId)}/apply`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expected_revision: pendingOverrideRevision }) });
    const paper = activeProject().papers.find((item) => item.id === result.section.paper_id);
    const appliedSectionKey = result.section.section || detailTab;
    if (paper) paper.sections[appliedSectionKey] = result.section;
    elements.agentSuggestion.hidden = true;
    activeAgentTaskId = null;
    activeAgentTask = null;
    pendingOverrideRevision = null;
    savedSuggestions.delete(`${result.section.paper_id}:${appliedSectionKey}`);
    saveState(); renderPaperDetail(); renderLibrary(); setSaveStatus('建议已应用');
  } catch (error) {
    if (error.status === 409 && error.detail?.section) {
      const paper = activeProject().papers.find((item) => item.id === error.detail.section.paper_id);
      if (paper && !dirtySections.has(`${paper.id}:${error.detail.section.section}`)) paper.sections[error.detail.section.section] = error.detail.section;
      pendingOverrideRevision = error.detail.section.revision;
      elements.agentTaskState.textContent = '这一栏已有更新。请对照当前正文和建议，再决定是否覆盖。';
      elements.applyAgentSuggestion.textContent = '确认覆盖当前栏';
      elements.agentSuggestion.hidden = false;
      setSaveStatus('建议未覆盖你的修改', true);
      return;
    }
    setSaveStatus(error.message, true);
  }
}

async function hydrateServerPapers() {
  try {
    const serverPapers = await backendRequest('/papers');
    const project = activeProject();
    serverPapers.forEach((serverPaper) => {
      const localPaper = project.papers.find((paper) => paper.id === serverPaper.id);
      if (localPaper) Object.assign(localPaper, serverPaper);
      else project.papers.unshift(paperFromServer(serverPaper));
    });
    saveState();
    renderLibrary();
    setSaveStatus('已连接本地文献服务');
  } catch (error) {
    setSaveStatus('文献服务未启动', true);
  }
}

async function analyzePaper(id) {
  return enqueueBatchAnalysis([id]);
}

elements.importForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  const files = [...elements.paperFileInput.files];
  const url = elements.paperUrl.value.trim();
  const title = elements.paperTitle.value.trim();
  const subtitle = elements.paperSubtitle.value.trim();
  if (!files.length && !url) {
    elements.paperDropZone.classList.add('is-invalid');
    elements.paperUrl.focus();
    return;
  }
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file, file.name));
  if (url) formData.append('source_url', url);
  if (title) formData.append('title', title);
  if (subtitle) formData.append('subtitle', subtitle);
  const submitButton = elements.importForm.querySelector('button[type=submit]');
  if (submitButton) submitButton.disabled = true;
  try {
    const result = await backendRequest('/import', { method: 'POST', body: formData });
    activeProject().papers.unshift(...result.papers.map(paperFromServer));
    saveState();
    elements.importDialog.close();
    renderLibrary();
    setSaveStatus(`已导入 ${result.papers.length} 篇文献并保存到 data`);
  } catch (error) {
    setSaveStatus(error.message, true);
  } finally {
    if (submitButton) submitButton.disabled = false;
  }
}, true);

elements.detailPdfButton.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  const paper = activeProject().papers.find((item) => item.id === detailPaperId);
  if (paper?.id) window.open(`${BACKEND_API_BASE}/papers/${encodeURIComponent(paper.id)}/file`, '_blank', 'noopener');
}, true);

void hydrateServerPapers();
scheduleTaskPolling();
function analysisValue(value, fallback = '未找到') {
  return escapeHtml(value === undefined || value === null || value === '' ? fallback : value);
}

function analysisArray(value) {
  return Array.isArray(value) ? value : [];
}

function analysisEvidenceButton(index, evidence) {
  const item = evidence[index] || evidence[0] || { label: '证据未标注' };
  return `<button class='evidence-link' type='button' data-evidence-index='${index}'>查看证据 · ${analysisValue(item.label)} →</button>`;
}

function renderDetailTab(analysis, tab) {
  const evidence = analysisArray(analysis.evidence);
  if (tab === 'overview') {
    const metadata = analysis.metadata || {};
    return `<div class='detail-overview'><div class='detail-lead'><span>AI 摘要</span><p>${analysisValue(analysis.summary)}</p></div><div class='detail-columns'><section class='detail-block'><h3>研究判断</h3><p>${analysisValue(analysis.question?.core)}</p><p class='detail-muted'>研究范围：${analysisValue(analysis.question?.scope)}</p></section><section class='detail-block'><h3>文献元数据</h3><p>${analysisValue(metadata.authors?.join?.(', '))}</p><p>${analysisValue(metadata.venue)} ${analysisValue(metadata.year, '')}</p><div class='paper-tags'>${analysisArray(metadata.keywords).map((item) => `<span>#${analysisValue(item)}</span>`).join('')}</div></section></div>${analysisEvidenceButton(0, evidence)}</div>`;
  }
  if (tab === 'question') return `<div class='detail-section'><h3>研究背景</h3><p>${analysisValue(analysis.question?.background)}</p><h3>核心问题</h3><p class='quote-block'>${analysisValue(analysis.question?.core)}</p><h3>为什么重要</h3><p>${analysisValue(analysis.question?.importance)}</p><h3>研究范围与假设</h3><p>${analysisValue(analysis.question?.scope)}</p><ul>${analysisArray(analysis.question?.assumptions).map((item) => `<li>${analysisValue(item)}</li>`).join('')}</ul><h3>现有方法的不足</h3><ul>${analysisArray(analysis.question?.gap).map((item) => `<li>${analysisValue(item)}</li>`).join('')}</ul></div>`;
  if (tab === 'contributions') return `<div class='detail-section'><div class='detail-section-title'><div><span class='panel-kicker'>CONTRIBUTIONS</span><h3>核心贡献</h3></div><strong>${analysisArray(analysis.contributions).length} 项</strong></div><div class='contribution-list'>${analysisArray(analysis.contributions).map((item, index) => `<section class='contribution-item'><span class='contribution-number'>${String(index + 1).padStart(2, '0')}</span><div><h3>${analysisValue(item.title)}</h3><span class='type-badge'>${analysisValue(item.type)}</span><p>${analysisValue(item.description)}</p><small>相比已有工作：${analysisValue(item.compared)}</small><small>新颖性判断：${analysisValue(item.novelty)} · 置信度：${analysisValue(item.confidence)}</small>${analysisEvidenceButton(item.evidence || 0, evidence)}</div></section>`).join('')}</div></div>`;
  if (tab === 'method') {
    const method = analysis.method || {};
    return `<div class='detail-section'><h3>方法概览</h3><p>${analysisValue(method.overview)}</p><h3>方法流程</h3><ol class='method-list'>${analysisArray(method.steps).map((item) => `<li>${analysisValue(item)}</li>`).join('')}</ol><h3>核心组件</h3><div class='info-grid'>${analysisArray(method.components).map((item) => `<div><strong>${analysisValue(item.name)}</strong><p>输入：${analysisValue(item.input)}</p><p>操作：${analysisValue(item.operation)}</p><p>输出：${analysisValue(item.output)}</p></div>`).join('')}</div><h3>算法、公式与损失</h3><ul>${analysisArray(method.algorithm).concat(analysisArray(method.equations), analysisArray(method.losses)).map((item) => `<li>${analysisValue(item)}</li>`).join('')}</ul><div class='info-grid'><div><span>训练</span><p>${analysisValue(method.training)}</p></div><div><span>推理</span><p>${analysisValue(method.inference)}</p></div><div><span>超参数</span><p>${analysisValue(analysisArray(method.hyperparameters).join(' · '))}</p></div><div><span>复杂度与实现</span><p>${analysisValue(method.complexity)} ${analysisValue(method.implementation, '')}</p></div></div></div>`;
  }
  if (tab === 'experiment') {
    const experiment = analysis.experiment || {};
    const datasets = analysisArray(experiment.datasets).map((item) => typeof item === 'string' ? `<li>${analysisValue(item)}</li>` : `<li><strong>${analysisValue(item.name)}</strong> · ${analysisValue(item.split)}<br>${analysisValue(item.purpose)} ${analysisValue(item.notes, '')}</li>`).join('');
    const baselines = analysisArray(experiment.baselines).map((item) => typeof item === 'string' ? `<li>${analysisValue(item)}</li>` : `<li><strong>${analysisValue(item.name)}</strong> · ${analysisValue(item.category)} · ${analysisValue(item.comparison)}</li>`).join('');
    const metrics = analysisArray(experiment.metrics).map((item) => typeof item === 'string' ? `<li>${analysisValue(item)}</li>` : `<li><strong>${analysisValue(item.name)}</strong> ${analysisValue(item.direction)} · ${analysisValue(item.definition)}</li>`).join('');
    return `<div class='detail-section'><h3>数据集与基线</h3><div class='info-grid'><div><span>数据集</span><ul>${datasets || '<li>未在文中找到</li>'}</ul></div><div><span>Baselines</span><ul>${baselines || '<li>未在文中找到</li>'}</ul></div><div><span>评价指标</span><ul>${metrics || '<li>未在文中找到</li>'}</ul></div></div><h3>实验设置</h3><p>${analysisValue(experiment.setup)}</p><p>训练预算：${analysisValue(experiment.training_budget)}</p><p>硬件：${analysisValue(experiment.hardware)} · 软件：${analysisValue(experiment.software)}</p><h3>消融与可复现性</h3><ul>${analysisArray(experiment.ablations).concat(analysisArray(experiment.reproducibility)).map((item) => `<li>${analysisValue(item)}</li>`).join('')}</ul></div>`;
  }
  if (tab === 'results') return `<div class='detail-section'><h3>主要结果</h3><div class='result-table'><div class='result-row result-head'><span>指标</span><span>本文方法</span><span>基线</span><span>变化</span></div>${analysisArray(analysis.results).map((item) => `<div class='result-row'><strong>${analysisValue(item.metric)}</strong><span>${analysisValue(item.proposed)}</span><span>${analysisValue(item.baseline)}</span><em>${analysisValue(item.delta)}</em><p>${analysisValue(item.setting)} ${analysisValue(item.interpretation)}</p>${analysisEvidenceButton(item.evidence || 0, evidence)}</div>`).join('')}</div></div>`;
  if (tab === 'limitations') return `<div class='detail-section'><h3>局限性与风险</h3><div class='contribution-list'>${analysisArray(analysis.limitations).map((item) => `<section class='contribution-item'><span class='contribution-number'>${analysisValue(item.severity)}</span><div><h3>${analysisValue(item.item)}</h3><p>${analysisValue(item.impact)}</p><small>适用条件：${analysisValue(item.condition)} · 来源：${analysisValue(item.source)}</small>${analysisEvidenceButton(item.evidence || 0, evidence)}</div></section>`).join('')}</div></div>`;
  return `<div class='detail-section'><h3>研究启发与后续计划</h3><div class='contribution-list'>${analysisArray(analysis.inspiration).map((item) => `<section class='contribution-item'><span class='contribution-number'>${analysisValue(item.priority)}</span><div><h3>${analysisValue(item.idea)}</h3><p>研究缺口：${analysisValue(item.gap)}</p><p>理由：${analysisValue(item.rationale)}</p><p>验证方案：${analysisValue(item.experiment)}</p><small>风险：${analysisValue(item.risk)}</small>${analysisEvidenceButton(item.evidence || 0, evidence)}</div></section>`).join('')}</div></div>`;
}
function makePaper(data = {}) {
  const paper = { id: data.id || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, title: data.title || '未命名文献', subtitle: data.subtitle || '等待补充论文副标题', authors: data.authors || '待补充作者信息', venue: data.venue || 'PDF 文献', year: String(data.year || ''), tags: data.tags || ['待整理'], summary: data.summary || '这篇论文已保存，点击生成八项分析后填充空白栏。', status: data.status || 'pending', source: data.source || '', pdfName: data.pdfName || '', title_customized: Boolean(data.title_customized), subtitle_customized: Boolean(data.subtitle_customized), analysis: data.analysis || null, sections: data.sections || null, taskSummary: data.taskSummary || null, error: data.error || '' };
  return paper;
}
function updateSelectedFileNames() {
  const names = [...elements.paperFileInput.files].map((file) => file.name);
  elements.selectedFileNames.textContent = names.length ? names.join('、') : '支持 PDF，文件会保存到 data';
}

elements.agentSettingsButton.addEventListener('click', async () => {
  await loadAgentSettings();
  elements.agentSettingsDialog.showModal();
});
elements.closeAgentSettingsButton.addEventListener('click', () => elements.agentSettingsDialog.close());
elements.cancelAgentSettingsButton.addEventListener('click', () => elements.agentSettingsDialog.close());
elements.agentSettingsForm.addEventListener('submit', saveAgentSettings);
elements.agentProtocol.addEventListener('change', renderAgentSettingsFields);
void loadAgentSettings();
