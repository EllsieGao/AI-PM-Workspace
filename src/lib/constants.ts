import { DocType } from './types'

export const DOC_TYPES: Record<DocType, { label: string; color: string; defaultTitle: string }> = {
  prd:     { label: 'PRD',    color: '#9b87f5', defaultTitle: '未命名 PRD' },
  meeting: { label: '会议纪要', color: '#60b8fa', defaultTitle: '未命名会议纪要' },
  tech:    { label: '技术方案', color: '#4ade9a', defaultTitle: '未命名技术方案' },
  review:  { label: '复盘报告', color: '#fb9a4a', defaultTitle: '未命名复盘报告' },
  other:   { label: '其他',    color: '#7a8695', defaultTitle: '未命名文档' },
}

export const AUTO_SAVE_DELAY = 1500

export const RESOURCE_SOURCES: Record<string, {
  label: string
  color: string
  siteUrl: string
  description: string
}> = {
  '21st': {
    label: '21st.dev',
    color: '#9b87f5',
    siteUrl: 'https://21st.dev',
    description: 'React 组件市场，直接取代码',
  },
  bento: {
    label: 'Bento Grids',
    color: '#60b8fa',
    siteUrl: 'https://bentogrids.com',
    description: 'Dashboard / 落地页布局参考',
  },
  v0: {
    label: 'v0.dev',
    color: '#4ade9a',
    siteUrl: 'https://v0.dev',
    description: '描述 UI 需求直接生成组件',
  },
  other: {
    label: '其他',
    color: '#7a8695',
    siteUrl: '',
    description: '其他设计资源',
  },
}

export const RESOURCE_CATEGORIES: Record<string, string> = {
  component: '组件',
  layout: '布局',
  template: '模板',
  other: '其他',
}
