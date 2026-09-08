'use client'

import { useEffect, useState, useCallback } from 'react'
import { Copy, Check, SendHorizonal, Plus, Trash2, SlidersHorizontal, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { usePromptStore } from '@/store/usePromptStore'
import { useAgentStore } from '@/store/agentStore'

const BUILT_IN_TEMPLATES = [
  { title: '写 PRD', scene: '需求文档', content: '请帮我写一份产品需求文档。\n功能名称：[填写]\n目标用户：[填写]\n核心场景：[填写]\n请先确认以上信息后开始撰写' },
  { title: '整理会议纪要', scene: '会议记录', content: '请帮我整理以下会议记录，\n提取：参会人、核心决策、行动项（含负责人和截止时间）、\n待确认事项。会议记录如下：' },
  { title: '竞品分析', scene: '竞品研究', content: '请帮我对以下产品进行竞品分析，\n输出：核心功能对比、差异化优势、用户体验评估、\n可借鉴之处。产品名称：[填写]' },
  { title: '需求拆解', scene: '开发任务', content: '请将以下产品需求拆解为开发任务，\n按 P0/P1/P2 标注优先级，\n估算每个任务的工作量（小时）。\n需求描述：' },
  { title: '用户故事', scene: '敏捷开发', content: '请将以下需求转化为用户故事格式：\n作为[用户角色]，我希望[功能]，以便[价值]。\n并为每个故事添加验收标准。\n需求：' },
  { title: '复盘报告', scene: '产品复盘', content: '请帮我写一份产品复盘报告，\n结构：目标回顾、数据表现、做得好的、\n做得不好的、下期改进计划。\n复盘周期和产品信息：' },
]

function BuiltInCard({ tpl, copiedId, sending, onCopy, onSendToAgent }: {
  tpl: (typeof BUILT_IN_TEMPLATES)[number]; copiedId: string; sending: boolean
  onCopy: (c: string, id: string) => void; onSendToAgent: (c: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTemplate, setEditedTemplate] = useState(tpl.content)
  const id = tpl.title
  const isCopied = copiedId === id
  const displayContent = isEditing ? editedTemplate : tpl.content
  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 4 }}>{tpl.scene}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#1e1e1e', marginBottom: 6 }}>{tpl.title}</div>
      {isEditing ? (
        <textarea value={editedTemplate} onChange={(e) => setEditedTemplate(e.target.value)}
          style={{ width: '100%', height: 84, padding: 8, fontSize: 12, border: '1px solid #fcd34d', borderRadius: 8, outline: 'none', resize: 'none', marginBottom: 10, boxSizing: 'border-box', fontFamily: 'inherit' }} />
      ) : (
        <div style={{ fontSize: 12, color: '#999', lineHeight: 1.5, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tpl.content}</div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        {isEditing ? (
          <button onClick={() => setIsEditing(false)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, border: 'none', borderRadius: 6, background: '#f59e0b', color: '#fff', cursor: 'pointer' }}><Check size={11} /> 完成</button>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, border: '1px solid #e5e5e5', borderRadius: 6, background: '#fafafa', color: '#666', cursor: 'pointer', whiteSpace: 'nowrap' }}><SlidersHorizontal size={11} /> 编辑</button>
        )}
        <button onClick={() => onCopy(displayContent, id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, border: '1px solid #e5e5e5', borderRadius: 6, background: '#fafafa', color: '#666', cursor: 'pointer', whiteSpace: 'nowrap' }}>{isCopied ? <Check size={11} /> : <Copy size={11} />} {isCopied ? '已复制' : '复制'}</button>
      </div>
    </div>
  )
}

