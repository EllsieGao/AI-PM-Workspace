'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { Copy, Check, Trash2, SendHorizonal, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useMemoStore, MEMO_CATEGORIES } from '@/store/useMemoStore'
import { useAgentStore } from '@/store/agentStore'

const FILTERS = ['全部', ...MEMO_CATEGORIES]

const INSPIRATION_STARTERS = [
  { id: 1, category: '竞品', text: '💡 竞品分析：今天看到的这个交互组件非常硬核，涵盖了毛玻璃滤镜与3D物理阻尼视差，可以引入到我们的项目工作台...' },
  { id: 2, category: '需求', text: '📊 闪念速记：文档中心的空状态需要从死板的按钮升级为动态模板魔方，去掉扎眼的彩色边框，改用微光悬浮卡片...' },
  { id: 3, category: '会议', text: '📝 会议纪要：下午和导师对齐了毕业论文的进度，接下来需要把重心放在营运能力提升策略的财务数据清洗上...' },
]

export default function MemoCenter() {
  const { memos, loading, fetchMemos, addMemo, updateMemo, deleteMemo } = useMemoStore()
  const { sendMessage, startConversation } = useAgentStore()
  const router = useRouter()

  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('全部')
  const [search, setSearch] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [categoryMenu, setCategoryMenu] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { fetchMemos() }, [fetchMemos])

  // Filter + search
  const filtered = memos.filter((m) => {
    if (filter !== '全部' && m.category !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return m.content.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)
    }
    return true
  })

  const isAllSelected = filtered.length > 0 && selectedIds.size === filtered.length

  // Save on Enter (Shift+Enter for newline)
  const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const text = input.trim()
      if (!text) return
      const title = text.split('\n')[0].slice(0, 60)
      await addMemo({ title, content: text, type: 'idea', tags: [], category: undefined })
      setInput('')
      toast.success('已保存')
    }
  }, [input, addMemo])

  const handleCopy = useCallback(async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }, [])

  const handleSendToAgent = useCallback(async (content: string) => {
    setSending(true)
    try {
      await startConversation()
      await sendMessage(content)
      router.push('/agent')
    } finally {
      setSending(false)
    }
  }, [startConversation, sendMessage, router])

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const handleBatchSend = useCallback(async () => {
    setSending(true)
    try {
      const selected = memos.filter(m => selectedIds.has(m.id))
      const combined = selected.map((m, i) =>
        '【灵感 ' + (i + 1) + '】\n' + m.content
      ).join('\n\n---\n\n')
      const finalContent =
        '我有以下 ' + selected.length +
        ' 条产品灵感，请帮我分析这些想法的价值，找出共同主题，并给出产品方向建议：\n\n' + combined
      await startConversation()
      await sendMessage(finalContent)
      router.push('/agent')
    } finally {
      setSending(false)
      setSelectMode(false)
      setSelectedIds(new Set())
    }
  }, [memos, selectedIds, startConversation, sendMessage, router])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm('确认删除这条记录？')) {
      await deleteMemo(id)
      toast.success('已删除')
    }
  }, [deleteMemo])

  const handleCategoryChange = useCallback(async (memoId: string, category: string) => {
    await updateMemo(memoId, { category } as Partial<import('@/store/useMemoStore').Memo>)
    setCategoryMenu(null)
  }, [updateMemo])

  // ── EmptyInspirationSandbox ──────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  const EmptyInspirationSandbox = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ paddingTop: 40 }}
    >
      {/* ≡≡≡  First layer: Handbook skeleton background  ≡≡≡ */}
      <div style={{
        position: 'relative',
        borderRadius: 16,
        padding: '28px 24px 24px',
        marginBottom: 20,
        overflow: 'hidden',
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
      }}>
        {/* Dotted grid texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.35,
          backgroundImage: 'radial-gradient(var(--border2) 0.8px, transparent 0.8px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }} />

        {/* Top decorative spine */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, var(--border2) 0%, var(--accent) 50%, var(--border2) 100%)',
          opacity: 0.3,
        }} />

        {/* Notebook ring holes (decorative) */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginBottom: 20, position: 'relative', zIndex: 1 }}>
          {[0, 1, 2, 3].map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
            }} />
          ))}
        </div>

        {/* Section label */}
        <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 3, height: 20, borderRadius: 2, background: 'var(--accent)', opacity: 0.5 }} />
          <span style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: '0.04em', fontWeight: 500 }}>
            灵感便签
          </span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)', opacity: 0.4 }} />
        </motion.div>

        {/* ≡≡≡  Second layer: Starter cards  ≡≡≡ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
          {INSPIRATION_STARTERS.map((starter) => (
            <motion.div
              key={starter.id}
              variants={itemVariants}
              onClick={() => { setInput(starter.text); textareaRef.current?.focus() }}
              whileHover={{ y: -4, scale: 1.01, borderColor: 'rgba(212, 163, 115, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                background: 'var(--surface)',
                border: '0.5px solid var(--border)',
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {/* Badge */}
              <span style={{
                alignSelf: 'flex-start',
                padding: '2px 10px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 500,
                background: '#f5f5f5',
                color: '#737373',
                marginBottom: 4,
              }}>
                {starter.category}
              </span>

              {/* Text */}
              <span style={{
                fontSize: 12,
                lineHeight: 1.6,
                color: 'rgba(163, 163, 163, 0.9)',
                fontWeight: 400,
              }}>
                {starter.text}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ≡≡≡  Third layer: Keyboard shortcut guide  ≡≡≡ */}
      <motion.div variants={itemVariants} style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 24, fontSize: 12, color: '#d4d4d4', letterSpacing: '0.05em', justifyContent: 'center' }}>
        <span>
          <kbd style={{
            background: '#f5f5f5', padding: '1px 6px', borderRadius: 4,
            border: '0.5px solid #e5e5e5', color: '#737373', marginRight: 4,
            fontFamily: 'system-ui, sans-serif', fontSize: 11,
          }}>
            Enter
          </kbd>
          快速保存
        </span>
        <span>
          <kbd style={{
            background: '#f5f5f5', padding: '1px 6px', borderRadius: 4,
            border: '0.5px solid #e5e5e5', color: '#737373', marginRight: 4,
            fontFamily: 'system-ui, sans-serif', fontSize: 11,
          }}>
            Shift + Enter
          </kbd>
          换行
        </span>
      </motion.div>
    </motion.div>
  )
  // ──────────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: '#FDFBF7', height: '100%', overflowY: 'auto', padding: '28px 40px', maxWidth: 1600, margin: '0 auto' }}>
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="有什么想法？按 Enter 保存，Shift+Enter 换行"
        className="memo-textarea"
        style={{
          width: '100%',
          minHeight: 100,
          background: 'var(--surface)',
          border: '0.5px solid var(--border)',
          borderRadius: 'var(--r)',
          padding: '16px 20px',
          fontSize: 15,
          color: 'var(--text)',
          resize: 'none',
          outline: 'none',
          lineHeight: 1.7,
          boxSizing: 'border-box',
        }}
        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
      />
      {/* Character count */}
      <div style={{ textAlign: 'right', marginTop: 6, fontSize: 11, color: 'var(--text3)' }}>
        {input.length} 字
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20, marginBottom: 16 }}>
        <div className="memo-filter-row" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                fontSize: 12, fontWeight: 500, padding: '4px 12px',
                borderRadius: 14, border: 'none', cursor: 'pointer',
                color: filter === f ? '#fff' : 'var(--text2)',
                background: filter === f ? 'var(--accent)' : 'var(--surface)',
                transition: 'all 0.15s',
              }}>
              {f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => {
            if (selectMode) {
              setSelectMode(false)
              setSelectedIds(new Set())
            } else {
              setSelectMode(true)
            }
          }}
            style={{
              fontSize: 12, fontWeight: 500, padding: '4px 12px',
              borderRadius: 14, border: '0.5px solid var(--border2)',
              cursor: 'pointer', whiteSpace: 'nowrap',
              color: selectMode ? 'var(--text)' : 'var(--text2)',
              background: selectMode ? 'var(--surface2)' : 'transparent',
            }}>
            {selectMode ? '取消选择' : '选择'}
          </button>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索…"
          style={{
            width: 180, height: 32, fontSize: 12,
            background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 8, padding: '0 10px', color: 'var(--text)', outline: 'none',
          }} />
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, fontSize: 13, color: 'var(--text3)' }}>加载中...</div>
      ) : filtered.length === 0 ? (
        <EmptyInspirationSandbox />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <AnimatePresence mode="popLayout">
            {filtered.map((memo, index) => (
              <motion.div
                key={memo.id}
                layout
                initial={{ opacity: 0, y: 16, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -8, filter: 'blur(4px)', scale: 0.98 }}
                transition={{
                  duration: 0.25,
                  delay: Math.min(index * 0.05, 0.3),
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                whileHover={{
                  y: -2,
                  borderColor: 'var(--border2)',
                  transition: { duration: 0.15 }
                }}
                onClick={() => selectMode && handleToggleSelect(memo.id)}
                className="memo-card"
                style={{
                  background: selectedIds.has(memo.id) ? 'var(--surface2)' : 'var(--surface)',
                  border: selectedIds.has(memo.id) ? '0.5px solid var(--accent)' : '0.5px solid var(--border)',
                  borderRadius: 'var(--r)', padding: '14px 16px', marginBottom: 10,
                  cursor: selectMode ? 'pointer' : 'default',
                  position: 'relative',
                }}>
              {/* Content */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                {selectMode && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: 'backOut' }}
                    onClick={(e) => { e.stopPropagation(); handleToggleSelect(memo.id) }}
                    style={{
                      flexShrink: 0, width: 20, height: 20, borderRadius: 10, marginTop: 2,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: selectedIds.has(memo.id) ? '1.5px solid var(--accent)' : '1.5px solid var(--border2)',
                      background: selectedIds.has(memo.id) ? 'var(--accent)' : 'transparent',
                      color: selectedIds.has(memo.id) ? '#1a1000' : 'transparent',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}>
                    {selectedIds.has(memo.id) && '✓'}
                  </motion.div>
                )}
                <div style={{ fontSize: 14, color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                  {memo.content}
                </div>
              </div>

              {/* Bottom bar */}
              <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Left: time + category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                    {new Date(memo.created_at).toLocaleDateString('zh-CN')}
                  </span>
                  {/* Category pill */}
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <button onClick={(e) => { e.stopPropagation(); setCategoryMenu(categoryMenu === memo.id ? null : memo.id) }}
                      style={{
                        fontSize: 11, fontWeight: 500, padding: '2px 8px',
                        borderRadius: 10, border: '0.5px solid var(--border)',
                        background: 'var(--surface2)', color: 'var(--text2)', cursor: 'pointer',
                      }}>
                      {memo.category || '未分类'}
                    </button>
                    {categoryMenu === memo.id && (
                      <>
                        <div
                          onClick={() => setCategoryMenu(null)}
                          style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                        />
                        <div style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 6px)',
                          left: '0',
                          zIndex: 999,
                          background: 'var(--surface)',
                          border: '0.5px solid var(--border2)',
                          borderRadius: 'var(--r)',
                          overflow: 'hidden',
                          minWidth: '80px',
                          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                        }}>
                          {MEMO_CATEGORIES.map((cat) => (
                            <button key={cat} onClick={() => handleCategoryChange(memo.id, cat)}
                              style={{
                                display: 'block', width: '100%', textAlign: 'left',
                                padding: '6px 12px', fontSize: 12, border: 'none',
                                background: memo.category === cat ? 'var(--surface2)' : 'transparent',
                                color: 'var(--text)', cursor: 'pointer', borderRadius: 0,
                              }}>
                              {cat}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                {!selectMode && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button onClick={() => handleSendToAgent(memo.content)}
                    disabled={sending}
                    style={{ fontSize: 12, color: sending ? 'var(--text3)' : 'var(--accent)', background: 'none', border: 'none', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500, opacity: sending ? 0.6 : 1 }}>
                    {sending ? <Loader2 size={13} className="animate-spin" /> : <SendHorizonal size={13} />} {sending ? '发送中…' : '发送到 Agent'}
                  </button>
                  <button onClick={() => handleCopy(memo.content, memo.id)}
                    style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    {copiedId === memo.id ? <Check size={12} /> : <Copy size={12} />}
                    {copiedId === memo.id ? '已复制' : '复制'}
                  </button>
                  <button onClick={() => handleDelete(memo.id)}
                    style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      {/* Bottom action bar */}
      {selectMode && selectedIds.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="memo-bottom-bar"
          style={{
          position: 'sticky', bottom: 0,
          background: 'var(--surface)',
          borderTop: '0.5px solid var(--border)',
          padding: '12px 20px',
          margin: '0 -32px -28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>
            已选 {selectedIds.size} 条
          </span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={() => {
              if (isAllSelected) {
                setSelectedIds(new Set())
              } else {
                setSelectedIds(new Set(filtered.map(m => m.id)))
              }
            }}
              style={{
                padding: '7px 16px', fontSize: 13,
                border: '0.5px solid var(--border)',
                borderRadius: 'var(--r)',
                background: 'var(--surface)',
                color: 'var(--text2)',
                cursor: 'pointer',
              }}>
              {isAllSelected ? '取消全选' : '全选'}
            </button>
            <button onClick={handleBatchSend}
              disabled={sending}
              style={{
                background: sending ? 'var(--surface2)' : 'var(--accent)',
                color: sending ? 'var(--text3)' : '#1a1000',
                border: 'none',
                borderRadius: 'var(--r)',
                padding: '7px 16px',
                fontSize: 13,
                fontWeight: 500,
                cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: sending ? 0.6 : 1,
              }}>
              {sending ? <Loader2 size={14} className="animate-spin" /> : <SendHorizonal size={14} />}
              {sending ? '发送中…' : '→ 发送到 Agent'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}
