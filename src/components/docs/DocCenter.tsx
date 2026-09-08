'use client'

import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import DocEditor from './DocEditor'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useDocStore } from '@/store/docStore'

export default function DocCenter() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { activeDoc, createDoc } = useDocStore()

  // Close sidebar drawer when a doc is selected
  useEffect(() => {
    if (activeDoc) setSidebarOpen(false)
  }, [activeDoc])

  if (isMobile) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
        {/* Drawer overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          }} />
        )}
        {/* Drawer */}
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px',
          background: 'var(--sidebar)', zIndex: 201,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease', overflowY: 'auto',
        }}>
          <div style={{
            padding: '16px', borderBottom: '0.5px solid var(--border)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500 }}>文档列表</span>
            <button onClick={() => setSidebarOpen(false)} style={{
              background: 'none', border: 'none', color: 'var(--text2)', fontSize: '18px', cursor: 'pointer',
            }}>×</button>
          </div>
          <Sidebar />
        </div>

        {/* Top bar */}
        <div style={{
          height: 'var(--mobile-header-height)', display: 'flex', alignItems: 'center',
          padding: '0 12px', borderBottom: '0.5px solid var(--border)',
          justifyContent: 'space-between', background: 'var(--sidebar)', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => setSidebarOpen(true)} style={{
              background: 'none', border: 'none', color: 'var(--text)', fontSize: '22px', cursor: 'pointer', padding: 0,
            }}>☰</button>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeDoc?.title || '文档中心'}
            </span>
          </div>
          <button onClick={() => createDoc('prd')} style={{
            fontSize: '12px', fontWeight: 500, padding: '6px 14px', borderRadius: 6,
            border: 'none', background: '#c9a55a', color: '#fff', cursor: 'pointer',
          }}>
            + 新建
          </button>
        </div>

        {/* Editor */}
        <DocEditor />
      </div>
    )
  }

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <DocEditor />
    </div>
  )
}
