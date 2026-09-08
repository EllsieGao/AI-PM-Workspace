'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Copy, Check, Zap, Bot } from 'lucide-react'
import type { Memo } from '@/store/useMemoStore'
import { useDocStore } from '@/store/docStore'

function relativeTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

interface Props {
  memo: Memo
  onDelete: (id: string) => void
  onTagClick: (tag: string) => void
}

export default function MemoCard({ memo, onDelete, onTagClick }: Props) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [promoting, setPromoting] = useState(false)
  const router = useRouter()
  const { createDoc, setPendingAiPrompt } = useDocStore()

  const handleCopy = () => {
    navigator.clipboard.writeText(memo.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleWritePRD = async () => {
    setPendingAiPrompt(memo.content)
    await createDoc('prd', memo.title)
    router.push('/docs')
  }

  const handlePromote = async () => {
    setPromoting(true)
    const docTitle = memo.title || `[草稿] 闪念：${memo.content.slice(0, 12)}…`
    try {
      const supabase = (await import('@/lib/supabase')).createClient()
      const { data } = await supabase
        .from('documents')
        .insert({ title: docTitle, content: memo.content, type: 'prd' })
        .select('*')
        .single()
      if (data) {
        if (confirm('✦ 该闪念已完美升格为正式文档草稿！是否立即跳转到文档中心查看？')) {
          router.push('/docs')
        }
      }
    } catch (e) {
      console.error('【AIPM】升格文档失败:', e)
    } finally {
      setPromoting(false)
    }
  }

  const isPrompt = memo.type === 'prompt'

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: hovered ? '0.5px solid var(--border2)' : '0.5px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '14px 16px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        position: 'relative',
        transition: 'border-color 0.15s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row: badge + time */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.3px',
            color: isPrompt ? 'var(--accent)' : '#60b8fa',
          }}
        >
          {isPrompt ? '✦ PROMPT' : '💡 IDEA'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
          {relativeTime(memo.created_at)}
        </span>
      </div>

      {/* Title */}
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, paddingRight: isPrompt ? 160 : 0 }}>
        {memo.title}
      </div>

      {/* Action buttons (Prompt only — card top-right) */}
      {isPrompt && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            display: 'flex',
            gap: 4,
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.2s',
          }}
        >
          <button
            onClick={handleWritePRD}
            title="创建 PRD 文档并注入此 Prompt"
            style={{
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 6,
              color: '#0f0d0b',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              whiteSpace: 'nowrap',
            }}
          >
            <Zap size={12} />
            一键智写PRD
          </button>
          <button
            onClick={handleCopy}
            style={{
              background: 'var(--surface2)',
              border: '0.5px solid var(--border)',
              borderRadius: 6,
              color: copied ? '#4ade9a' : 'var(--text2)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontSize: 10,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? '已复制' : '复制'}
          </button>
        </div>
      )}

      {/* Content — prompt gets a highlighted background */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            fontSize: 13,
            lineHeight: 1.7,
            color: isPrompt ? 'var(--text)' : 'var(--text2)',
            background: isPrompt ? 'var(--surface2)' : 'transparent',
            borderRadius: 6,
            padding: isPrompt ? '10px 12px' : 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {memo.content}
        </div>
      </div>

      {/* Tags */}
      {memo.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
          {memo.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              style={{
                fontSize: 10,
                fontWeight: 500,
                padding: '2px 8px',
                borderRadius: 10,
                border: '0.5px solid var(--border)',
                background: 'var(--surface2)',
                color: 'var(--text2)',
                cursor: 'pointer',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Bottom action buttons (visible on hover) */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          pointerEvents: hovered ? 'auto' : 'none',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => {
              const prompt = `请根据以下灵感内容，帮我扩展成一份完整的 PRD 文档草稿：\n\n---\n${memo.content}\n---\n\n请包含：功能背景、目标用户、核心功能清单、验收标准。`
              sessionStorage.setItem('agent_prefill', prompt)
              router.push('/agent')
            }}
            style={{
              background: '#fef3c7',
              border: '0.5px solid #fcd34d',
              borderRadius: 6,
              color: '#b45309',
              cursor: 'pointer',
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <Bot size={12} />
            Agent 展开
          </button>
          <button
            onClick={handlePromote}
            disabled={promoting}
            style={{
              background: promoting ? 'var(--surface2)' : 'transparent',
              border: '0.5px solid var(--border)',
              borderRadius: 6,
              color: promoting ? 'var(--text3)' : 'var(--accent)',
              cursor: promoting ? 'not-allowed' : 'pointer',
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {promoting ? '📦 升格中…' : '📦 升格文档'}
          </button>
        </div>

        <button
          onClick={() => {
            if (confirm('确认删除这条记录？')) onDelete(memo.id)
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text3)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
