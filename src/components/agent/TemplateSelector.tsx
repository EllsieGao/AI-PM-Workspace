'use client'
import { useState } from 'react'
import { PRD_TEMPLATES, PrdTemplate } from '@/lib/prdTemplates'

interface Props {
  onSelect: (template: PrdTemplate | null) => void
  selected: PrdTemplate | null
}

export default function TemplateSelector({ onSelect, selected }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          fontSize: '12px',
          padding: '4px 10px',
          border: '0.5px solid var(--border2)',
          borderRadius: '4px',
          background: selected ? 'var(--accent)' : 'var(--surface)',
          color: selected ? '#1a1000' : 'var(--text2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        📋 {selected ? selected.name : 'PRD 模板'}
        {selected && (
          <span
            onClick={e => { e.stopPropagation(); onSelect(null); }}
            style={{ marginLeft: '4px', opacity: 0.7 }}
          >×</span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          bottom: '32px',
          left: 0,
          background: 'var(--surface)',
          border: '0.5px solid var(--border2)',
          borderRadius: 'var(--r)',
          width: '260px',
          zIndex: 50,
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: '11px',
            color: 'var(--text3)',
            borderBottom: '0.5px solid var(--border)',
            letterSpacing: '.06em',
            textTransform: 'uppercase',
          }}>
            选择 PRD 模板
          </div>
          {PRD_TEMPLATES.map(t => (
            <div
              key={t.id}
              onClick={() => { onSelect(t); setOpen(false); }}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                borderBottom: '0.5px solid var(--border)',
                background: selected?.id === t.id ? 'var(--surface2)' : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
              onMouseLeave={e => (e.currentTarget.style.background =
                selected?.id === t.id ? 'var(--surface2)' : 'transparent')}
            >
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)', marginBottom: '2px' }}>
                {t.name}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                {t.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
