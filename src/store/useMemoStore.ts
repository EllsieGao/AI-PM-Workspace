import { create } from 'zustand'
import { createClient } from '@/lib/supabase'

export interface Memo {
  id: string
  title: string
  content: string
  type: 'prompt' | 'idea'
  tags: string[]
  category?: string
  created_at: string
}

type FilterType = 'all' | 'prompt' | 'idea'

export const MEMO_CATEGORIES = ['编码', '需求', '竞品', '会议', '其他'] as const

interface MemoStore {
  memos: Memo[]
  loading: boolean
  filterType: FilterType
  selectedTag: string | null

  fetchMemos: () => Promise<void>
  addMemo: (memo: Omit<Memo, 'id' | 'created_at'>) => Promise<void>
  updateMemo: (id: string, fields: Partial<Memo>) => Promise<void>
  deleteMemo: (id: string) => Promise<void>
  setFilterType: (type: FilterType) => void
  setSelectedTag: (tag: string | null) => void
}

export const useMemoStore = create<MemoStore>((set, get) => ({
  memos: [],
  loading: false,
  filterType: 'all',
  selectedTag: null,

  fetchMemos: async () => {
    set({ loading: true })
    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('memos')
        .select('*')
        .order('created_at', { ascending: false })
      if (data) {
        set({ memos: data as Memo[], loading: false })
      } else {
        set({ loading: false })
      }
    } catch (err) {
      console.error('【AIPM】fetchMemos 请求异常:', err)
      set({ loading: false })
    }
  },

  addMemo: async (memoData) => {
    const supabase = createClient()
    set({ loading: true })
    try {
      const insertFields: Record<string, unknown> = {
        title: memoData.title,
        content: memoData.content,
        type: memoData.type,
        tags: memoData.tags,
      }
      if (memoData.category) insertFields.category = memoData.category
      if ('link_metadata' in memoData) insertFields.link_metadata = (memoData as Record<string, unknown>).link_metadata
      if ('image_url' in memoData) insertFields.image_url = (memoData as Record<string, unknown>).image_url
      const { data, error } = await supabase
        .from('memos')
        .insert([insertFields])
        .select()
        .single()
      if (error) throw error
      await get().fetchMemos()
    } catch (err) {
      console.error('【AIPM存储错误】:', err)
    } finally {
      set({ loading: false })
    }
  },

  updateMemo: async (id, fields) => {
    const supabase = createClient()
    try {
      await supabase.from('memos').update(fields).eq('id', id)
      set((s) => ({
        memos: s.memos.map((m) => (m.id === id ? { ...m, ...fields } : m)),
      }))
    } catch (err) {
      console.error('【AIPM】updateMemo 失败:', err)
    }
  },

  deleteMemo: async (id) => {
    const supabase = createClient()
    await supabase.from('memos').delete().eq('id', id)
    set((s) => ({ memos: s.memos.filter((m) => m.id !== id) }))
  },

  setFilterType: (filterType) => set({ filterType }),
  setSelectedTag: (selectedTag) => set({ selectedTag }),
}))
