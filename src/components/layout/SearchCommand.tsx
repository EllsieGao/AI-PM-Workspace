"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  MessageSquare,
  FileText,
  Lightbulb,
  Crosshair,
  Bookmark,
  Search,
  Home,
} from "lucide-react"
import { createClient } from "@/lib/supabase"

interface SearchResult {
  id: string
  title: string
  type: "agent" | "doc" | "memo" | "competitor" | "prompt" | "navigation"
  subtitle?: string
  href: string
}

const NAV_ITEMS: SearchResult[] = [
  { id: "nav-home", title: "首页 Dashboard", type: "navigation", subtitle: "概览与快捷入口", href: "/" },
  { id: "nav-agent", title: "AI Agent", type: "navigation", subtitle: "AI 智能助手", href: "/agent" },
  { id: "nav-docs", title: "文档中心", type: "navigation", subtitle: "PRD、会议纪要等", href: "/docs" },
  { id: "nav-memos", title: "灵感速记", type: "navigation", subtitle: "快速记录想法", href: "/memos" },
  { id: "nav-radar", title: "竞品雷达", type: "navigation", subtitle: "竞品追踪与分析", href: "/radar" },
  { id: "nav-prompts", title: "Prompt 库", type: "navigation", subtitle: "Prompt 模板管理", href: "/prompts" },
]

const TYPE_ICONS: Record<string, React.ElementType> = {
  agent: MessageSquare,
  doc: FileText,
  memo: Lightbulb,
  competitor: Crosshair,
  prompt: Bookmark,
  navigation: Home,
}

const TYPE_LABELS: Record<string, string> = {
  agent: "Agent 对话",
  doc: "文档",
  memo: "速记",
  competitor: "竞品",
  prompt: "Prompt",
  navigation: "导航",
}

export default function SearchCommand() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "K" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search across all modules
  const searchAll = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    const supabase = createClient()
    const term = `%${q}%`

    const allResults: SearchResult[] = [...NAV_ITEMS.filter(n =>
      n.title.includes(q) || n.subtitle?.includes(q)
    )]

    try {
      const [
        { data: convos },
        { data: docs },
        { data: memos },
        { data: comps },
        { data: prompts },
      ] = await Promise.all([
        supabase.from("conversations").select("id, title").ilike("title", term).limit(5),
        supabase.from("documents").select("id, title, type").ilike("title", term).limit(5),
        supabase.from("memos").select("id, title, content").ilike("content", term).limit(5),
        supabase.from("competitors").select("id, name, description").ilike("name", term).limit(5),
        supabase.from("prompts").select("id, title, category").ilike("title", term).limit(5),
      ])

      if (convos) allResults.push(...convos.map((c: any) => ({
        id: c.id, title: c.title || "新对话", type: "agent" as const,
        subtitle: "Agent 对话", href: "/agent",
      })))
      if (docs) allResults.push(...docs.map((d: any) => ({
        id: d.id, title: d.title || "未命名文档", type: "doc" as const,
        subtitle: d.type || "文档", href: `/docs/${d.id}`,
      })))
      if (memos) allResults.push(...memos.map((m: any) => ({
        id: m.id, title: m.content?.slice(0, 60) || m.title || "速记", type: "memo" as const,
        subtitle: "灵感速记", href: "/memos",
      })))
      if (comps) allResults.push(...comps.map((c: any) => ({
        id: c.id, title: c.name, type: "competitor" as const,
        subtitle: c.description?.slice(0, 40) || "竞品", href: "/radar",
      })))
      if (prompts) allResults.push(...prompts.map((p: any) => ({
        id: p.id, title: p.title, type: "prompt" as const,
        subtitle: p.category || "Prompt", href: "/prompts",
      })))
    } catch {
      // Search failed, just show nav items
    }

    setResults(allResults)
    setLoading(false)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => searchAll(query), 200)
    return () => clearTimeout(timer)
  }, [query, searchAll])

  const handleSelect = (item: SearchResult) => {
    setOpen(false)
    setQuery("")
    router.push(item.href)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
        }}
      />

      {/* Command palette */}
      <div
        style={{
          position: "fixed",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 520,
          maxWidth: "90vw",
          zIndex: 1000,
        }}
      >
        <Command
          shouldFilter={false}
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "0.5px solid #e8e4de",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.06)",
            overflow: "hidden",
          }}
        >
          {/* Search input */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "14px 18px",
              borderBottom: "0.5px solid #f0f0f0",
            }}
          >
            <Search size={18} color="#b5aba0" />
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="搜索文档、对话、速记、竞品、Prompt…"
              autoFocus
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 15,
                color: "#3d3833",
                background: "transparent",
                fontFamily: "inherit",
              }}
            />
            <kbd
              style={{
                fontSize: 11,
                padding: "2px 6px",
                borderRadius: 4,
                background: "#f5f3f0",
                color: "#b5aba0",
                border: "0.5px solid #e8e4de",
              }}
            >
              esc
            </kbd>
          </div>

          {/* Results */}
          <Command.List
            style={{
              maxHeight: 360,
              overflowY: "auto",
              padding: 8,
            }}
          >
            <Command.Empty
              style={{
                padding: "32px 20px",
                textAlign: "center",
                fontSize: 13,
                color: "#b5aba0",
              }}
            >
              {loading ? "搜索中…" : "未找到结果"}
            </Command.Empty>

            {results.map((item) => {
              const Icon = TYPE_ICONS[item.type] || FileText
              return (
                <Command.Item
                  key={`${item.type}-${item.id}`}
                  value={`${item.type}-${item.id}`}
                  onSelect={() => handleSelect(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 14,
                    color: "#3d3833",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FDFBF7"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent"
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "#f5f3f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color="#8a8075" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#3d3833",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div style={{ fontSize: 11, color: "#b5aba0", marginTop: 1 }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      padding: "1px 6px",
                      borderRadius: 4,
                      background: "#f5f3f0",
                      color: "#8a8075",
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_LABELS[item.type]}
                  </span>
                </Command.Item>
              )
            })}
          </Command.List>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              gap: 16,
              padding: "10px 18px",
              borderTop: "0.5px solid #f0f0f0",
              fontSize: 11,
              color: "#b5aba0",
            }}
          >
            <span>
              <kbd style={{ padding: "1px 4px", borderRadius: 3, background: "#f5f3f0", border: "0.5px solid #e8e4de", fontSize: 10 }}>↑↓</kbd> 导航
            </span>
            <span>
              <kbd style={{ padding: "1px 4px", borderRadius: 3, background: "#f5f3f0", border: "0.5px solid #e8e4de", fontSize: 10 }}>Enter</kbd> 跳转
            </span>
            <span>
              <kbd style={{ padding: "1px 4px", borderRadius: 3, background: "#f5f3f0", border: "0.5px solid #e8e4de", fontSize: 10 }}>Esc</kbd> 关闭
            </span>
          </div>
        </Command>
      </div>
    </>
  )
}
