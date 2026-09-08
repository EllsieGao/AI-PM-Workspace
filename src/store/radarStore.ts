import { create } from 'zustand'
import { createClient } from '@/lib/supabase'
import { RadarProject, Competitor, ResearchNote } from '@/lib/types'

interface RadarStore {
  projects: RadarProject[]
  activeProjectId: string | null
  competitors: Competitor[]
  notes: ResearchNote[]
  loading: boolean
  analyzing: boolean

  fetchProjects: () => Promise<void>
  createProject: (name: string, description?: string, color?: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setActiveProject: (id: string) => void

  fetchCompetitors: (projectId: string) => Promise<void>
  addCompetitor: (data: Omit<Competitor, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateCompetitor: (id: string, fields: Partial<Competitor>) => Promise<void>
  deleteCompetitor: (id: string) => Promise<void>

  fetchNotes: (projectId: string) => Promise<void>
  addNote: (data: Omit<ResearchNote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateNote: (id: string, fields: Partial<ResearchNote>) => Promise<void>
  deleteNote: (id: string) => Promise<void>

  analyzeCompetitors: (projectId: string) => Promise<string>
}

export const useRadarStore = create<RadarStore>((set, get) => ({
  projects: [],
  activeProjectId: null,
  competitors: [],
  notes: [],
  loading: false,
  analyzing: false,

  fetchProjects: async () => {
    const supabase = createClient()
    const { data } = await supabase.from('radar_projects').select('*').order('created_at', { ascending: false })
    if (data) {
      set({ projects: data as RadarProject[] })
      if (data.length > 0 && !get().activeProjectId) {
        set({ activeProjectId: data[0].id })
        get().fetchCompetitors(data[0].id)
        get().fetchNotes(data[0].id)
      }
    }
  },

  createProject: async (name, description = '', color = '#f59e0b') => {
    const supabase = createClient()
    const { data } = await supabase.from('radar_projects').insert({ name, description, color }).select('*').single()
    if (data) {
      set(s => ({
        projects: [data as RadarProject, ...s.projects],
        activeProjectId: data.id,
        competitors: [],
        notes: [],
      }))
    }
  },

  deleteProject: async (id) => {
    const supabase = createClient()
    await supabase.from('radar_projects').delete().eq('id', id)
    set(s => {
      const remaining = s.projects.filter(p => p.id !== id)
      const newActive = s.activeProjectId === id ? (remaining[0]?.id || null) : s.activeProjectId
      if (newActive) { get().fetchCompetitors(newActive); get().fetchNotes(newActive) }
      return { projects: remaining, activeProjectId: newActive, competitors: newActive ? s.competitors : [], notes: newActive ? s.notes : [] }
    })
  },

  setActiveProject: (id) => {
    set({ activeProjectId: id, competitors: [], notes: [] })
    get().fetchCompetitors(id)
    get().fetchNotes(id)
  },

  fetchCompetitors: async (projectId) => {
    const supabase = createClient()
    const { data } = await supabase.from('competitors').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    if (data) set({ competitors: data as Competitor[] })
  },

  addCompetitor: async (comp) => {
    const supabase = createClient()
    const { data } = await supabase.from('competitors').insert(comp).select('*').single()
    if (data) set(s => ({ competitors: [data as Competitor, ...s.competitors] }))
  },

  updateCompetitor: async (id, fields) => {
    const supabase = createClient()
    await supabase.from('competitors').update(fields).eq('id', id)
    set(s => ({ competitors: s.competitors.map(c => c.id === id ? { ...c, ...fields } : c) }))
  },

  deleteCompetitor: async (id) => {
    const supabase = createClient()
    await supabase.from('competitors').delete().eq('id', id)
    set(s => ({ competitors: s.competitors.filter(c => c.id !== id) }))
  },

  fetchNotes: async (projectId) => {
    const supabase = createClient()
    const { data } = await supabase.from('research_notes').select('*').eq('project_id', projectId).order('created_at', { ascending: false })
    if (data) set({ notes: data as ResearchNote[] })
  },

  addNote: async (note) => {
    const supabase = createClient()
    const { data } = await supabase.from('research_notes').insert(note).select('*').single()
    if (data) set(s => ({ notes: [data as ResearchNote, ...s.notes] }))
  },

  updateNote: async (id, fields) => {
    const supabase = createClient()
    await supabase.from('research_notes').update(fields).eq('id', id)
    set(s => ({ notes: s.notes.map(n => n.id === id ? { ...n, ...fields } : n) }))
  },

  deleteNote: async (id) => {
    const supabase = createClient()
    await supabase.from('research_notes').delete().eq('id', id)
    set(s => ({ notes: s.notes.filter(n => n.id !== id) }))
  },

  analyzeCompetitors: async (projectId) => {
    set({ analyzing: true })
    try {
      const competitors = get().competitors
      const resp = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_matrix',
          content: competitors.map(c => `竞品：${c.name}\n描述：${c.description}\nURL：${c.url}`).join('\n---\n'),
        }),
      })
      const json = await resp.json()
      if (json.competitors && Array.isArray(json.competitors)) {
        const supabase = createClient()
        for (const item of json.competitors) {
          const match = competitors.find(c => c.name.toLowerCase() === item.name?.toLowerCase())
          if (match) {
            await supabase.from('competitors').update({ features_json: item.features_json || {} }).eq('id', match.id)
          }
        }
        await get().fetchCompetitors(projectId)
      }
      return json.competitors ? '分析完成' : '未识别到竞品信息'
    } catch {
      return '分析失败，请重试'
    } finally {
      set({ analyzing: false })
    }
  },
}))
