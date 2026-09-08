import { create } from 'zustand'
import { Message, Conversation } from '@/lib/types'
import { createClient } from '@/lib/supabase'

interface AgentStore {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Message[]
  loading: boolean
  fetchConversations: () => Promise<void>
  startConversation: () => Promise<string>
  selectConversation: (id: string) => Promise<void>
  sendMessage: (content: string) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
  toggleStar: (id: string) => Promise<void>
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  loading: false,

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
    })
  },

  sendMessage: async (content) => {
    const supabase = createClient()
    const { activeConversationId, messages } = get()

    let convId = activeConversationId
    if (!convId) {
      convId = await get().startConversation()
    }

    const { data: userMsg } = await supabase
      .from('messages')
      .insert({ conversation_id: convId, role: 'user', content })
      .select('*')
      .single()

    if (userMsg) {
      set(s => ({ messages: [...s.messages, userMsg as Message], loading: true }))
    }

    try {
      const validMessages = messages.filter(Boolean) as Message[]
      const history = [...validMessages, ...(userMsg ? [userMsg] : [])].map(m => ({
        role: m.role,
        content: m.content,
      }))

      // 先插入一条空的 assistant 消息
      const { data: assistantMsg } = await supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          role: 'assistant',
          content: '',
        })
        .select('*')
        .single()

      if (!assistantMsg) throw new Error('Failed to create assistant message')

      set(s => ({ messages: [...s.messages, assistantMsg as Message] }))

      // 调用 AI
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      const fullContent = await res.text()

      set(s => ({
        messages: s.messages.map(m =>
          m.id === assistantMsg.id
            ? { ...m, content: fullContent }
            : m
        ),
      }))

      // 将完整内容保存到数据库
      await supabase
        .from('messages')
        .update({ content: fullContent })
        .eq('id', assistantMsg.id)

      if (messages.length === 0) {
        const title = content.slice(0, 20) + (content.length > 20 ? '…' : '')
        await supabase
          .from('conversations')
          .update({ title })
          .eq('id', convId)
        set(s => ({
          conversations: s.conversations.map(c =>
            c.id === convId ? { ...c, title } : c
          ),
        }))
      }
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
    await supabase
      .from('conversations')
      .update({ is_starred: newVal })
      .eq('id', id)
    set(s => ({
      conversations: s.conversations.map(c =>
        c.id === id ? { ...c, is_starred: newVal } : c
      ),
    }))
  },
}))
