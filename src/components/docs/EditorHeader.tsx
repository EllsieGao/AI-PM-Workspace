"use client"

import { useState } from "react"
import { Sparkles, CheckCircle2, Loader2, Download, FileDown, FileText, Trash2 } from "lucide-react"
import type { Document, AiAction } from "@/lib/types"
import { DOC_TYPES } from "@/lib/constants"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface Props {
  doc: Document
  saveStatus: "saved" | "saving" | "unsaved"
  onAiAction: (action: AiAction) => void
  onExport: (format: "markdown" | "pdf") => void
  onDelete: () => void
}

export default function EditorHeader({ doc, saveStatus, onAiAction, onExport, onDelete }: Props) {
  const [showExport, setShowExport] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const info = DOC_TYPES[doc.type]

  return (
    <div
      style={{
        height: 48,
        padding: "0 20px",
        borderBottom: "0.5px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      {/* Left: type tag + save status */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: info.color,
            background: info.color + "18",
            padding: "2px 8px",
            borderRadius: 4,
          }}
        >
          {info.label}
        </span>

        <span style={{ fontSize: 11, color: "var(--text3)", display: "flex", alignItems: "center", gap: 4 }}>
          {saveStatus === "saved" && (
            <>
              <CheckCircle2 size={12} style={{ color: "#4ade9a" }} />
              已保存
            </>
          )}
          {saveStatus === "saving" && (
            <>
              <Loader2 size={12} className="animate-spin" />
              保存中…
            </>
          )}
          {saveStatus === "unsaved" && (
            <span style={{ color: "var(--accent)" }}>· 未保存</span>
          )}
        </span>
      </div>

      {/* Right: AI buttons + Export */}
      <div style={{ display: "flex", gap: 6, position: "relative" }}>
        <button
          onClick={() => onAiAction("summary")}
          title="AI 摘要"
          style={{
            height: 28,
            fontSize: 11,
            fontWeight: 500,
            padding: isMobile ? "0 6px" : "0 10px",
            borderRadius: 6,
            border: "0.5px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Sparkles size={isMobile ? 14 : 12} style={{ color: "var(--accent)" }} />
          {!isMobile && "AI 摘要"}
        </button>
        <button
          onClick={() => onAiAction("actions")}
          title="提取行动项"
          style={{
            height: 28,
            fontSize: 11,
            fontWeight: 500,
            padding: isMobile ? "0 6px" : "0 10px",
            borderRadius: 6,
            border: "0.5px solid var(--border)",
            background: "var(--surface)",
            color: "var(--text2)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Sparkles size={isMobile ? 14 : 12} style={{ color: "var(--accent)" }} />
          {!isMobile && "提取行动项"}
        </button>

        {/* Export dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowExport(!showExport)}
            style={{
              height: 28,
              fontSize: 11,
              fontWeight: 500,
              padding: "0 10px",
              borderRadius: 6,
              border: "0.5px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Download size={12} />
            导出
          </button>

          {showExport && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 99 }}
                onClick={() => setShowExport(false)}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: 4,
                  background: "var(--surface)",
                  border: "0.5px solid var(--border)",
                  borderRadius: 8,
                  overflow: "hidden",
                  zIndex: 100,
                  minWidth: 160,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <button
                  onClick={() => { onExport("markdown"); setShowExport(false) }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    fontSize: 12,
                    color: "var(--text)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface2)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
                >
                  <FileText size={14} style={{ color: "var(--accent)" }} />
                  导出 Markdown
                </button>
                <button
                  onClick={() => { onExport("pdf"); setShowExport(false) }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    fontSize: 12,
                    color: "var(--text)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    borderTop: "0.5px solid var(--border)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface2)" }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "none" }}
                >
                  <FileDown size={14} style={{ color: "var(--accent)" }} />
                  导出 PDF
                </button>
              </div>
            </>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        <button
          onClick={() => { if (confirm('确定要删除该文档吗？此操作不可逆。')) onDelete() }}
          style={{
            height: 28,
            fontSize: 11,
            fontWeight: 500,
            padding: "0 10px",
            borderRadius: 6,
            border: "0.5px solid transparent",
            background: "transparent",
            color: "#e74c3c",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 4,
            opacity: 0.7,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.borderColor = "rgba(231,76,60,0.3)" }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.borderColor = "transparent" }}
        >
          <Trash2 size={12} />
          删除
        </button>
      </div>
    </div>
  )
}
