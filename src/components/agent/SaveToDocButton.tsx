'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Check } from 'lucide-react'
import { useDocStore } from '@/store/docStore'
import { toast } from 'sonner'

interface Props {
  content: string
}

export default function SaveToDocButton({ content }: Props) {
  const router = useRouter()
  const [saved, setSaved] = useState(false)
  const { createDoc, updateDoc } = useDocStore()

  if (!content || content.length < 20) return null

  const cleanContent = (raw: string): string => {
    return raw
      .replace(/\n*💾\s*可保存到文档中心\s*$/g, '')
      .replace(/^(好的|当然|没问题|根据您的需求|以下是|我来帮您?)[^\n]*\n+/g, '')
      .trim()
  }

  const handleSave = async () => {
    await createDoc('prd', 'AI 生成文档')
    const docId = useDocStore.getState().activeDoc?.id
    if (docId) {
      await updateDoc(docId, { content: cleanContent(content) })
      setSaved(true)
      toast.success('已保存到文档中心')
      setTimeout(() => router.push(`/docs/${docId}`), 600)
    }
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #f0f0f0' }}>
      <button
        onClick={handleSave}
        disabled={saved}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          borderRadius: 10,
          border: 'none',
          background: saved ? '#e8f5e9' : '#fef3c7',
          color: saved ? '#2e7d32' : '#b45309',
          fontSize: 13,
          fontWeight: 600,
          cursor: saved ? 'default' : 'pointer',
          transition: 'all 0.2s',
        }}
      >
        {saved ? <Check size={15} /> : <FileText size={15} />}
        {saved ? '已保存' : '📄 保存到文档中心'}
      </button>
    </div>
  )
}
