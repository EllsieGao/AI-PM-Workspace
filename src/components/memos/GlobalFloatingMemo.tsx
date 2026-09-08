'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Sparkles, X, Zap, Loader2, Link2, Image, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMemoStore } from '@/store/useMemoStore'
import { createClient } from '@/lib/supabase'

export default function GlobalFloatingMemo() {
  const pathname = usePathname()
  const { addMemo } = useMemoStore()

  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState<'prompt' | 'idea'>('idea')
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [suggestedModule, setSuggestedModule] = useState<string | null>(null)

  // Multimedia states
  const [linkPreview, setLinkPreview] = useState<{ title: string; description: string; url: string } | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageUploading, setImageUploading] = useState(false)

  const titleRef = useRef<HTMLInputElement>(null)
  const linkTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const parseTags = (input: string): string[] =>
    input.split(/[,，\s]+/).map((t) => t.trim()).filter(Boolean)

  const reset = useCallback(() => {
    setTitle('')
    setContent('')
    setType('idea')
    setTagInput('')
    setSuggestedModule(null)
    setLinkPreview(null)
    setImageUrl('')
  }, [])

  const open = useCallback(() => {
    reset()
    setIsOpen(true)
  }, [reset])

  const close = useCallback(() => {
    setIsOpen(false)
    setSaving(false)
    setIsAnalyzing(false)
    setLinkLoading(false)
    setImageUploading(false)
  }, [])

  // --- URL detection in content ---
  const detectAndParseLink = useCallback((text: string) => {
    if (linkTimerRef.current) clearTimeout(linkTimerRef.current)
    const urlMatch = text.match(/https?:\/\/[^\s,，）)]+/)
    if (!urlMatch) {
      setLinkPreview(null)
      return
    }
    const detectedUrl = urlMatch[0]
    linkTimerRef.current = setTimeout(async () => {
      setLinkLoading(true)
      try {
        const res = await fetch('/api/parse-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: detectedUrl }),
        })
        const data = await res.json()
        setLinkPreview(data)
      } catch {
        // silent
      } finally {
        setLinkLoading(false)
      }
    }, 600)
  }, [])

  const onContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value
    setContent(v)
    detectAndParseLink(v)
  }, [detectAndParseLink])

  // --- Paste event for image upload ---
  const onPaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault()
        const file = items[i].getAsFile()
        if (!file) return

        setImageUploading(true)
        try {
          const supabase = createClient()
          const ext = file.name?.split('.').pop() || 'png'
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('memo-media')
            .upload(fileName, file, { contentType: file.type })
          if (uploadError) throw uploadError
          const { data: { publicUrl } } = supabase.storage.from('memo-media').getPublicUrl(fileName)
          setImageUrl(publicUrl)
          toast.success('📸 截图已上传')
        } catch (err) {
          console.error('【AIPM】截图上传失败:', err)
          toast.error('截图上传失败，请检查存储配置')
        } finally {
          setImageUploading(false)
        }
        break
      }
    }
  }, [])

  // --- Save with AI analysis + media ---
  const handleSave = useCallback(async () => {
    if (!title.trim() || !content.trim()) return

    setIsAnalyzing(true)
    setSaving(true)
    let aiTags: string[] = []
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'analyze_memo', title, content }),
      })
      const data = await res.json()
      if (data.tags) {
        aiTags = data.tags.map((t: string) => t.replace(/^#/, ''))
      }
      if (data.suggested_module) {
        setSuggestedModule(data.suggested_module)
      }
    } catch (e) {
      console.error('【AIPM】AI 分析异常，跳过智能标签:', e)
    } finally {
      setIsAnalyzing(false)
    }

    const userTags = parseTags(tagInput)
    const mergedTags = [...new Set([...aiTags, ...userTags])]
    try {
      await addMemo({
        title: title.trim(),
        content: content.trim(),
        type,
        tags: mergedTags,
        link_metadata: linkPreview || undefined,
        image_url: imageUrl || undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      toast.success('闪念已捕捉', { duration: 2000 })
      close()
    } catch (e) {
      console.error('【AIPM】保存异常:', e)
      toast.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }, [title, content, type, tagInput, linkPreview, imageUrl, addMemo, close])

  // Keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'm') {
        e.preventDefault()
        if (isOpen) close(); else open()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, open, close])

  useEffect(() => {
    if (isOpen) setTimeout(() => titleRef.current?.focus(), 50)
  }, [isOpen])

  const onTextareaKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave])

  if (pathname === '/agent') return null

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={open}
        title="新增闪念 (Alt+M)"
        style={{
          position: 'fixed', bottom: 24, right: 24, width: 44, height: 44,
          borderRadius: '50%', border: '0.5px solid var(--border)',
          background: 'var(--surface)', color: 'var(--accent)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 998, boxShadow: '0 0 12px rgba(201,165,90,0.15)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 0 20px rgba(201,165,90,0.3)'
          e.currentTarget.style.background = 'var(--accent)'
          e.currentTarget.style.color = '#0f0d0b'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 0 12px rgba(201,165,90,0.15)'
          e.currentTarget.style.background = 'var(--surface)'
          e.currentTarget.style.color = 'var(--accent)'
        }}
      >
        <Zap size={20} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div
            style={{
              width: 520, maxWidth: '90vw',
              background: 'var(--surface)', border: '0.5px solid var(--border)',
              borderRadius: 12, padding: '24px 28px',
              display: 'flex', flexDirection: 'column', gap: 12,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>闪念捕捉</span>
              </div>
              <button onClick={close} disabled={isAnalyzing}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: isAnalyzing ? 'not-allowed' : 'pointer', padding: 4, opacity: isAnalyzing ? 0.4 : 1 }}
              ><X size={18} /></button>
            </div>

            {/* Analyzing */}
            {isAnalyzing && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text2)' }}>
                <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />
                <span>✦ AI 正在智能分析意图并分类…</span>
              </div>
            )}

            {/* Suggested module */}
            {suggestedModule && !isAnalyzing && (
              <div style={{ background: 'rgba(201,165,90,0.1)', border: '0.5px solid rgba(201,165,90,0.25)', borderRadius: 8, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--accent)' }}>
                <Zap size={14} />
                推荐模块: <span style={{ fontWeight: 600 }}>{suggestedModule === 'Docs' ? '📑 文档中心' : suggestedModule === 'Timeline' ? '📋 会议纪要' : '🔍 竞品调研'}</span>
              </div>
            )}

            {/* Link preview */}
            {linkLoading && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text3)' }}>
                <Loader2 size={12} className="animate-spin" />
                解析链接…
              </div>
            )}
            {linkPreview && !linkLoading && (
              <div style={{ background: 'var(--surface2)', border: '0.5px solid var(--border2)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12 }}>
                <Link2 size={14} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkPreview.title}</div>
                  {linkPreview.description && <div style={{ color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{linkPreview.description}</div>}
                  <div style={{ color: 'var(--accent)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11 }}>{linkPreview.url}</div>
                </div>
                <button onClick={() => setLinkPreview(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                ><X size={14} /></button>
              </div>
            )}

            {/* Image preview */}
            {imageUrl && (
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '0.5px solid var(--border)' }}>
                <img src={imageUrl} alt="粘贴的截图" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', background: '#000' }} />
                <button onClick={() => setImageUrl('')}
                  style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', padding: 4 }}
                ><Trash2 size={14} /></button>
              </div>
            )}
            {imageUploading && (
              <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text2)' }}>
                <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent)' }} />
                📸 正在上传截图至 Supabase Storage…
              </div>
            )}

            {/* Title */}
            <input ref={titleRef} value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="标题" disabled={isAnalyzing}
              style={{ width: '100%', height: 38, fontSize: 14, color: 'var(--text)', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '0 14px', outline: 'none', opacity: isAnalyzing ? 0.5 : 1 }} />

            {/* Content */}
            <textarea value={content} onChange={onContentChange} onPaste={onPaste}
              onKeyDown={onTextareaKeyDown}
              placeholder="记录一闪而过的想法… 粘贴链接自动解析 / Ctrl+V 上传截图"
              rows={4} disabled={isAnalyzing}
              style={{ width: '100%', fontSize: 13, lineHeight: 1.7, color: 'var(--text)', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, padding: '10px 14px', outline: 'none', resize: 'none', fontFamily: 'inherit', opacity: isAnalyzing ? 0.5 : 1 }} />

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', borderRadius: 6, border: '0.5px solid var(--border)', overflow: 'hidden', flexShrink: 0 }}>
                <button onClick={() => setType('idea')} disabled={isAnalyzing}
                  style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', border: 'none', cursor: isAnalyzing ? 'not-allowed' : 'pointer', background: type === 'idea' ? 'var(--accent)' : 'transparent', color: type === 'idea' ? '#0f0d0b' : 'var(--text2)' }}>💡 灵感</button>
                <button onClick={() => setType('prompt')} disabled={isAnalyzing}
                  style={{ fontSize: 12, fontWeight: 500, padding: '5px 12px', border: 'none', cursor: isAnalyzing ? 'not-allowed' : 'pointer', background: type === 'prompt' ? 'var(--accent)' : 'transparent', color: type === 'prompt' ? '#0f0d0b' : 'var(--text2)' }}>✦ Prompt</button>
              </div>
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                placeholder="标签（空格分隔）" disabled={isAnalyzing}
                style={{ flex: 1, height: 32, fontSize: 12, color: 'var(--text)', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 6, padding: '0 10px', outline: 'none', opacity: isAnalyzing ? 0.5 : 1 }} />
              <button onClick={handleSave}
                disabled={saving || isAnalyzing || !title.trim() || !content.trim()}
                style={{ height: 32, fontSize: 12, fontWeight: 600, padding: '0 16px', borderRadius: 6, border: 'none', flexShrink: 0, background: saving || isAnalyzing || !title.trim() || !content.trim() ? 'var(--surface2)' : 'var(--accent)', color: saving || isAnalyzing || !title.trim() || !content.trim() ? 'var(--text3)' : '#0f0d0b', cursor: saving || isAnalyzing || !title.trim() || !content.trim() ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                {isAnalyzing ? 'AI 分析中…' : saving ? '保存中…' : '静默保存'}
              </button>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', justifyContent: 'space-between' }}>
              <span>快捷键: <kbd style={{ color: 'var(--accent)' }}>⌘Enter</kbd> 保存 · <kbd style={{ color: 'var(--accent)' }}>Esc</kbd> 关闭</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Image size={12} /> <span style={{ opacity: 0.6 }}>支持粘贴截图</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
