'use client'

import { useRef, useState, useEffect, useCallback, KeyboardEvent } from 'react'
import { PrdTemplate } from '@/lib/prdTemplates'
import TemplateSelector from './TemplateSelector'
import QuickCommands from './QuickCommands'

interface Props {
  onSend: (content: string, template?: PrdTemplate | null) => void
  disabled: boolean
  prefillPrompt?: string | null
  onPrefillConsumed?: () => void
}

export default function MessageInput({ onSend, disabled, prefillPrompt, onPrefillConsumed }: Props) {
  const [value, setValue] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<PrdTemplate | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)

  /* ── 接收来自灵感卡片的预填文本 ── */
  useEffect(() => {
    if (prefillPrompt) {
      setValue(prefillPrompt)
      onPrefillConsumed?.()
      setTimeout(() => textRef.current?.focus(), 0)
    }
  }, [prefillPrompt, onPrefillConsumed])

  const adjustHeight = useCallback(() => {
    const el = textRef.current
    if (!el) return
    el.style.height = 'auto'
    const lineHeight = 20
    const maxHeight = lineHeight * 5
    el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px'
  }, [])

  const handleSend = useCallback(() => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text, selectedTemplate)
    setSelectedTemplate(null)
    setValue('')
    if (textRef.current) textRef.current.style.height = 'auto'
  }, [value, disabled, onSend, selectedTemplate])

  const handleQuickCommand = useCallback((prompt: string) => {
    setValue(prompt)
    setTimeout(() => textRef.current?.focus(), 0)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  return (
    <div className="shrink-0 px-5 pb-4 pt-2 message-input">
      {/* 胶囊控制台 */}
      <div className="rounded-2xl border border-gray-200/80 shadow-sm bg-white p-4 transition-shadow duration-200 focus-within:ring-1 focus-within:ring-amber-200/40">
        {/* 快捷指令行 */}
        <div className="flex items-center gap-2 pb-3">
          <QuickCommands onSelect={handleQuickCommand} />
          <TemplateSelector onSelect={setSelectedTemplate} selected={selectedTemplate} />
        </div>

        {/* 输入框 + 发送按钮 */}
        <div className="flex gap-2 items-end">
          <textarea
            ref={textRef}
            value={value}
            onChange={e => { setValue(e.target.value); adjustHeight() }}
            onKeyDown={handleKeyDown}
            placeholder="输入你的 PM 需求，按 Enter 发送…"
            rows={1}
            className="flex-1 text-sm text-gray-800 bg-gray-50/50 border border-gray-200/60 rounded-xl px-3.5 py-2.5
                       outline-none resize-none leading-relaxed
                       placeholder:text-gray-400
                       transition-colors duration-200
                       focus:border-amber-200/60 focus:bg-white focus:ring-0"
            style={{ fontFamily: 'inherit' }}
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="h-9 w-9 rounded-xl border-none flex items-center justify-center shrink-0 text-base transition-all duration-200"
            style={{
              background: !value.trim() || disabled ? '#f5f3f0' : '#2d2a25',
              color: !value.trim() || disabled ? '#b5aba0' : '#ffffff',
              cursor: !value.trim() || disabled ? 'not-allowed' : 'pointer',
            }}
          >
            ↵
          </button>
        </div>

        {/* 底部模型信息 */}
        <div className="text-[11px] text-gray-400 text-center mt-3">
          DeepSeek · 对话自动保存
        </div>
      </div>
    </div>
  )
}
