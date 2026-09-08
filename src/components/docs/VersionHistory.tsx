"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, Save, RotateCcw, X, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase"
import MdRenderer from "@/components/shared/MdRenderer"

interface Version {
  id: string
  document_id: string
  version: number
  content: string
  created_at: string
}

interface Props {
  docId: string
  currentContent: string
  currentVersion: number
  onClose: () => void
  onRestore: (content: string) => void
  onSaveVersion: () => Promise<void>
}

export default function VersionHistory({
  docId,
  currentContent,
  currentVersion,
  onClose,
  onRestore,
  onSaveVersion,
}: Props) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null)

  useEffect(() => {
    loadVersions()
  }, [docId])

  const loadVersions = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", docId)
      .order("version", { ascending: false })
    if (data) setVersions(data as Version[])
    setLoading(false)
  }

  const handleSaveVersion = async () => {
    setSaving(true)
    await onSaveVersion()
    await loadVersions()
    setSaving(false)
  }

  const handleRestore = (version: Version) => {
    onRestore(version.content)
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 500,
        }}
      />
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: "90vw",
          background: "#fff",
          borderLeft: "0.5px solid #e8e4de",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.08)",
          zIndex: 501,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "0.5px solid #e8e4de",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={18} color="#c9a55a" />
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#3d3833", margin: 0 }}>
              版本历史
            </h2>
            <span
              style={{
                fontSize: 11,
                padding: "1px 8px",
                borderRadius: 10,
                background: "#f5f3f0",
                color: "#8a8075",
              }}
            >
              当前 v{currentVersion}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#b5aba0",
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Save current version */}
        <div style={{ padding: "14px 20px", borderBottom: "0.5px solid #f0f0f0" }}>
          <button
            onClick={handleSaveVersion}
            disabled={saving}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "10px 16px",
              border: "1.5px dashed #c9a55a",
              borderRadius: 10,
              background: "rgba(201,165,90,0.04)",
              color: "#c9a55a",
              fontSize: 13,
              fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.6 : 1,
            }}
          >
            <Save size={15} />
            {saving ? "保存中…" : `保存当前版本 (v${currentVersion + 1})`}
          </button>
        </div>

        {/* Version list */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 20px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 20, color: "#b5aba0", fontSize: 13 }}>
              加载中…
            </div>
          ) : versions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#b5aba0", fontSize: 13 }}>
              还没有保存过版本
              <br />
              <span style={{ fontSize: 11, color: "#d4d4d4" }}>
                文档会自动保存，手动保存版本可用于回溯
              </span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {versions.map((version) => (
                <div
                  key={version.id}
                  onClick={() =>
                    setSelectedVersion(
                      selectedVersion?.id === version.id ? null : version
                    )
                  }
                  style={{
                    padding: "12px 14px",
                    border:
                      selectedVersion?.id === version.id
                        ? "0.5px solid #c9a55a"
                        : "0.5px solid #f0f0f0",
                    borderRadius: 10,
                    cursor: "pointer",
                    transition: "border-color 0.15s",
                    background:
                      selectedVersion?.id === version.id
                        ? "rgba(201,165,90,0.03)"
                        : "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#3d3833" }}>
                        v{version.version}
                      </div>
                      <div style={{ fontSize: 11, color: "#b5aba0", marginTop: 2 }}>
                        {new Date(version.created_at).toLocaleString("zh-CN")}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRestore(version)
                        }}
                        title="恢复此版本"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 3,
                          padding: "4px 10px",
                          border: "0.5px solid #e8e4de",
                          borderRadius: 6,
                          background: "#fff",
                          color: "#8a8075",
                          fontSize: 11,
                          cursor: "pointer",
                        }}
                      >
                        <RotateCcw size={11} /> 恢复
                      </button>
                      <ChevronRight
                        size={14}
                        color="#d4d4d4"
                        style={{
                          transform:
                            selectedVersion?.id === version.id
                              ? "rotate(90deg)"
                              : "none",
                          transition: "transform 0.15s",
                          marginTop: 4,
                        }}
                      />
                    </div>
                  </div>

                  {/* Expanded content preview */}
                  <AnimatePresence>
                    {selectedVersion?.id === version.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div
                          style={{
                            marginTop: 10,
                            padding: "10px 12px",
                            background: "#FDFBF7",
                            borderRadius: 6,
                            maxHeight: 200,
                            overflowY: "auto",
                            fontSize: 12,
                            lineHeight: 1.6,
                            color: "#8a8075",
                          }}
                        >
                          <MdRenderer content={version.content.slice(0, 1000)} variant="chat" />
                          {version.content.length > 1000 && (
                            <div style={{ color: "#d4d4d4", marginTop: 4 }}>… 更多内容</div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}
