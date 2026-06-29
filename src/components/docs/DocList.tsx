"use client"

import { useDocStore } from "@/store/docStore"
import { DOC_TYPES } from "@/lib/constants"

function relativeTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const day = 86400000

  if (diff < day && d.getDate() === now.getDate()) return "今天"
  if (diff < 2 * day) return "昨天"
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function DocList() {
  const { docs, activeDoc, filter, searchQuery, openDoc, deleteDoc } = useDocStore()

  const filtered = docs
    .filter((doc) => {
      if (filter !== "all" && doc.type !== filter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const preview = doc.content?.slice(0, 80).toLowerCase() ?? ""
        return doc.title.toLowerCase().includes(q) || preview.includes(q)
      }
      return true
    })
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

  if (filtered.length === 0) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
        暂无文档
      </div>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {filtered.map((doc) => {
        const info = DOC_TYPES[doc.type]
        const active = activeDoc?.id === doc.id
        const preview = doc.content?.slice(0, 60) ?? ""

        return (
          <div
            key={doc.id}
            onClick={() => openDoc(doc.id)}
            className="group"
            style={{
              position: "relative",
              padding: "10px 14px",
              cursor: "pointer",
              background: active ? "var(--surface)" : "transparent",
              borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!active)
                (e.currentTarget as HTMLElement).style.background = "var(--surface2)"
            }}
            onMouseLeave={(e) => {
              if (!active)
                (e.currentTarget as HTMLElement).style.background = "transparent"
            }}
          >
            {/* Delete button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (confirm("确认删除该文档？")) deleteDoc(doc.id)
              }}
              className="hidden group-hover:block"
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "var(--surface2)",
                border: "0.5px solid var(--border)",
                borderRadius: 4,
                color: "var(--text3)",
                fontSize: 11,
                padding: "2px 6px",
                cursor: "pointer",
              }}
            >
              删除
            </button>

            {/* Type tag + time */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: info.color,
                  background: info.color + "18",
                  padding: "1px 6px",
                  borderRadius: 3,
                }}
              >
                {info.label}
              </span>
              <span style={{ fontSize: 11, color: "var(--text3)" }}>
                {relativeTime(doc.updated_at)}
              </span>
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: active ? "var(--text)" : "var(--text2)",
                marginBottom: 2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.title}
            </div>

            {/* Preview */}
            {preview && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--text3)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {preview}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
