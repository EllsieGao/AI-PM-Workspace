"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useDocStore } from "@/store/docStore"
import { DOC_TYPES, AUTO_SAVE_DELAY } from "@/lib/constants"
import type { DocType, AiAction } from "@/lib/types"
import EditorHeader from "./EditorHeader"
import AiPanel from "./AiPanel"
import DocTemplateCard from "./DocTemplateCard"
import MdRenderer from "@/components/shared/MdRenderer"
import { useMediaQuery } from "@/hooks/useMediaQuery"

export default function DocEditor() {
  const {
    activeDoc,
    saveStatus,
    aiPanel,
    updateDoc,
    setSaveStatus,
    setAiPanel,
    closeAiPanel,
    createDoc,
    pendingAiPrompt,
    setPendingAiPrompt,
    deleteDoc,
  } = useDocStore()

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [init, setInit] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const [exporting, setExporting] = useState(false)
  const [preview, setPreview] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  // Sync store → local state when activeDoc changes
  useEffect(() => {
    if (activeDoc) {
      setTitle(activeDoc.title)
      setContent(activeDoc.content)
      setInit(true)
    } else {
      setInit(false)
    }
  }, [activeDoc])

  // Consume pendingAiPrompt (injected from MemoCard → 一键智写)
  useEffect(() => {
    if (activeDoc && pendingAiPrompt) {
      setAiPrompt(pendingAiPrompt)
      setPendingAiPrompt('')
    }
  }, [activeDoc, pendingAiPrompt, setPendingAiPrompt])

  // Auto-save debounce
  const scheduleSave = useCallback(
    (t: string, c: string) => {
      if (!activeDoc) return
      if (timerRef.current) clearTimeout(timerRef.current)
      setSaveStatus("unsaved")
      timerRef.current = setTimeout(async () => {
        setSaveStatus("saving")
        await updateDoc(activeDoc.id, { title: t, content: c })
        setSaveStatus("saved")
      }, AUTO_SAVE_DELAY)
    },
    [activeDoc, updateDoc, setSaveStatus]
  )

  const onTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setTitle(v)
      scheduleSave(v, content)
    },
    [content, scheduleSave]
  )

  const onContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const v = e.target.value
      setContent(v)
      scheduleSave(title, v)
    },
    [title, scheduleSave]
  )

  const handleAiAction = useCallback(
    async (action: AiAction) => {
      if (!activeDoc || !title.trim()) return
      setAiPanel({ visible: true, type: action, loading: true, content: "" })

      // --- Actions: extract tasks and show in AiPanel ---
      if (action === "actions") {
        try {
          const res = await fetch("/api/ai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "extract_tasks", title, content }),
          })
          const data = await res.json()

          if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
            setAiPanel({ visible: true, type: action, loading: false, content: "未识别出可提取的任务，请检查文档内容。" })
            return
          }

          const taskText = data.tasks.map((t: Record<string, string>, i: number) =>
            `### ${i + 1}. ${t.title || '未命名任务'}\n优先级：${t.priority || 'p1'}\n状态：${t.status || 'todo'}`
          ).join('\n\n')

          setAiPanel({
            visible: true,
            type: action,
            loading: false,
            content: `已提取 ${data.tasks.length} 个任务：\n\n${taskText}`,
          })
        } catch {
          closeAiPanel()
        }
        return
      }

      // --- Summary & other actions: append to editor ---
      setSaveStatus("saving")
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, title, content }),
        })
        const data = await res.json()
        closeAiPanel()
        if (data.result) {
          const label = action === "summary" ? "📋 AI 摘要" : "✅ 行动项"
          const appended = `${content}\n\n---\n## ${label}\n\n${data.result}`
          setContent(appended)
          await updateDoc(activeDoc.id, { content: appended })
          setSaveStatus("saved")
        } else {
          setSaveStatus("unsaved")
        }
      } catch {
        closeAiPanel()
        setSaveStatus("unsaved")
      }
    },
    [activeDoc, title, content, updateDoc, setSaveStatus, setAiPanel, closeAiPanel]
  )

  // Clean up debounce timer
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // --- AI Generate handler (new) ---
  const handleGenerate = useCallback(async () => {
    if (!activeDoc || !aiPrompt.trim()) return
    setSaveStatus("saving")
    setAiPanel({ visible: true, type: "generate", loading: true, content: "AI 正在奋力生成中…" })
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", title, content, prompt: aiPrompt }),
      })
      const data = await res.json()
      if (data.result) {
        const newContent = content ? content + "\n\n" + data.result : data.result
        setContent(newContent)
        await updateDoc(activeDoc.id, { content: newContent })
        setAiPanel({ content: "✅ 生成完成！", loading: false })
        setAiPrompt("")
        setSaveStatus("saved")
      } else {
        setAiPanel({ content: "生成返回异常", loading: false })
      }
    } catch {
      setAiPanel({ content: "AI 请求失败，请检查网络", loading: false })
    }
  }, [activeDoc, aiPrompt, title, content, updateDoc, setSaveStatus, setAiPanel])

  // --- Export handlers ---
  const handleExport = useCallback(async (format: "markdown" | "pdf") => {
    if (!activeDoc) return
    if (format === "markdown") {
      const blob = new Blob([content || activeDoc.content], { type: "text/markdown;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${activeDoc.title || "未命名文档"}.md`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      setExporting(true)
      try {
        const html2pdf = (await import("html2pdf.js")).default
        const el = document.createElement("div")
        el.style.cssText = "padding:40px;font-family:system-ui,sans-serif;font-size:14px;line-height:1.8;color:#222;background:#fff;max-width:800px;margin:0 auto;white-space:pre-wrap"
        el.textContent = content || activeDoc.content
        document.body.appendChild(el)
        await html2pdf().set({
          margin: [15, 15],
          filename: `${activeDoc.title || "未命名文档"}.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        }).from(el).save()
        document.body.removeChild(el)
      } catch (e) {
        console.error("PDF 导出失败:", e)
      } finally {
        setExporting(false)
      }
    }
  }, [activeDoc, content])

  // --- Empty state: 3D Bento 卡片阵列 ---
  if (!activeDoc) {
    const templateCards = [
      {
        type: "prd" as DocType,
        icon: "📝",
        title: "新建 PRD",
        engTitle: "PRD Template",
        description: "一键生成标准产品需求文档，厘清业务逻辑与功能边界。",
        badgeClass: "text-purple-600 bg-purple-50/70",
        badgeText: "PRD",
        glowColor: "#9b87f5",
      },
      {
        type: "meeting" as DocType,
        icon: "🗒️",
        title: "新建会议纪要",
        engTitle: "Meeting Minutes",
        description: "智能梳理团队会议发言，高效提炼核心行动项与待办清单。",
        badgeClass: "text-sky-600 bg-sky-50/70",
        badgeText: "会议",
        glowColor: "#60b8fa",
      },
      {
        type: "tech" as DocType,
        icon: "⚙️",
        title: "新建技术方案",
        engTitle: "Tech Specification",
        description: "规范化编写技术架构与系统设计，保障前后端开发顺畅协同。",
        badgeClass: "text-emerald-600 bg-emerald-50/70",
        badgeText: "技术",
        glowColor: "#4ade9a",
      },
      {
        type: "review" as DocType,
        icon: "📊",
        title: "新建复盘报告",
        engTitle: "Retro Report",
        description: "多维评估项目交付结果，深度沉淀成败经验与后续优化方向。",
        badgeClass: "text-amber-600 bg-amber-50/70",
        badgeText: "复盘",
        glowColor: "#fb9a4a",
      },
    ]

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFBF7] p-8">
        <div className="text-sm text-gray-400 mb-8">选择或新建一篇文档</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full mx-auto">
          {templateCards.map((card) => (
            <DocTemplateCard
              key={card.type}
              icon={card.icon}
              title={card.title}
              engTitle={card.engTitle}
              description={card.description}
              badgeClass={card.badgeClass}
              badgeText={card.badgeText}
              glowColor={card.glowColor}
              onClick={() => createDoc(card.type)}
            />
          ))}
        </div>
      </div>
    )
  }

  const info = DOC_TYPES[activeDoc.type]
  const createdDate = activeDoc.created_at
    ? new Date(activeDoc.created_at)
    : null

  return (
    <div id="prd-ultimate-editor" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <EditorHeader doc={activeDoc} saveStatus={saveStatus} onAiAction={handleAiAction} onExport={handleExport} onDelete={() => deleteDoc(activeDoc.id)} />

      <div style={{ flex: 1, width: "100%", maxWidth: "100%", boxSizing: "border-box", overflowY: "auto", overflowX: "hidden", padding: "24px 16px 24px 32px" }}>
        {/* Preview toggle */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 10,
        }}>
          <button
            onClick={() => setPreview(!preview)}
            style={{
              fontSize: 11,
              padding: '3px 10px',
              borderRadius: 4,
              border: '0.5px solid var(--border)',
              background: preview ? 'var(--accent)' : 'var(--surface)',
              color: preview ? '#0f0d0b' : 'var(--text2)',
              cursor: 'pointer',
            }}
          >
            {preview ? '编辑' : '预览'}
          </button>
        </div>

        {/* AI 智写指令框 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 18,
            background: "var(--surface2)",
            border: "0.5px solid var(--border)",
            borderRadius: 8,
            padding: "6px 8px",
            alignItems: "center",
          }}
        >
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && aiPrompt.trim()) handleGenerate()
            }}
            placeholder="输入你的调教 Prompt（例如：'帮我生成这款 App 的用户登录注册流 PRD'）..."
            style={{
              flex: 1,
              height: 34,
              fontSize: 12,
              color: "var(--text)",
              background: "transparent",
              border: "none",
              outline: "none",
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={!aiPrompt.trim()}
            style={{
              height: 30,
              fontSize: 12,
              fontWeight: 600,
              padding: "0 14px",
              borderRadius: 6,
              border: "none",
              background: aiPrompt.trim() ? "var(--accent)" : "var(--surface2)",
              color: aiPrompt.trim() ? "#0f0d0b" : "var(--text3)",
              cursor: aiPrompt.trim() ? "pointer" : "not-allowed",
              whiteSpace: "nowrap",
            }}
          >
            ✦ 立即生成
          </button>
        </div>

        <input
          value={title}
          onChange={onTitleChange}
          placeholder="未命名文档"
          style={{
            width: "100%",
            fontSize: isMobile ? 20 : 22,
            fontWeight: 600,
            color: "var(--text)",
            background: "transparent",
            border: "none",
            outline: "none",
            padding: 0,
            marginBottom: 6,
          }}
        />

        {createdDate && (
          <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 20 }}>
            创建于 {createdDate.getFullYear()}年{createdDate.getMonth() + 1}月{createdDate.getDate()}日
            · 修改于 {activeDoc.updated_at ? Math.round((Date.now() - new Date(activeDoc.updated_at).getTime()) / 60000) : "—"} 分钟前
          </div>
        )}

        {preview ? (
          <div style={{ minHeight: 400 }}>
            <MdRenderer content={content} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={onContentChange}
            placeholder="支持 Markdown 语法，开始写作…"
            style={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              flex: 1,
              minHeight: 400,
              fontFamily: "var(--font-mono, monospace)",
              fontSize: isMobile ? 16 : 14,
              lineHeight: 1.8,
              letterSpacing: "0.01em",
              color: "var(--text)",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "none",
              overflowY: "auto",
              overflowX: "hidden",
              padding: 0,
            }}
          />
        )}
      </div>

      <AiPanel panel={aiPanel} onClose={closeAiPanel} />
    </div>
  )
}
