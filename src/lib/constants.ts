import { DocType } from './types'

export const DOC_TYPES: Record<DocType, { label: string; color: string; defaultTitle: string }> = {
  prd:     { label: 'PRD',    color: '#9b87f5', defaultTitle: '未命名 PRD' },
  meeting: { label: '会议纪要', color: '#60b8fa', defaultTitle: '未命名会议纪要' },
  tech:    { label: '技术方案', color: '#4ade9a', defaultTitle: '未命名技术方案' },
  review:  { label: '复盘报告', color: '#fb9a4a', defaultTitle: '未命名复盘报告' },
  other:   { label: '其他',    color: '#7a8695', defaultTitle: '未命名文档' },
}

export const AUTO_SAVE_DELAY = 1500
