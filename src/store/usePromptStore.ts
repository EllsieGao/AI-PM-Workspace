import { create } from 'zustand'
import { createClient } from '@/lib/supabase'

export interface Prompt {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  rating: number
  notes: string
  created_at: string
  updated_at: string
}

export interface PromptVersion {
  id: string
  prompt_id: string
  content: string
  note: string
  created_at: string
}

export const CATEGORIES = [
  { key: 'coding', label: '💻 编码' },
  { key: 'requirement', label: '📋 需求' },
  { key: 'competitor', label: '🔍 竞品' },
  { key: 'writing', label: '✍️ 写作' },
  { key: 'meeting', label: '📅 会议' },
]

interface PromptStore {
  prompts: Prompt[]
  loading: boolean
  selectedCategory: string | null
  activePrompt: Prompt | null
  versions: PromptVersion[]
  versionsLoading: boolean
  selectedComponentIds: string[]

  fetchPrompts: () => Promise<void>
  addPrompt: (data: { title: string; content: string; category: string; tags: string[] }) => Promise<void>
  updatePrompt: (id: string, fields: Partial<Prompt>) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  setCategory: (cat: string | null) => void
  setActivePrompt: (p: Prompt | null) => void

  toggleComponent: (id: string) => void

  saveVersion: (promptId: string, content: string, note: string) => Promise<void>
  fetchVersions: (promptId: string) => Promise<void>
  updateRating: (promptId: string, rating: number, notes: string) => Promise<void>
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  loading: false,
  selectedCategory: null,
  activePrompt: null,
  versions: [],
  versionsLoading: false,
  selectedComponentIds: [],

  fetchPrompts: async () => {
    set({ loading: true })
    try {
      const supabase = createClient()
      const { data } = await supabase.from('prompts').select('*').order('updated_at', { ascending: false })
      if (data) set({ prompts: data as Prompt[], loading: false })
      else set({ loading: false })
    } catch {
      set({ loading: false })
    }
  },

  addPrompt: async (data) => {
    const supabase = createClient()
    try {
      const { data: inserted } = await supabase.from('prompts').insert([{ ...data, rating: 0, notes: '' }]).select().single()
      if (inserted) {
        set((s) => ({ prompts: [inserted as Prompt, ...s.prompts], activePrompt: inserted as Prompt }))
      }
    } catch (e) {
      console.error('【AIPM】addPrompt 失败:', e)
    }
  },

  updatePrompt: async (id, fields) => {
    const supabase = createClient()
    await supabase.from('prompts').update(fields).eq('id', id)
    set((s) => ({
      prompts: s.prompts.map((p) => (p.id === id ? { ...p, ...fields } : p)),
      activePrompt: s.activePrompt?.id === id ? { ...s.activePrompt, ...fields } : s.activePrompt,
    }))
  },

  deletePrompt: async (id) => {
    const supabase = createClient()
    await supabase.from('prompts').delete().eq('id', id)
    set((s) => ({
      prompts: s.prompts.filter((p) => p.id !== id),
      activePrompt: s.activePrompt?.id === id ? null : s.activePrompt,
    }))
  },

  setCategory: (selectedCategory) => set({ selectedCategory }),
  setActivePrompt: (activePrompt) => set({ activePrompt }),

  toggleComponent: (id: string) =>
    set((s) => ({
      selectedComponentIds: s.selectedComponentIds.includes(id)
        ? s.selectedComponentIds.filter((x) => x !== id)
        : [...s.selectedComponentIds, id],
    })),

  saveVersion: async (promptId, content, note) => {
    const supabase = createClient()
    try {
      const { data } = await supabase.from('prompt_versions').insert([{ prompt_id: promptId, content, note }]).select().single()
      if (data) set((s) => ({ versions: [data as PromptVersion, ...s.versions] }))
    } catch (e) {
      console.error('【AIPM】saveVersion 失败:', e)
    }
  },

  fetchVersions: async (promptId) => {
    set({ versionsLoading: true })
    try {
      const supabase = createClient()
      const { data } = await supabase.from('prompt_versions').select('*').eq('prompt_id', promptId).order('created_at', { ascending: false })
      if (data) set({ versions: data as PromptVersion[], versionsLoading: false })
      else set({ versions: [], versionsLoading: false })
    } catch {
      set({ versions: [], versionsLoading: false })
    }
  },

  updateRating: async (promptId, rating, notes) => {
    await get().updatePrompt(promptId, { rating, notes })
  },
}))
