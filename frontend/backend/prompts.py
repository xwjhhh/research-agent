'''Structured prompts for the literature analysis adapter.'''

SECTION_PROMPTS = {
    'metadata': 'Extract title, subtitle, all authors, year, venue, DOI, URL, keywords, paper type, and original abstract. Prefer the paper itself over filename guesses; use empty values when unverified.',
    'question': 'Explain the background, precise research question, importance, scope, assumptions, and prior-work gap. Separate author motivation from your own suggestions.',
    'contributions': 'List 3 to 6 substantive contributions. Explain what was introduced, the closest comparison, why it matters, confidence, and strongest evidence.',
    'method': 'Reconstruct the method for implementation: overview, steps, inputs, outputs, components, algorithms, equations, losses, training, inference, hyperparameters, complexity, and implementation details.',
    'experiment': 'Describe datasets, splits, baselines, metrics, hardware, software, training budget, preprocessing, ablations, protocol, repeated runs, and reproducibility.',
    'results': 'Extract concrete metric comparisons supported by tables, figures, or text. Include proposed value, baseline, delta, setting, direction, and interpretation.',
    'limitations': 'Identify author-acknowledged and evidence-visible limitations. Explain impact, conditions, severity, and evidence. Label inference as 分析推断.',
    'inspiration': 'Give 4 to 8 actionable follow-up ideas with gap, rationale, experiment, risk, and priority. Keep suggestions separate from paper claims.',
}

ANALYSIS_SYSTEM_PROMPT = chr(10).join([
    'You are a meticulous scientific literature analyst. Analyze only the supplied document context.',
    'Your answer is stored as a research record, so be precise, detailed, and explicit about uncertainty.',
    'Every factual claim must be supported by an evidence item with a page marker when possible.',
    'Never invent authors, venues, numbers, baselines, datasets, equations, or citations.',
    'Use 未在文中找到 for unknown facts, label inferences as 分析推断, and future suggestions as 研究建议.',
    'Return valid JSON only, without Markdown fences. Answer in Chinese but preserve official names.',
])

ANALYSIS_SCHEMA = chr(10).join([
    'Return one JSON object with exactly these top-level keys:',
    'summary, abstract_zh, metadata, question, contributions, method, experiment, results, limitations, inspiration, evidence.',
    'metadata = {title, subtitle, authors[], year, venue, doi, url, keywords[], paper_type, abstract}',
    'question = {background, core, importance, gap[], scope, assumptions[]}',
    'contributions[] = {title, type, description, compared, novelty, confidence, evidence}',
    'method = {overview, steps[], data, setup, components[], algorithm[], equations[], losses[], training, inference, hyperparameters[], complexity, implementation}',
    'method.components[] = {name, input, operation, output}',
    'experiment = {datasets[], baselines[], metrics[], setup, training_budget, hardware, software, ablations[], protocol, reproducibility[]}',
    'experiment.datasets[] = {name, split, purpose, notes}',
    'experiment.baselines[] = {name, category, comparison}',
    'experiment.metrics[] = {name, direction, definition}',
    'results[] = {metric, proposed, baseline, delta, setting, interpretation, evidence}',
    'limitations[] = {item, source, impact, condition, severity, evidence}',
    'inspiration[] = {idea, gap, rationale, experiment, risk, priority, evidence}',
    'evidence[] = {label, section, text, quote, page, confidence}',
    'Do not omit keys. Arrays may be empty. Cross-check every number and evidence index.',
])


def build_analysis_prompt(context: str, document_name: str) -> str:
    sections = chr(10).join(f'### {name}{chr(10)}{instruction}' for name, instruction in SECTION_PROMPTS.items())
    return f'Document name: {document_name}{chr(10)}{chr(10)}{sections}{chr(10)}{chr(10)}{ANALYSIS_SCHEMA}{chr(10)}{chr(10)}Source context with page markers:{chr(10)}--- BEGIN DOCUMENT CONTEXT ---{chr(10)}{context}{chr(10)}--- END DOCUMENT CONTEXT ---{chr(10)}{chr(10)}Keep the analysis rich: include implementation-level details, exact experiment settings, and concrete follow-up plans whenever the source supports them.'
