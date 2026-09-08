import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const SYSTEM_PROMPT =
  '你是一位资深的 AI 产品经理专家。请根据用户的指令、当前文档标题和已有内容，生成结构清晰、逻辑严密、符合行业标准的专业产品文档（如 PRD 的功能定义、用户故事、业务流程等）。请直接输出 Markdown 内容，不要带有任何客套话。'

const ANALYZE_SYSTEM_PROMPT = `你是一个顶级的 AI 产品经理助手。请分析用户输入的原始灵感或 Prompt 卡片内容，完成两件事：
1. 提取 2-3 个最精准的产品经理专业标签（必须带 # 号，如 #竞品分析, #交互优化, #数据埋点, #用户故事）。
2. 根据内容特征，智能推荐其最适合归入的平台模块。只能从以下三个模块中选择一个：'Docs'（文档中心）, 'Timeline'（会议纪要与行动线）, 'Competitor'（竞品调研）。
请严格返回以下 JSON 格式，不要包含任何解释性文字：
{
  "tags": ["#标签1", "#标签2"],
  "suggested_module": "Docs"
}`

const DECOMPOSE_SYSTEM_PROMPT = `你是一位顶级 AI 系统架构师兼资深 PM。请深度解析用户提供的 PRD 文档，将其拆解为：
1. 核心需求点 (Requirements：包含 title, description, priority)
2. 针对每个需求点，拆解出 1-3 个具体的 Claude Code 开发任务 (Tasks：包含 title, file_path, claude_command)。

注意：file_path 必须根据项目技术栈合理推断（如 src/app/...）；claude_command 必须是标准的 Claude Code 指令，例如 'Review the current implementation and add...'。

请严格返回如下 JSON 数组格式，不要包含任何 Markdown 包裹块或多余解释：
[
  {
    "title": "需求名称",
    "description": "需求描述",
    "priority": "p0/p1/p2",
    "tasks": [
      { "title": "任务名称", "file_path": "文件路径", "claude_command": "给 Claude 的特定指令" }
    ]
  }
]`

const GENERATE_MATRIX_SYSTEM_PROMPT = `你是一位顶尖的市场竞争战略专家。请深度解析用户提供的行业研究笔记或竞品描述文本。
你的任务是：提取出核心竞品，并将它们的特征横向展平、结构化。
你需要针对每个被提及的竞品，输出一个结构化的功能与维度映射（features_json），包含但不限于以下维度：'核心功能', '商业模式/价格', '目标用户', '优势', '劣势'。
请严格返回如下 JSON 数组格式，以便前端批量更新 competitors 表中的 features_json 字段。不要包含任何 Markdown 包裹块：
[
  {
    "name": "竞品名称",
    "features_json": {
      "核心功能": "...",
      "商业模式/价格": "...",
      "目标用户": "...",
      "优势": "...",
      "劣势": "..."
    }
  }
]`

const PROMPTS: Record<string, (title: string, content: string) => string> = {
  summary: (title, content) =>
    `请对以下文档内容进行深度分析，提取 3-5 个最核心的关键结论和决策要点。输出简洁清晰的 Markdown 要点格式（每行以 - 开头）：\n\n标题：${title}\n\n内容：${content}`,
  actions: (title, content) =>
    `请从以下文档中提取所有待办事项（Action Items / Todos），并以 Markdown 表格格式输出，必须包含三列：【任务项 | 责任人 | 截止时间】。如果原始文档未明确指定责任人或时间，请根据上下文合理推断并标注"待确认"。如果没有任何行动项，请输出"暂无行动项"。\n\n标题：${title}\n\n内容：${content}`,
}

const EXTRACT_TASKS_SYSTEM_PROMPT = `你是一位顶级全栈技术架构师与敏捷项目经理。无论用户提供的是会议纪要、产品需求文档(PRD)还是AI组件开发规约，你的唯一任务就是从中榨取、拆解出具体的、原子化的研发技术任务（如：UI组件绘制、状态机编写、API对接、权限修复等）。
请严格返回如下 JSON 数组格式，不要包含任何 Markdown 包裹块或多余解释：
[
  {
    "title": "任务名称",
    "priority": "p0/p1/p2",
    "status": "todo"
  }
]`

export async function POST(req: NextRequest) {
  const { action, title, content, prompt } = await req.json()

  if (!action) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  try {
    // 'generate' uses a system prompt + user prompt workflow
    if (action === 'generate') {
      const userContent = `## 当前文档标题\n${title || '未命名'}\n\n## 已有内容\n${content || '(空)'}\n\n## 用户指令\n${prompt || '请生成文档初稿'}`
      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
        max_tokens: 4096,
      })
      const result = completion.choices[0]?.message?.content || ''
      return NextResponse.json({ result })
    }

    // 'analyze_memo' returns structured JSON for auto-tagging
    if (action === 'analyze_memo') {
      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: ANALYZE_SYSTEM_PROMPT },
          { role: 'user', content: `标题：${title || '未命名'}\n\n内容：${content || ''}` },
        ],
        max_tokens: 512,
        response_format: { type: 'json_object' },
      })
      const raw = completion.choices[0]?.message?.content || '{}'
      try {
        const parsed = JSON.parse(raw)
        return NextResponse.json(parsed)
      } catch {
        return NextResponse.json({ tags: [], suggested_module: 'Docs' })
      }
    }

    // 'decompose_prd' uses a system prompt to extract requirements + tasks from PRD content
    if (action === 'decompose_prd') {
      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: DECOMPOSE_SYSTEM_PROMPT },
          { role: 'user', content: `## PRD 文档内容\n\n${content || ''}` },
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      })
      const raw = completion.choices[0]?.message?.content || '[]'
      try {
        const parsed = JSON.parse(raw)
        // Accept both a top-level array and an object with a "requirements" key
        const requirements = Array.isArray(parsed) ? parsed : (parsed.requirements || [])
        return NextResponse.json({ requirements })
      } catch {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      }
    }

    // 'generate_matrix' extracts structured competitor features from research notes or raw text
    if (action === 'generate_matrix') {
      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: GENERATE_MATRIX_SYSTEM_PROMPT },
          { role: 'user', content: content || '' },
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      })
      const raw = completion.choices[0]?.message?.content || '[]'
      try {
        const parsed = JSON.parse(raw)
        const competitors = Array.isArray(parsed) ? parsed : (parsed.competitors || [])
        return NextResponse.json({ competitors })
      } catch {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      }
    }

    // 'extract_tasks' uses a system prompt to extract dev tasks from any doc type
    if (action === 'extract_tasks') {
      if (!content) return NextResponse.json({ error: 'Missing params' }, { status: 400 })
      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: EXTRACT_TASKS_SYSTEM_PROMPT },
          { role: 'user', content: `## 文档标题\n${title || '未命名'}\n\n## 文档内容\n${content}` },
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      })
      const raw = completion.choices[0]?.message?.content || '[]'
      try {
        const parsed = JSON.parse(raw)
        const tasks = Array.isArray(parsed) ? parsed : (parsed.tasks || [])
        return NextResponse.json({ tasks })
      } catch {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
      }
    }

    // Existing actions require content
    if (!content) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: PROMPTS[action](title, content) }],
      max_tokens: 1024,
    })
    const result = completion.choices[0]?.message?.content || ''
    return NextResponse.json({ result })
  } catch (e) {
    return NextResponse.json({ error: 'AI call failed' }, { status: 500 })
  }
}
