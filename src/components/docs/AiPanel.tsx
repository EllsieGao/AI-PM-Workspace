"use client"

import { useMemo } from "react"
import { Loader2, X } from "lucide-react"
import type { AiPanelState } from "@/lib/types"

interface Props {
  panel: AiPanelState
  onClose: () => void
}

// Convert markdown table rows into a styled HTML table
function MarkdownTable({ content }: { content: string }) {
  const rows = useMemo(() => {
    return content.split("\n").filter(line => line.trim().startsWith("|") && line.trim().endsWith("|"))
  }, [content])

  const sepIndex = rows.findIndex(r => r.includes("---"))
  const headerRows = sepIndex >= 0 ? rows.slice(0, sepIndex) : []
  const bodyRows = sepIndex >= 0 ? rows.slice(sepIndex + 1) : rows

  const parseRow = (row: string) =>
    row.split("|").map(c => c.trim()).filter(c => c && !c.includes("---"))

  if (headerRows.length === 0 && bodyRows.length === 0) {
    return <div style={{ whiteSpace: "pre-wrap" }}>{content}</div>
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        {headerRows.length > 0 && (
          <thead>
            {headerRows.map((row, i) => (
              <tr key={`h-${i}`}>
                {parseRow(row).map((cell, j) => (
                  <th key={j} style={{ border: "0.5px solid var(--border2)", padding: "6px 10px", textAlign: "left", fontWeight: 600, color: "var(--accent)", background: "var(--surface2)" }}>
                    {cell}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody>
          {bodyRows.map((row, i) => (
            <tr key={`b-${i}`}>
              {parseRow(row).map((cell, j) => (
                <td key={j} style={{ border: "0.5px solid var(--border2)", padding: "5px 10px", color: "var(--text)" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {content.split("\n").filter(l => !l.trim().startsWith("|")).join("\n").trim() && (
        <div style={{ whiteSpace: "pre-wrap", marginTop: 8, color: "var(--text2)", fontSize: 12 }}>
          {content.split("\n").filter(l => !l.trim().startsWith("|")).join("\n")}
        </div>
      )}
    </div>
  )
}

export default function AiPanel({ panel, onClose }: Props) {
  if (!panel.visible) return null

  const title =
    panel.type === "summary" ? "✦ AI 摘要" :
    panel.type === "actions" ? "✦ 提取行动项" :
    "✦ AI 智能创作中"

  return (
    <div
      style={{
        background: "var(--surface)",
        borderTop: "0.5px solid var(--border)",
        maxHeight: 220,
        overflowY: "auto",
        padding: "12px 16px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>{title}</span>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", padding: 2 }}
        >
          <X size={14} />
        </button>
      </div>

      {panel.loading ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text2)" }}>
          <Loader2 size={14} className="animate-spin" />
          {panel.type === "generate" ? "AI 正在为您全力构思并撰写产品文档，请稍候…" : panel.type === "summary" ? "AI 正在深度解析会议内容…" : "AI 正在提取行动项…"}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>
          {panel.type === "actions" ? (
            <MarkdownTable content={panel.content} />
          ) : (
            <div style={{ whiteSpace: "pre-wrap" }}>{panel.content}</div>
          )}
        </div>
      )}
    </div>
  )
}
