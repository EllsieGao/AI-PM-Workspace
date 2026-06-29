'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAgentStore } from '@/store/agentStore'
import { PrdTemplate } from '@/lib/prdTemplates'
import ConversationList from './ConversationList'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import SaveToDocButton from './SaveToDocButton'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export default function AgentPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    loading,
    fetchConversations,
    sendMessage,
    startConversation,
  } = useAgentStore()

  const [prefillPrompt, setPrefillPrompt] = useState<string | null>(null)

  // 接收来自灵感速记 / 竞品雷达的预填 Prompt，自动发送
  useEffect(() => {
    const stored = sessionStorage.getItem('agent_prefill')
    if (stored) {
      sessionStorage.removeItem('agent_prefill')
      // 延迟确保 store 初始化完毕
      setTimeout(() => sendMessage(stored), 300)
    }
  }, [])
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const handleSend = useCallback(async (content: string, template?: PrdTemplate | null) => {
    let finalContent = content
    if (template) {
      finalContent = `请帮我写一份 PRD。\n\n需求描述：${content}\n\n${template.structure}`
    }
    await sendMessage(finalContent)
  }, [sendMessage])

  const activeConv = conversations.find(c => c.id === activeConversationId)

  if (isMobile) {
    return (
      <div className="agent-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#FDFBF7' }}>
        {/* Drawer overlay */}
        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          }} />
        )}
        {/* Drawer */}
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
          background: 'var(--sidebar)', zIndex: 201,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease', overflowY: 'auto',
        }}>
          <div style={{
            padding: '16px', borderBottom: '0.5px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>对话历史</span>
            <button onClick={() => setDrawerOpen(false)} style={{
              background: 'none', border: 'none', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer',
            }}>×</button>
          </div>
          <ConversationList onSelect={() => setDrawerOpen(false)} />
        </div>

        {/* Top bar */}
        <div style={{
          height: 'var(--mobile-header-height)', display: 'flex', alignItems: 'center',
          padding: '0 12px', borderBottom: '0.5px solid var(--border)',
          justifyContent: 'space-between', background: 'var(--sidebar)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setDrawerOpen(true)} style={{
              background: 'none', border: 'none', color: 'var(--text)', fontSize: '22px', cursor: 'pointer', padding: 0,
            }}>☰</button>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeConv?.title || 'AI PM 助手'}
            </span>
          </div>
          <button onClick={() => startConversation()} style={{
            fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: 6,
            border: 'none', background: '#c9a55a', color: '#fff', cursor: 'pointer',
          }}>
            + 新建
          </button>
        </div>

        {/* Messages area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          <MessageList
            messages={messages}
            loading={loading}
            renderMessageFooter={msg => <SaveToDocButton content={msg.content} />}
            onPromptSelect={(prompt: string) => setPrefillPrompt(prompt)}
          />
        </div>

        {/* Input area */}
        <MessageInput
          onSend={handleSend}
          disabled={loading}
          prefillPrompt={prefillPrompt}
          onPrefillConsumed={() => setPrefillPrompt(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#FDFBF7] p-4 gap-6">
      {/* 左侧 · 对话列表 Bento 卡片 */}
      <div className="w-[200px] flex-shrink-0 rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden">
        <ConversationList />
      </div>

      {/* 右侧 · 主对话区 Bento 卡片 */}
      <div className="flex-1 flex flex-col rounded-2xl border border-gray-200/60 bg-white/80 backdrop-blur-sm shadow-[0_4px_24px_rgba(0,0,0,0.015)] overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="h-12 shrink-0 flex items-center px-5 text-sm text-gray-500 border-b border-gray-100">
          {activeConv?.title || 'AI PM 助手'}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <MessageList
            messages={messages}
            loading={loading}
            renderMessageFooter={msg => <SaveToDocButton content={msg.content} />}
            onPromptSelect={(prompt: string) => setPrefillPrompt(prompt)}
          />
        </div>

        {/* Input area */}
        <MessageInput
          onSend={handleSend}
          disabled={loading}
          prefillPrompt={prefillPrompt}
          onPrefillConsumed={() => setPrefillPrompt(null)}
        />
      </div>
    </div>
  )
}