function MyPromptCard({ prompt, copiedId, sending, onCopy, onSendToAgent, onDelete, onUpdate, onStartEdit }: {
  prompt: { id: string; title: string; content: string; category: string }; copiedId: string; sending: boolean
  onCopy: (c: string, id: string) => void; onSendToAgent: (c: string) => void; onDelete: (id: string) => void
  onUpdate: (id: string, fields: { title?: string; content?: string; category?: string }) => void
  onStartEdit: (p: { id: string; title: string; content: string; category: string }) => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isCopied = copiedId === prompt.id

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, padding: '14px 16px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, color: '#f59e0b' }}>{prompt.category}</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {confirmDelete ? (
            <>
              <span style={{ fontSize: 11, color: '#ef4444', fontWeight: 500 }}>删除？</span>
              <button onClick={() => { onDelete(prompt.id); setConfirmDelete(false) }} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10, padding: '2px 6px' }}>是</button>
              <button onClick={() => setConfirmDelete(false)} style={{ background: '#e5e5e5', color: '#666', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 10, padding: '2px 6px' }}>否</button>
            </>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{ background: 'none', border: 'none', color: '#ddd', cursor: 'pointer', padding: 2 }}><Trash2 size={13} /></button>
          )}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: '#1e1e1e', margin: '6px 0 4px' }}>{prompt.title}</div>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          fontSize: 12, color: '#999', lineHeight: 1.5, cursor: 'pointer',
          overflow: 'hidden',
          ...(expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }),
        }}
      >
        {prompt.content}
      </div>
      {prompt.content.length > 80 && (
        <div onClick={() => setExpanded(!expanded)} style={{ fontSize: 11, color: '#c9a55a', cursor: 'pointer', marginTop: 2 }}>
          {expanded ? '收起 ▲' : '展开 ▼'}
        </div>
      )}
      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
        <button onClick={() => onStartEdit(prompt)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, border: '1px solid #e5e5e5', borderRadius: 6, background: '#fafafa', color: '#666', cursor: 'pointer' }}><SlidersHorizontal size={11} /> 编辑</button>
        <button onClick={() => onCopy(prompt.content, prompt.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, border: '1px solid #e5e5e5', borderRadius: 6, background: '#fafafa', color: '#666', cursor: 'pointer' }}>{isCopied ? <Check size={11} /> : <Copy size={11} />} {isCopied ? '已复制' : '复制'}</button>
        <button onClick={() => onSendToAgent(prompt.content)} disabled={sending} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 11, fontWeight: 500, border: 'none', borderRadius: 6, background: '#fef3c7', color: '#b45309', cursor: 'pointer', opacity: sending ? 0.6 : 1 }}>{sending ? <Loader2 size={11} /> : <SendHorizonal size={11} />} {sending ? '发送中…' : '发送到 Agent'}</button>
      </div>
    </div>
  )
}


