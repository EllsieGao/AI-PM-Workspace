'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ExternalLink, FileText, BarChart3, Loader2, X, Search, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useRadarStore } from '@/store/radarStore'
import { useAgentStore } from '@/store/agentStore'
import { useRouter } from 'next/navigation'

const PROJECT_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#06b6d4']

export default function RadarCenter() {
  const {
    projects, activeProjectId, competitors, notes, loading, analyzing,
    fetchProjects, createProject, deleteProject, setActiveProject,
    addCompetitor, updateCompetitor, deleteCompetitor,
    addNote, updateNote, deleteNote, analyzeCompetitors,
  } = useRadarStore()
  const { sendMessage } = useAgentStore()
  const router = useRouter()

  const [showNewProject, setShowNewProject] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [tab, setTab] = useState<'competitors' | 'notes'>('competitors')

  // Competitor form
  const [showAddComp, setShowAddComp] = useState(false)
  const [compForm, setCompForm] = useState({ name: '', url: '', description: '', tags: '' })

  // Note form
  const [showAddNote, setShowAddNote] = useState(false)
  const [noteForm, setNoteForm] = useState({ title: '', content: '', tags: '' })

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const activeProject = projects.find(p => p.id === activeProjectId)

  const handleAddComp = async () => {
    if (!compForm.name || !activeProjectId) return
    await addCompetitor({
      project_id: activeProjectId,
      name: compForm.name,
      url: compForm.url,
      description: compForm.description,
      features_json: {},
      tags: compForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setCompForm({ name: '', url: '', description: '', tags: '' })
    setShowAddComp(false)
    toast.success('竞品已添加')
  }

  const handleAddNote = async () => {
    if (!noteForm.title || !activeProjectId) return
    await addNote({
      project_id: activeProjectId,
      title: noteForm.title,
      content: noteForm.content,
      tags: noteForm.tags.split(',').map(t => t.trim()).filter(Boolean),
    })
    setNoteForm({ title: '', content: '', tags: '' })
    setShowAddNote(false)
    toast.success('笔记已保存')
  }

  const handleAnalyze = async () => {
    if (!activeProjectId || competitors.length === 0) {
      toast.error('请先添加竞品')
      return
    }
    const msg = await analyzeCompetitors(activeProjectId)
    toast.success(msg)
  }

  const handleSendToAgent = (name: string, desc: string) => {
    const prompt = `请帮我深度分析竞品「${name}」：\n\n${desc}\n\n请从核心功能、目标用户、商业模式、优势劣势、差异化机会等维度进行分析。`
    sessionStorage.setItem('agent_prefill', prompt)
    router.push('/agent')
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#FDFBF7' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 40px' }}>
        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e1e1e', margin: 0 }}>竞品雷达</h1>
            <p style={{ fontSize: 13, color: '#999', margin: '4px 0 0' }}>追踪竞品动态，AI 智能分析竞争格局</p>
          </div>
          <button
            onClick={() => { setShowNewProject(true); setNewProjectName(''); setNewProjectDesc('') }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
              borderRadius: 10, border: 'none', cursor: 'pointer',
              background: '#c9a55a', color: '#fff', fontSize: 13, fontWeight: 500,
            }}
          >
            <Plus size={16} /> 新建项目
          </button>
        </div>

        {/* ── Project Tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {projects.map(p => (
            <button
              key={p.id}
              onClick={() => setActiveProject(p.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 20, border: activeProjectId === p.id ? `2px solid ${p.color}` : '1.5px solid #e5e5e5',
                background: activeProjectId === p.id ? `${p.color}10` : '#fff',
                color: activeProjectId === p.id ? p.color : '#666',
                fontSize: 13, fontWeight: activeProjectId === p.id ? 600 : 400,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
              {p.name}
              {projects.length > 1 && (
                <span onClick={(e) => { e.stopPropagation(); deleteProject(p.id) }}
                  style={{ marginLeft: 4, color: '#ccc', fontSize: 14, cursor: 'pointer', lineHeight: 1 }}>
                  ×
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── New project modal ── */}
        <AnimatePresence>
          {showNewProject && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowNewProject(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                style={{ background: '#fff', borderRadius: 16, padding: 24, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px' }}>新建竞品项目</h3>
                <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                  placeholder="项目名称，如：AI 视频工具调研"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }} />
                <input value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)}
                  placeholder="项目描述（可选）"
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 14, marginBottom: 16, outline: 'none', boxSizing: 'border-box' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowNewProject(false)}
                    style={{ flex: 1, padding: '10px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 14 }}>取消</button>
                  <button onClick={() => {
                    if (newProjectName.trim()) {
                      createProject(newProjectName.trim(), newProjectDesc.trim(), PROJECT_COLORS[projects.length % PROJECT_COLORS.length])
                      setShowNewProject(false)
                    }
                  }}
                    style={{ flex: 1, padding: '10px', border: 'none', borderRadius: 8, background: '#c9a55a', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>创建</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeProject ? (
          <div style={{ textAlign: 'center', padding: 80, color: '#ccc', fontSize: 14 }}>
            创建你的第一个竞品追踪项目
          </div>
        ) : (
          <>
            {/* ── Tab switch ── */}
            <div style={{ display: 'flex', gap: 24, marginBottom: 20, borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
              {[
                { key: 'competitors' as const, icon: BarChart3, label: `竞品 (${competitors.length})` },
                { key: 'notes' as const, icon: FileText, label: `行业笔记 (${notes.length})` },
              ].map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', border: 'none', background: 'none',
                    cursor: 'pointer', fontSize: 14, fontWeight: tab === t.key ? 600 : 400,
                    color: tab === t.key ? '#1e1e1e' : '#aaa', borderBottom: tab === t.key ? '2px solid #1e1e1e' : '2px solid transparent',
                  }}>
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            {/* ═══════ 竞品列表 ═══════ */}
            {tab === 'competitors' && (
              <>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <button onClick={() => setShowAddComp(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1.5px dashed #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#888' }}>
                    <Plus size={15} /> 添加竞品
                  </button>
                  <button onClick={handleAnalyze} disabled={analyzing}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: 'none', background: analyzing ? '#f0f0f0' : '#fef3c7', color: analyzing ? '#ccc' : '#b45309', cursor: analyzing ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500 }}>
                    {analyzing ? <Loader2 size={15} className="animate-spin" /> : <BarChart3 size={15} />}
                    {analyzing ? 'AI 分析中…' : 'AI 分析矩阵'}
                  </button>
                </div>

                {/* Add competitor inline */}
                <AnimatePresence>
                  {showAddComp && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 10, padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
                        <input placeholder="竞品名称" value={compForm.name} onChange={e => setCompForm(p => ({ ...p, name: e.target.value }))}
                          style={{ flex: '1 1 200px', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                        <input placeholder="URL（可选）" value={compForm.url} onChange={e => setCompForm(p => ({ ...p, url: e.target.value }))}
                          style={{ flex: '1 1 250px', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                        <input placeholder="简短描述" value={compForm.description} onChange={e => setCompForm(p => ({ ...p, description: e.target.value }))}
                          style={{ flex: '2 1 400px', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                        <input placeholder="标签（逗号分隔）" value={compForm.tags} onChange={e => setCompForm(p => ({ ...p, tags: e.target.value }))}
                          style={{ flex: '1 1 200px', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, outline: 'none' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setShowAddComp(false)}
                            style={{ padding: '8px 14px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>取消</button>
                          <button onClick={handleAddComp}
                            style={{ padding: '8px 14px', border: 'none', borderRadius: 8, background: '#c9a55a', color: '#fff', cursor: 'pointer', fontSize: 13 }}>添加</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Competitor cards grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
                  <AnimatePresence>
                    {competitors.map(comp => (
                      <motion.div key={comp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: 18, position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                          <div>
                            <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#1e1e1e' }}>{comp.name}</h3>
                            {comp.url && (
                              <a href={comp.url.startsWith('http') ? comp.url : `https://${comp.url}`} target="_blank" rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#999', textDecoration: 'none', marginTop: 2 }}>
                                {comp.url} <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => handleSendToAgent(comp.name, comp.description)}
                              title="发给 Agent 深度分析"
                              style={{ background: 'none', border: '1px solid #f0f0f0', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#999' }}>
                              <Send size={13} />
                            </button>
                            <button onClick={() => deleteCompetitor(comp.id)}
                              style={{ background: 'none', border: '1px solid #f0f0f0', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#ddd' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        {comp.description && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: '0 0 10px' }}>{comp.description}</p>}
                        {comp.tags && comp.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {comp.tags.map(t => (
                              <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: '#f5f5f5', borderRadius: 10, color: '#888' }}>{t}</span>
                            ))}
                          </div>
                        )}
                        {comp.features_json && Object.keys(comp.features_json).length > 0 && (
                          <div style={{ marginTop: 12, padding: 12, background: '#fefce8', borderRadius: 8, border: '1px solid #fef08a' }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#a16207', marginBottom: 6 }}>AI 分析矩阵</div>
                            {Object.entries(comp.features_json).map(([k, v]) => (
                              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 3, fontSize: 12 }}>
                                <span style={{ color: '#b45309', fontWeight: 500, minWidth: 60 }}>{k}</span>
                                <span style={{ color: '#666' }}>{v}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* ═══════ 行业笔记 ═══════ */}
            {tab === 'notes' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <button onClick={() => setShowAddNote(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, border: '1.5px dashed #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, color: '#888' }}>
                    <Plus size={15} /> 添加笔记
                  </button>
                </div>

                <AnimatePresence>
                  {showAddNote && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: 'hidden', marginBottom: 16 }}>
                      <div style={{ padding: 16, background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' }}>
                        <input placeholder="笔记标题" value={noteForm.title} onChange={e => setNoteForm(p => ({ ...p, title: e.target.value }))}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, marginBottom: 8, outline: 'none', boxSizing: 'border-box' }} />
                        <textarea placeholder="笔记内容" value={noteForm.content} onChange={e => setNoteForm(p => ({ ...p, content: e.target.value }))} rows={4}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, marginBottom: 8, outline: 'none', resize: 'none', boxSizing: 'border-box' }} />
                        <input placeholder="标签（逗号分隔）" value={noteForm.tags} onChange={e => setNoteForm(p => ({ ...p, tags: e.target.value }))}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e5e5', borderRadius: 8, fontSize: 13, marginBottom: 10, outline: 'none', boxSizing: 'border-box' }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setShowAddNote(false)}
                            style={{ padding: '8px 14px', border: '1px solid #e5e5e5', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}>取消</button>
                          <button onClick={handleAddNote}
                            style={{ padding: '8px 14px', border: 'none', borderRadius: 8, background: '#c9a55a', color: '#fff', cursor: 'pointer', fontSize: 13 }}>保存</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
                  <AnimatePresence>
                    {notes.map(note => (
                      <motion.div key={note.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: 18 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                          <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: '#1e1e1e' }}>{note.title}</h3>
                          <button onClick={() => deleteNote(note.id)}
                            style={{ background: 'none', border: '1px solid #f0f0f0', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#ddd' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{note.content.slice(0, 300)}{note.content.length > 300 ? '…' : ''}</p>
                        {note.tags.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 }}>
                            {note.tags.map(t => (
                              <span key={t} style={{ fontSize: 11, padding: '2px 8px', background: '#f5f5f5', borderRadius: 10, color: '#888' }}>{t}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
