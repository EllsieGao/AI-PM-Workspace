export type DocType = 'prd' | 'meeting' | 'tech' | 'review' | 'other'

export interface Document {
  id: string
  title: string
  type: DocType
  content: string
  tags: string[]
  project: string
  summary: string
  action_items: string[]
  created_at: string
  updated_at: string
}

export type DocFilter = 'all' | DocType

export type AiAction = 'summary' | 'actions' | 'generate'

export interface AiPanelState {
  visible: boolean
  type: AiAction | null
  content: string
  loading: boolean
}

export interface Prompt {
  id: string
  title: string
  content: string
  category?: string
  tags?: string[]
  rating: number
  notes?: string
  created_at: string
  updated_at?: string
}

export interface PromptVersion {
  id: string
  prompt_id: string
  content: string
  note: string
  created_at: string
}

export interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
  is_starred: boolean
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export type ResourceSource = '21st' | 'bento' | 'v0' | 'other'
export type ResourceCategory = 'component' | 'layout' | 'template' | 'other'

export interface DesignResource {
  id: string
  title: string
  url: string
  source: ResourceSource
  category: ResourceCategory
  note: string
  image_url: string
  tags: string[]
  created_at: string
}

// 竞品雷达
export interface RadarProject {
  id: string
  name: string
  description: string
  color: string
  created_at: string
  updated_at: string
}

export interface Competitor {
  id: string
  project_id: string
  name: string
  url: string
  description: string
  features_json: Record<string, string>
  tags: string[]
  created_at: string
  updated_at: string
}

export interface ResearchNote {
  id: string
  project_id: string
  title: string
  content: string
  tags: string[]
  created_at: string
  updated_at: string
}