export default function PromptLibrary() {
  const { prompts, loading, fetchPrompts, addPrompt, updatePrompt, deletePrompt } = usePromptStore()
  const { startConversation, sendMessage } = useAgentStore()
  const router = useRouter()

  const [modalOpen, setModalOpen] = useState(false)
  const [formTitle, setFormTitle] = useState('')
  const [formScene, setFormScene] = useState('')
  const [formContent, setFormContent] = useState('')
  const [copiedId, setCopiedId] = useState('')
  const [sending, setSending] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<{ id: string; title: string; content: string; category: string } | null>(null)

  useEffect(() => { fetchPrompts() }, [fetchPrompts])

  const handleCopy = useCallback(async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(''), 1500)
  }, [])

  const handleSendToAgent = useCallback(async (content: string) => {
    setSending(true); await startConversation(); await sendMessage(content); router.push('/agent')
  }, [startConversation, sendMessage, router])

  const handleDelete = useCallback(async (id: string) => { await deletePrompt(id); toast.success('已删除') }, [deletePrompt])
  const handleUpdate = useCallback(async (id: string, fields: { title?: string; content?: string; category?: string }) => { await updatePrompt(id, fields); toast.success('已更新') }, [updatePrompt])

  const handleCreate = useCallback(async () => {
    if (!formTitle.trim() || !formContent.trim()) return
    await addPrompt({ title: formTitle.trim(), content: formContent.trim(), category: formScene.trim() || '其他', tags: formScene.trim() ? [formScene.trim()] : [] })
    setFormTitle(''); setFormScene(''); setFormContent(''); setModalOpen(false); toast.success('Prompt 已创建')
  }, [formTitle, formScene, formContent, addPrompt])

  return (
    <div style={{ background: '#FDFBF7', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .scrollbar-builtin { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .scrollbar-builtin:hover { scrollbar-color: rgba(163,163,163,0.5) transparent; }
        .scrollbar-builtin::-webkit-scrollbar { height: 4px; }
        .scrollbar-builtin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-builtin::-webkit-scrollbar-thumb { background: transparent; border-radius: 4px; }
        .scrollbar-builtin:hover::-webkit-scrollbar-thumb { background: rgba(163,163,163,0.5); }
      `}</style>

      {/* Fixed header */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px 16px', width: '100%', boxSizing: 'border-box' }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1e1e1e', margin: 0 }}>Prompt 库</h1>
      </div>

      {/* Scrollable content — always reserve scrollbar space */}
      <div style={{ flex: 1, overflowY: 'scroll', padding: '4px 32px 32px' }}>
        <div style={{ display: 'flex', gap: 0 }}>
        {/* 左侧：模板示例 */}
        <div style={{ width: 280, flexShrink: 0, paddingRight: 28 }}>
          <div style={{ fontSize: 12, color: '#999', letterSpacing: '0.06em', marginBottom: 10 }}>模板示例</div>
          <div className="scrollbar-builtin" style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: 'calc(100vh - 180px)' }}>
            {BUILT_IN_TEMPLATES.map((tpl) => (
              <BuiltInCard key={tpl.title} tpl={tpl} copiedId={copiedId} sending={sending} onCopy={handleCopy} onSendToAgent={handleSendToAgent} />
            ))}
          </div>
        </div>

        {/* 右侧：我的 Prompt */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <>
              <button onClick={() => setModalOpen(true)}
                style={{ background: '#c9a55a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                <Plus size={14} /> 新建 Prompt
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: '#999', letterSpacing: '0.06em' }}>我的 Prompt</span>
                <span style={{ fontSize: 11, padding: '1px 8px', background: '#f0f0f0', borderRadius: 10, color: '#999' }}>{prompts.length}</span>
              </div>
              {prompts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#ccc', fontSize: 13 }}>还没有自定义 Prompt</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                  {prompts.map((p) => (
                    <MyPromptCard key={p.id} prompt={p} copiedId={copiedId} sending={sending} onCopy={handleCopy} onSendToAgent={handleSendToAgent} onDelete={handleDelete} onUpdate={handleUpdate} onStartEdit={setEditingPrompt} />
                  ))}
                </div>
              )}
            </>
        </div>
      </div>
      </div>

      {/* 新建 Modal */}
      {modalOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} onClick={() => setModalOpen(false)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 560, maxWidth: '90vw', background: '#fff', borderRadius: 16, padding: 28, zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>新建 Prompt</h2>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>标题 *</div>
                <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Prompt 名称" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>场景标签</div>
                <input value={formScene} onChange={(e) => setFormScene(e.target.value)} placeholder="如「需求分析」「竞品」" style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>内容 *</div>
              <textarea value={formContent} onChange={(e) => setFormContent(e.target.value)} placeholder="编写 Prompt 模板，使用 [填写] 作为占位符…" rows={8} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 180, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.7 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => { setModalOpen(false); setFormTitle(''); setFormScene(''); setFormContent('') }} style={{ padding: '10px 24px', fontSize: 14, border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', color: '#666', cursor: 'pointer' }}>取消</button>
              <button onClick={handleCreate} disabled={!formTitle.trim() || !formContent.trim()} style={{ padding: '10px 24px', fontSize: 14, border: 'none', borderRadius: 8, background: !formTitle.trim() || !formContent.trim() ? '#e5e5e5' : '#1e1e1e', color: '#fff', cursor: !formTitle.trim() || !formContent.trim() ? 'not-allowed' : 'pointer', fontWeight: 500 }}>保存</button>
            </div>
          </div>
        </>
      )}

      {/* 编辑 Modal — 和新建一模一样 */}
      {editingPrompt && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} onClick={() => setEditingPrompt(null)} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 560, maxWidth: '90vw', background: '#fff', borderRadius: 16, padding: 28, zIndex: 1001, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>编辑 Prompt</h2>
              <button onClick={() => setEditingPrompt(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>标题</div>
                <input value={editingPrompt.title} onChange={e => setEditingPrompt({ ...editingPrompt, title: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>场景标签</div>
                <input value={editingPrompt.category} onChange={e => setEditingPrompt({ ...editingPrompt, category: e.target.value })} style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#666', marginBottom: 4 }}>内容</div>
              <textarea value={editingPrompt.content} onChange={e => setEditingPrompt({ ...editingPrompt, content: e.target.value })} rows={8} style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 180, boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.7 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button onClick={() => setEditingPrompt(null)} style={{ padding: '10px 24px', fontSize: 14, border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', color: '#666', cursor: 'pointer' }}>取消</button>
              <button onClick={() => { handleUpdate(editingPrompt.id, { title: editingPrompt.title, content: editingPrompt.content, category: editingPrompt.category }); setEditingPrompt(null) }} style={{ padding: '10px 24px', fontSize: 14, border: 'none', borderRadius: 8, background: '#c9a55a', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>保存</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
