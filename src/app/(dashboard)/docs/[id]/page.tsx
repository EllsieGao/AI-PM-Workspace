'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useDocStore } from '@/store/docStore'
import DocEditor from '@/components/docs/DocEditor'

export default function DocDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { activeDoc, openDoc } = useDocStore()

  useEffect(() => {
    if (id) openDoc(id)
  }, [id, openDoc])

  // Redirect to docs list if doc not found
  useEffect(() => {
    if (!activeDoc && id) {
      const timer = setTimeout(() => router.push('/docs'), 2000)
      return () => clearTimeout(timer)
    }
  }, [activeDoc, id, router])

  if (!activeDoc) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFBF7' }}>
        <div style={{ textAlign: 'center', color: '#999', fontSize: 14 }}>加载文档中…</div>
      </div>
    )
  }

  return <DocEditor />
}
