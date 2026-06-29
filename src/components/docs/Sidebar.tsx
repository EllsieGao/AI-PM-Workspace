"use client"

import { useEffect, useState } from "react"
import { Search, Plus, ChevronDown } from "lucide-react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { useDocStore } from "@/store/docStore"
import DocList from "./DocList"
import type { DocFilter, DocType } from "@/lib/types"

const filters: { key: DocFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "prd", label: "PRD" },
  { key: "meeting", label: "会议纪要" },
  { key: "tech", label: "技术方案" },
  { key: "review", label: "复盘报告" },
]

const quickItems: { type: DocType; label: string; engLabel: string; dotClass: string }[] = [
  { type: "prd", label: "PRD", engLabel: "PRD Template", dotClass: "bg-purple-400/80" },
  { type: "meeting", label: "会议纪要", engLabel: "Meeting Minutes", dotClass: "bg-blue-400/80" },
  { type: "tech", label: "技术方案", engLabel: "Tech Specification", dotClass: "bg-emerald-400/80" },
  { type: "review", label: "复盘报告", engLabel: "Retro Report", dotClass: "bg-amber-400/80" },
]

const drawerVariants: Variants = {
  open: {
    height: "auto",
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      height: { duration: 0.25, ease: "easeOut" },
      opacity: { duration: 0.2, delay: 0.05 },
      filter: { duration: 0.15, delay: 0.02 },
    },
  },
  closed: {
    height: 0,
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      height: { duration: 0.25, ease: "easeInOut" },
      opacity: { duration: 0.15 },
      filter: { duration: 0.1 },
    },
  },
}

export default function Sidebar() {
  const { filter, searchQuery, setFilter, setSearchQuery, createDoc, fetchDocs } = useDocStore()
  const [showSearch, setShowSearch] = useState(false)
  const [newOpen, setNewOpen] = useState(false)

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  return (
    <div
      style={{
        width: 230,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--sidebar)",
        borderRight: "0.5px solid var(--border)",
      }}
    >
      {/* Top bar */}
      <div style={{ padding: "12px 14px", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>文档中心</span>
          <button
            onClick={() => setShowSearch((s) => !s)}
            style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer", padding: 4 }}
          >
            <Search size={16} />
          </button>
        </div>
        <button
          onClick={() => setNewOpen(!newOpen)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 12px', borderRadius: 8,
            border: 'none', background: '#c9a55a', color: '#fff',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >
          <span className="flex items-center gap-2">
            <Plus size={15} strokeWidth={1.5} />
            <span>新建</span>
          </span>
          <motion.span
            animate={{ rotate: newOpen ? 180 : 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ display: "inline-flex" }}
          >
            <ChevronDown size={15} strokeWidth={1.5} />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {newOpen && (
            <motion.div
              variants={drawerVariants}
              initial="closed"
              animate="open"
              exit="closed"
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "8px 4px 0", display: "flex", flexDirection: "column" }}>
                {quickItems.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => createDoc(item.type)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', color: '#666', fontSize: 13 }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full ${item.dotClass}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search input */}
      {showSearch && (
        <div style={{ padding: "8px 14px", borderBottom: "0.5px solid var(--border)" }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文档…"
            autoFocus
            style={{
              width: "100%",
              height: 30,
              fontSize: 12,
              color: "var(--text)",
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              borderRadius: 6,
              padding: "0 8px",
              outline: "none",
            }}
          />
        </div>
      )}

      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "10px 14px",
          borderBottom: "0.5px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        {filters.map((f) => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "3px 10px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                color: active ? "#fff" : "var(--text2)",
                background: active ? "var(--accent)" : "var(--surface)",
                transition: "all 0.15s",
              }}
            >
              {f.label}
            </button>
          )
        })}
      </div>

      {/* Doc list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <DocList />
      </div>

    </div>
  )
}
