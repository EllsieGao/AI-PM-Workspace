"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  MessageSquare,
  FileText,
  Lightbulb,
  Crosshair,
  Bookmark,
  Plus,
  ArrowRight,
} from "lucide-react"
import { createClient } from "@/lib/supabase"

interface Stats {
  conversations: number
  documents: number
  memos: number
  competitors: number
  prompts: number
}

const MODULES = [
  {
    key: "agent",
    label: "AI Agent",
    description: "AI 智能助手，撰写文档、分析竞品、拆解需求",
    icon: MessageSquare,
    href: "/agent",
    color: "#c9a55a",
    bg: "rgba(201,165,90,0.08)",
    statLabel: "条对话",
  },
  {
    key: "docs",
    label: "文档中心",
    description: "PRD、会议纪要、技术方案、复盘报告",
    icon: FileText,
    href: "/docs",
    color: "#9b87f5",
    bg: "rgba(155,135,245,0.08)",
    statLabel: "篇文档",
  },
  {
    key: "memos",
    label: "灵感速记",
    description: "快速记录想法，标签分类，一键发送 Agent",
    icon: Lightbulb,
    href: "/memos",
    color: "#60b8fa",
    bg: "rgba(96,184,250,0.08)",
    statLabel: "条速记",
  },
  {
    key: "radar",
    label: "竞品雷达",
    description: "追踪竞品动态，AI 智能分析竞争格局",
    icon: Crosshair,
    href: "/radar",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    statLabel: "个竞品",
  },
  {
    key: "prompts",
    label: "Prompt 库",
    description: "收藏、管理、复用你的 AI Prompt 模板",
    icon: Bookmark,
    href: "/prompts",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    statLabel: "个 Prompt",
  },
]

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<Stats>({
    conversations: 0,
    documents: 0,
    memos: 0,
    competitors: 0,
    prompts: 0,
  })
  const [recentDocs, setRecentDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const [
        { count: cCount },
        { count: dCount },
        { count: mCount },
        { count: compCount },
        { count: pCount },
        { data: recent },
      ] = await Promise.all([
        supabase.from("conversations").select("*", { count: "exact", head: true }),
        supabase.from("documents").select("*", { count: "exact", head: true }),
        supabase.from("memos").select("*", { count: "exact", head: true }),
        supabase.from("competitors").select("*", { count: "exact", head: true }),
        supabase.from("prompts").select("*", { count: "exact", head: true }),
        supabase
          .from("documents")
          .select("id, title, type, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
      ])
      setStats({
        conversations: cCount || 0,
        documents: dCount || 0,
        memos: mCount || 0,
        competitors: compCount || 0,
        prompts: pCount || 0,
      })
      setRecentDocs(recent || [])
      setLoading(false)
    }
    loadData()
  }, [])

  const getStatForModule = (key: string) => {
    switch (key) {
      case "agent": return stats.conversations
      case "docs": return stats.documents
      case "memos": return stats.memos
      case "radar": return stats.competitors
      case "prompts": return stats.prompts
      default: return 0
    }
  }

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div
      style={{
        height: "100%",
        overflowY: "auto",
        background: "#FDFBF7",
        padding: "32px 40px",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: 32 }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: "#3d3833",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          AI-PM 灵感空间
        </h1>
        <p style={{ fontSize: 14, color: "#b5aba0", margin: "4px 0 0" }}>
          你的 AI 产品经理工作台 — 智能、专注、高效
        </p>
      </motion.div>

      {/* Module Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {MODULES.map((mod) => {
          const count = getStatForModule(mod.key)
          return (
            <motion.div
              key={mod.key}
              variants={item}
              whileHover={{ y: -3, borderColor: mod.color }}
              onClick={() => router.push(mod.href)}
              style={{
                background: "#fff",
                border: "0.5px solid #e8e4de",
                borderRadius: 14,
                padding: "20px 20px 16px",
                cursor: "pointer",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 4px 20px ${mod.bg}`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none"
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: mod.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <mod.icon size={20} color={mod.color} />
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#3d3833",
                  marginBottom: 4,
                }}
              >
                {mod.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#b5aba0",
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                {mod.description}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span style={{ fontSize: 22, fontWeight: 700, color: mod.color }}>
                  {loading ? "—" : count}
                </span>
                <span style={{ fontSize: 11, color: "#b5aba0" }}>
                  {mod.statLabel}
                </span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Recent Documents */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          background: "#fff",
          border: "0.5px solid #e8e4de",
          borderRadius: 14,
          padding: "20px 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#3d3833", margin: 0 }}>
            📄 最近文档
          </h2>
          <button
            onClick={() => router.push("/docs")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "#c9a55a",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            查看全部 <ArrowRight size={14} />
          </button>
        </div>

        {recentDocs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#d4d4d4", fontSize: 13 }}>
            还没有文档，点击上方"文档中心"开始创作
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push(`/docs/${doc.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FDFBF7"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <FileText size={16} color="#b5aba0" />
                  <span style={{ fontSize: 14, color: "#3d3833", fontWeight: 500 }}>
                    {doc.title || "未命名文档"}
                  </span>
                  {doc.type && (
                    <span
                      style={{
                        fontSize: 10,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: "#f5f3f0",
                        color: "#8a8075",
                      }}
                    >
                      {doc.type}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: "#b5aba0" }}>
                  {doc.updated_at
                    ? new Date(doc.updated_at).toLocaleDateString("zh-CN")
                    : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          marginTop: 20,
          padding: "14px 20px",
          background: "rgba(201,165,90,0.06)",
          borderRadius: 10,
          border: "0.5px solid rgba(201,165,90,0.15)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Lightbulb size={18} color="#c9a55a" />
        <span style={{ fontSize: 13, color: "#8a8075" }}>
          提示：按{" "}
          <kbd
            style={{
              padding: "1px 6px",
              borderRadius: 4,
              background: "#fff",
              border: "0.5px solid #e8e4de",
              fontSize: 11,
              color: "#3d3833",
              fontWeight: 500,
            }}
          >
            ⌘K
          </kbd>{" "}
          打开全局搜索，快速跳转到任何内容
        </span>
      </motion.div>
    </div>
  )
}
