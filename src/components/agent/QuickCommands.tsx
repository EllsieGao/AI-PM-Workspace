'use client'

import { useState } from 'react'

const COMMANDS = [
  {
    category: '文档生成',
    items: [
      { label: '写 PRD', prompt: '请帮我写一份产品需求文档，先问我需要了解的关键信息' },
      { label: '会议纪要', prompt: '请帮我整理会议纪要，我来粘贴会议内容' },
      { label: '技术方案', prompt: '请帮我写一份技术方案文档，先问我技术背景和需求' },
      { label: '产品复盘', prompt: '请帮我写一份产品复盘报告，先问我复盘周期和产品信息' },
    ],
  },
  {
    category: '需求分析',
    items: [
      { label: '拆解任务', prompt: '请帮我把以下需求拆解为开发任务，我来描述需求：' },
      { label: '评估需求', prompt: '请帮我评估以下需求的合理性和优先级，我来描述需求：' },
      { label: 'RICE 排序', prompt: '请用 RICE 模型帮我对以下需求进行优先级排序：' },
    ],
  },
  {
    category: '竞品分析',
    items: [
      { label: '竞品对比', prompt: '请帮我做竞品功能对比分析，先问我要对比哪些产品' },
      { label: '功能差异', prompt: '请分析以下两款产品的核心差异和各自的竞争优势：' },
    ],
  },
]

interface Props {
  onSelect: (prompt: string) => void
}

export default function QuickCommands({ onSelect }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: '12px',
          padding: '4px 10px',
          border: '0.5px solid var(--border2)',
          borderRadius: '4px',
          background: 'var(--surface)',
          color: 'var(--text2)',
          cursor: 'pointer',
        }}
      >
        ⚡ 快捷指令
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '36px',
            left: 0,
            background: 'var(--surface)',
            border: '0.5px solid var(--border2)',
            borderRadius: 'var(--r)',
            width: '280px',
            zIndex: 50,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            overflow: 'hidden',
          }}>
            {COMMANDS.map(group => (
              <div key={group.category}>
                <div style={{
                  padding: '7px 12px',
                  fontSize: '10px',
                  color: 'var(--text3)',
                  letterSpacing: '.06em',
                  textTransform: 'uppercase',
                  borderBottom: '0.5px solid var(--border)',
                  background: 'var(--surface2)',
                }}>
                  {group.category}
                </div>
                {group.items.map(item => (
                  <div
                    key={item.label}
                    onClick={() => {
                      onSelect(item.prompt)
                      setOpen(false)
                    }}
                    style={{
                      padding: '9px 14px',
                      fontSize: '13px',
                      color: 'var(--text2)',
                      cursor: 'pointer',
                      borderBottom: '0.5px solid var(--border)',
                      transition: 'background .1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
