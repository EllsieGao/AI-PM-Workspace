import { create } from 'zustand'
import { Message, Conversation } from '@/lib/types'
import { createClient } from '@/lib/supabase'

interface AgentStore {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]
  loading: boolean
  streamingContent: string
  persona: string
  attachedContext: { type: string; id: string; title: string; content?: string }[]

  fetchConversations: () => Promise<void>
  startConversation: () => Promise<string>
  selectConversation: (id: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  toggleStar: (id: string) => Promise<void>
  setPersona: (persona: string) => void
  attachContext: (ctx: { type: string; id: string; title: string; content?: string }) => void
  removeAttachedContext: (id: string) => void
  clearAttachedContext: () => void
}

export const PERSONA_LIST = [
  { key: 'default', name: '通用助手', emoji: '🤖' },
  { key: 'prd_writer', name: 'PRD 撰写', emoji: '📝' },
  { key: 'data_analyst', name: '数据分析', emoji: '📊' },
  { key: 'user_researcher', name: '用户研究', emoji: '🔍' },
  { key: 'competitor_analyst', name: '竞品分析', emoji: '🎯' },
]

export const useAgentStore = create<AgentStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  loading: false,
  streamingContent: '',
  persona: 'default',
  attachedContext: [],

  fetchConversations: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('updated_at', { ascending: false })
    if (data) set({ conversations: data as Conversation[] })
  },

  startConversation: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('conversations')
      .insert({ title: '新对话' })
      .select('*')
      .single()
    if (data) {
      set(s => ({
        conversations: [data as Conversation, ...s.conversations],
        activeConversationId: data.id,
        messages: [],
        streamingContent: '',
        attachedContext: [],
      }))
      return data.id
    }
    return ''
  },

  selectConversation: async (id) => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true })
    set({
      activeConversationId: id,
      messages: (data as Message[]) || [],
      streamingContent: '',
    })
  },

  sendMessage: async (content) => {
    const supabase = createClient()
    const { activeConversationId, messages, persona, attachedContext } = get()

    let convId = activeConversationId
    if (!convId) {
      convId = await get().startConversation()
    }

    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, role: 'user', content })
      .select('*')
      .single()

    // Create an empty assistant message placeholder
    const { data: assistantMsg } = await supabase
      .from('messages')
      .insert({
        conversation_id: convId,
        role: 'assistant',
        content: '',
      })
      .select('*')
      .single()

    const updatedMessages = [...messages]
    if (userMsg) updatedMessages.push(userMsg as Message)
    if (assistantMsg) updatedMessages.push(assistantMsg as Message)

    set({ messages: updatedMessages, loading: true, streamingContent: '' })

    try {
      const validMessages = messages.filter(Boolean) as Message[]
      const history = [...validMessages, ...(userMsg ? [userMsg] : [])].map(m => ({
        role: m.role,
        content: m.content,
      }))

      // Use streaming by default
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history,
          persona,
          stream: true,
          contextDocs: attachedContext.length > 0 ? attachedContext : undefined,
        }),
      })

      if (!res.ok || !res.body) {
        // Fallback to non-streaming
        const text = await res.text()
        const finalContent = text.startsWith('data: ') ? '' : text
        set(s => ({
          messages: s.messages.map(m =>
            m.id === assistantMsg?.id ? { ...m, content: finalContent } : m
          ),
          loading: false,
          streamingContent: '',
        }))
        if (assistantMsg && finalContent) {
          await supabase.from('messages').update({ content: finalContent }).eq('id', assistantMsg.id)
        }
      } else {
        // Process SSE stream
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let fullContent = ''
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue

            const data = trimmed.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.error) {
                console.error('Stream error:', parsed.error)
                continue
              }
              if (parsed.content) {
                fullContent += parsed.content
                set({ streamingContent: fullContent })
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }

        // Stream complete - finalize
        set(s => ({
          messages: s.messages.map(m =>
            m.id === assistantMsg?.id ? { ...m, content: fullContent } : m
          ),
          loading: false,
          streamingContent: '',
        }))

        // Persist to DB
        if (assistantMsg) {
          await supabase.from('messages').update({ content: fullContent }).eq('id', assistantMsg.id)
        }
      }

      // Auto-title from first user message
      if (messages.length === 0) {
        const title = content.slice(0, 20) + (content.length > 20 ? '…' : '')
        await supabase.from('conversations').update({ title }).eq('id', convId)
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === convId ? { ...c, title } : c
          ),
        }))
      }

      // Clear attached context after send
      set({ attachedContext: [] })
    } catch (e) {
      console.error(e)
    } finally {
      set({ loading: false })
    }
  },

  deleteConversation: async (id) => {
    const supabase = createClient()
    await supabase.from('conversations').delete().eq('id', id)
    set(s => ({
      conversations: s.conversations.filter(c => c.id !== id),
      activeConversationId: s.activeConversationId === id ? null : s.activeConversationId,
      messages: s.activeConversationId === id ? [] : s.messages,
    }))
  },

  toggleStar: async (id) => {
    const supabase = createClient()
    const conv = get().conversations.find(c => c.id === id)
    if (!conv) return
    const newVal = !conv.is_starred
    await supabase.from('conversations').update({ is_starred: newVal }).eq('id', id)
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === id ? { ...c, is_starred: newVal } : c
      ),
    }))
  },

  setPersona: (persona) => set({ persona }),

  attachContext: (ctx) => set(s => ({
    attachedContext: s.attachedContext.some(c => c.id === ctx.id)
      ? s.attachedContext
      : [...s.attachedContext, ctx],
  })),

  removeAttachedContext: (id) => set(s => ({
    attachedContext: s.attachedContext.filter(c => c.id !== id),
  })),

  clearAttachedContext: () => set({ attachedContext: [] }),
}))
