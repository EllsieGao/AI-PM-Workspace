import { create } from 'zustand'
import { Document, DocFilter, AiPanelState, DocType } from '@/lib/types'
import { createClient } from '@/lib/supabase'

interface DocStore {
  docs: Document[]
  activeDoc: Document | null
  filter: DocFilter
  searchQuery: string
  saveStatus: 'saved' | 'saving' | 'unsaved'
  aiPanel: AiPanelState
  pendingAiPrompt: string

  fetchDocs: () => Promise<void>
  openDoc: (id: string) => Promise<void>
  createDoc: (type: DocType, title?: string) => Promise<void>
  updateDoc: (id: string, fields: Partial<Document>) => Promise<void>
  deleteDoc: (id: string) => Promise<void>

  setFilter: (filter: DocFilter) => void
  setSearchQuery: (q: string) => void
  setSaveStatus: (s: 'saved' | 'saving' | 'unsaved') => void
  setAiPanel: (state: Partial<AiPanelState>) => void
  closeAiPanel: () => void
  setPendingAiPrompt: (prompt: string) => void
}

export const useDocStore = create<DocStore>((set, get) => ({
  docs: [],
  activeDoc: null,
  filter: 'all',
  searchQuery: '',
  saveStatus: 'saved',
  aiPanel: { visible: false, type: null, content: '', loading: false },
  pendingAiPrompt: '',

  fetchDocs: async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('documents')
      .select('id, title, type, updated_at, content')
      .order('updated_at', { ascending: false })
    if (data) set({ docs: data as Document[] })
  },

  openDoc: async (id) => {
    const supabase = createClient()
    const { data } = await supabase.from('documents').select('*').eq('id', id).single()
    if (data) set({
      activeDoc: data as Document,
      saveStatus: 'saved',
      aiPanel: { visible: false, type: null, content: '', loading: false }
    })
  },

  createDoc: async (type, title) => {
    const supabase = createClient()
    const { DOC_TYPES } = await import('@/lib/constants')
    const { data } = await supabase
      .from('documents')
      .insert({ type, title: title || DOC_TYPES[type].defaultTitle })
      .select('*')
      .single()
    if (data) {
      set(s => ({ docs: [data as Document, ...s.docs], activeDoc: data as Document }))
    }
  },

  updateDoc: async (id, fields) => {
    const supabase = createClient()
    const { error } = await supabase.from('documents').update(fields).eq('id', id)
    if (!error) {
      set(s => ({
        docs: s.docs.map(d => d.id === id ? { ...d, ...fields } : d),
        activeDoc: s.activeDoc?.id === id ? { ...s.activeDoc, ...fields } : s.activeDoc,
        saveStatus: 'saved',
      }))
    }
  },

  deleteDoc: async (id) => {
    const supabase = createClient()
    await supabase.from('documents').delete().eq('id', id)
    set(s => ({
      docs: s.docs.filter(d => d.id !== id),
      activeDoc: s.activeDoc?.id === id ? null : s.activeDoc,
    }))
  },

  setFilter: (filter) => set({ filter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setAiPanel: (state) => set(s => ({ aiPanel: { ...s.aiPanel, ...state } })),
  closeAiPanel: () => set({ aiPanel: { visible: false, type: null, content: '', loading: false } }),
  setPendingAiPrompt: (pendingAiPrompt) => set({ pendingAiPrompt }),
}))
