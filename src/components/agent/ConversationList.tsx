'use client'

import { useState } from 'react'
import { useAgentStore } from '@/store/agentStore'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min}分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}小时前`
  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}天前`
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

export default function ConversationList({ onSelect }: { onSelect?: () => void }) {
  const {
    conversations,
    activeConversationId,
    startConversation,
    selectConversation,
    deleteConversation,
    toggleStar,
  } = useAgentStore()

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tabFilter, setTabFilter] = useState<'all' | 'starred'>('all')

  const displayed = tabFilter === 'starred'
    ? conversations.filter(c => c.is_starred)
    : conversations

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* New chat button */}
      <div style={{ padding: '14px 12px' }}>
        <button
          onClick={() => startConversation()}
          className="w-full py-2 text-sm font-medium rounded-xl text-center
                     bg-[#c9a55a] text-white
                     hover:brightness-110 hover:scale-[1.02] hover:shadow-sm
                     active:scale-[0.98]
                     transition-all duration-300 ease-out cursor-pointer border-none"
        >
          + 新建对话
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '0.5px solid var(--border)', marginBottom: 4, padding: '0 8px' }}>
        {(['all', 'starred'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setTabFilter(tab)}
            style={{
              fontSize: 12,
              padding: '6px 12px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              color: tabFilter === tab ? 'var(--text)' : 'var(--text3)',
              borderBottom: tabFilter === tab ? '1.5px solid var(--accent)' : '1.5px solid transparent',
              transition: 'all 0.15s',
              marginBottom: -0.5,
            }}
          >
            {tab === 'all' ? '全部' : '⭐ 收藏'}
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
        {displayed.length === 0 && (
          <div style={{ color: '#b5aba0', fontSize: 12, textAlign: 'center', padding: '20px 0' }}>
            还没有对话记录
          </div>
        )}

        {displayed.map(conv => {
          const active = conv.id === activeConversationId
          return (
            <div
              key={conv.id}
              onClick={() => { selectConversation(conv.id); onSelect?.() }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 4,
                padding: '9px 10px',
                borderRadius: 8,
                cursor: 'pointer',
                background: active ? '#f5f3f0' : 'transparent',
                color: active ? '#3d3833' : '#8a8075',
                fontSize: 12,
                marginBottom: 2,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { setHoveredId(conv.id); if (!active) e.currentTarget.style.background = '#f0eeeb' }}
              onMouseLeave={e => { setHoveredId(null); if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.is_starred && <span style={{ fontSize: 10, color: 'var(--accent)', marginRight: 4 }}>⭐</span>}
                    {conv.title}
                  </span>
                </div>
                {conv.is_starred && hoveredId === conv.id && (
                  <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>
                    取消收藏后可删除
                  </div>
                )}
              </div>
              <span style={{ fontSize: 10, color: '#b5aba0', flexShrink: 0 }}>
                {relativeTime(conv.updated_at)}
              </span>
              <button
                onClick={e => {
                  e.stopPropagation()
                  toggleStar(conv.id)
                }}
                title={conv.is_starred ? '取消收藏' : '收藏'}
                style={{
                  fontSize: 12,
                  border: 'none',
                  background: 'transparent',
                  color: conv.is_starred ? 'var(--accent)' : '#b5aba0',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  opacity: conv.is_starred ? 0.8 : 0,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = conv.is_starred ? '0.8' : '0' }}
              >
                ⭐
              </button>
              {conv.is_starred ? (
                <button
                  title="请先取消收藏再删除"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'not-allowed',
                    color: 'var(--text3)',
                    opacity: 0.3,
                    fontSize: '14px',
                    padding: '2px 4px',
                  }}
                >
                  ×
                </button>
              ) : (
                <button
                  onClick={e => {
                    e.stopPropagation()
                    if (confirm('确认删除这条对话？')) deleteConversation(conv.id)
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text3)',
                    fontSize: '14px',
                    padding: '2px 4px',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--red)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
                >
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
