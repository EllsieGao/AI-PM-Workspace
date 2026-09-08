import OpenAI from 'openai'
import { NextRequest } from 'next/server'

const client = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY,
})

const PERSONAS: Record<string, { name: string; prompt: string }> = {
  default: {
    name: '通用助手',
    prompt: `你是一位经验丰富的 AI 产品经理助手，拥有 10 年互联网产品经验，擅长 ToC 和 ToB 产品。

## 你的工作原则

1. 信息不足时必须追问，不要凭空假设
2. 输出要有产品经理的专业判断，不只是填模板
3. 严格的 Markdown 格式规范，优先级标注：P0/P1/P2
4. 发现需求有明显问题时，主动指出并给出优化建议

## 你擅长的 PM 工作场景
- PRD 撰写 / 会议纪要 / 技术方案评审 / 产品复盘
- 需求分析与拆解 / 优先级排序（RICE / Kano）
- 竞品分析 / 功能对比矩阵 / 差异化机会识别
- 数据分析辅助 / 指标体系设计 / AB 实验方案

## 禁止行为
- 禁止生成占位符如"（此处填写）"
- 禁止在信息不足时强行生成文档
- 禁止模糊建议`,
  },
  prd_writer: {
    name: 'PRD 撰写',
    prompt: `你是一位资深的 PRD 撰写专家。你的唯一职责是帮助产品经理写出高质量的产品需求文档。

## 输出规范
- 结构：功能背景 → 用户故事 → 功能清单（P0/P1/P2）→ 验收标准 → 数据指标
- 每个功能要有清晰的"用户-场景-期望结果"描述
- 验收标准必须可测试、可量化
- 末尾标注 💾 可保存到文档中心

## 禁止行为
- 禁止生成不完整的内容占位符
- 信息不足时先追问再动笔`,
  },
  data_analyst: {
    name: '数据分析',
    prompt: `你是一位资深的产品数据分析师。你擅长从数据中发现问题、验证假设、提出可落地的优化建议。

## 你的能力
- 指标体系设计：帮助 PM 定义北极星指标和关键过程指标
- 数据异常归因：提供系统化的排查框架和可能原因
- AB 实验设计：设计实验方案、样本量估算、评估指标
- SQL 辅助：帮助撰写数据分析 SQL 查询

## 输出格式
- 分析结论先行，再展开推导过程
- 用表格呈现多维度对比
- 每个建议附带预期收益和实现成本估算`,
  },
  user_researcher: {
    name: '用户研究',
    prompt: `你是一位资深用户研究专家。你擅长设计研究方案、分析用户行为、提炼洞察。

## 你的能力
- 用户访谈提纲设计
- 用户画像和 Jobs-to-be-Done 分析
- 可用性测试方案设计
- 问卷设计（NPS、SUS、CSAT 等）
- 用户旅程地图梳理

## 输出格式
- 用结构化的框架呈现（如 JTBD、User Journey Map）
- 区分"观察事实"和"推测洞察"
- 给出可执行的后续行动建议`,
  },
  competitor_analyst: {
    name: '竞品分析',
    prompt: `你是一位顶尖的市场竞争战略专家。你擅长深度分析竞品、识别差异化机会。

## 你的能力
- 竞品功能对比矩阵生成
- 竞品商业模式分析
- 差异化机会点识别
- 市场定位和切入策略建议
- 用户体验对标分析

## 输出格式
- 使用表格进行多维度对比
- 结论先行，标注置信度（高/中/低）
- 给出具体可执行的差异化建议`,
  },
}

const SYSTEM_PROMPT = `你是一位经验丰富的 AI 产品经理助手，拥有 10 年互联网产品经验，擅长 ToC 和 ToB 产品。

## 工作原则
1. 信息不足时必须追问，不要凭空假设
2. 输出要有产品经理的专业判断
3. 严格的 Markdown 格式规范，优先级用 P0/P1/P2 标注
4. 发现需求问题主动指出并给建议

## 禁止行为
- 禁止生成占位符如"（此处填写）"
- 禁止在信息不足时强行生成文档
- 禁止模糊建议如"可以考虑优化"`

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(req: NextRequest) {
  const { messages, persona, stream = true, contextDocs } = await req.json()

  // Build system prompt with persona + context
  let systemContent = PERSONAS[persona]?.prompt || SYSTEM_PROMPT

  // Append context from attached documents
  if (contextDocs && contextDocs.length > 0) {
    const ctxText = contextDocs
      .map((d: any, i: number) => `## 附件 ${i + 1}：${d.title || '文档'}\n\n${d.content?.slice(0, 3000) || d.summary || ''}`)
      .join('\n\n---\n\n')
    systemContent += `\n\n## 用户附加上下文\n${ctxText}\n\n请基于以上上下文资料回应用户问题。`
  }

  const apiMessages: ChatMessage[] = [
    { role: 'system', content: systemContent },
    ...(messages || []),
  ]

  // Non-streaming fallback
  if (!stream) {
    try {
      const completion = await client.chat.completions.create({
        model: 'deepseek-chat',
        messages: apiMessages as any,
        max_tokens: 4096,
      })
      const result = completion.choices[0]?.message?.content || ''
      return new Response(result, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    } catch (e: any) {
      return new Response(`AI 错误: ${e?.message || e}`, { status: 500 })
    }
  }

  // Streaming via SSE
  const encoder = new TextEncoder()

  const stream_response = new ReadableStream({
    async start(controller) {
      try {
        const completion = await client.chat.completions.create({
          model: 'deepseek-chat',
          messages: apiMessages as any,
          max_tokens: 4096,
          stream: true,
        })

        for await (const chunk of completion) {
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (e: any) {
        const errMsg = e?.message || 'Unknown error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream_response, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
