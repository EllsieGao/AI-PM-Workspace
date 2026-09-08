'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Message } from '@/lib/types'
import MdRenderer from '@/components/shared/MdRenderer'

interface Props {
  messages: Message[]
  loading: boolean
  renderMessageFooter?: (msg: Message) => React.ReactNode
  onPromptSelect?: (prompt: string) => void
}

const SUGGESTIONS = [
  { emoji: '📝', title: '写 PRD', desc: '帮我写一份用户登录功能的 PRD' },
  { emoji: '📊', title: '提炼行动项', desc: '整理这段会议记录，提取行动项' },
  { emoji: '🔍', title: '竞品分析', desc: '分析 Notion 和 Obsidian 的核心差异' },
  { emoji: '💡', title: '需求拆解', desc: '把这个需求拆解成开发任务' },
]

export default function MessageList({ messages, loading, renderMessageFooter, onPromptSelect }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const turns = useMemo(() => {
    const result: Array<{ user?: Message; assistant?: Message }> = []
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]
      if (msg.role === 'user') {
        const next = messages[i + 1]
        if (next?.role === 'assistant') {
          result.push({ user: msg, assistant: next })
          i++
        } else {
          result.push({ user: msg })
        }
      } else {
        result.push({ assistant: msg })
      }
    }
    return result
  }, [messages])

  /* ── 空状态：欢迎界面 ── */
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-lg font-semibold text-gray-800 mb-1">
          你好，我是你的 AI PM 助手
        </div>
        <div className="text-xs text-gray-400 mb-6">
          选择下方的灵感方向，或直接输入你的需求
        </div>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          {SUGGESTIONS.map((item) => (
            <button
              key={item.title}
              onClick={() => onPromptSelect?.(item.desc)}
              className="group text-left p-4 rounded-xl border border-gray-200/60 bg-white
                         transition-all duration-300 cursor-pointer
                         hover:-translate-y-0.5 hover:shadow-md hover:border-amber-200/60"
            >
              <div className="text-lg mb-1.5">{item.emoji}</div>
              <div className="text-xs font-medium text-gray-700 mb-0.5">{item.title}</div>
              <div className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ── 对话流 ── */
  return (
    <div className="flex flex-col gap-8">
      {turns.map((turn, idx) => (
        <div key={idx} className="flex flex-col gap-2">
          {/* ── 用户提问：莫兰迪灰小胶囊 ── */}
          {turn.user && (
            <div className="flex justify-end w-full">
              <div
                className="max-w-[70%] rounded-2xl rounded-tr-sm bg-gray-50/80 px-4 py-2.5
                           text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words"
              >
                {turn.user.content}
              </div>
            </div>
          )}

          {/* ── AI 回答：通透杂志排版流 ── */}
          {turn.assistant && (
            <div className="group w-full">
              <div className="font-serif text-gray-800 leading-relaxed tracking-wide text-[15px]">
                <MdRenderer content={turn.assistant.content} variant="chat" />
              </div>

              {/* 底部微型工具栏 — hover 淡入 */}
              <div
                className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100
                           transition-opacity duration-200"
              >
                <button
                  onClick={() => {/* regenerate */}}
                  className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="重新生成"
                >
                  ↻
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(turn.assistant!.content)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
                  title="复制全文"
                >
                  ⎘
                </button>
                <button
                  onClick={() => {/* like */}}
                  className="text-xs text-neutral-400 hover:text-rose-400 transition-colors"
                  title="点赞"
                >
                  ♡
                </button>
              </div>

              {/* 保存到文档等扩展操作 */}
              {renderMessageFooter?.(turn.assistant)}
            </div>
          )}
        </div>
      ))}

      {/* ── 加载指示器 ── */}
      {loading && (
        <div className="flex justify-start px-1 py-1">
          <div
            className="w-16 h-[2px] rounded-full bg-gradient-to-r from-amber-200/40 to-rose-300/30 animate-pulse"
            style={{ animationDuration: '2.5s' }}
          />
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
