"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, SendHorizonal, Sparkles } from "lucide-react"
import { extractVariables, fillVariables } from "@/lib/promptUtils"

interface Props {
  content: string
  onSend: (filledContent: string) => void
  onClose: () => void
}

export default function VariableFillDialog({ content, onSend, onClose }: Props) {
  const variables = extractVariables(content)
  const [values, setValues] = useState<Record<string, string>>({})
  const [preview, setPreview] = useState(content)

  useEffect(() => {
    // Initialize with empty values
    const initial: Record<string, string> = {}
    variables.forEach(v => { initial[v] = "" })
    setValues(initial)
  }, [content])

  const handleValueChange = (name: string, value: string) => {
    const newValues = { ...values, [name]: value }
    setValues(newValues)
    setPreview(fillVariables(content, newValues))
  }

  const handleSend = () => {
    onSend(preview)
  }

  const allFilled = variables.every(v => values[v]?.trim())

  if (variables.length === 0) {
    // No variables — just send directly
    onSend(content)
    return null
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 1000,
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          maxWidth: "90vw",
          maxHeight: "80vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 16,
          padding: 28,
          zIndex: 1001,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} color="#c9a55a" />
              填写 Prompt 变量
            </h2>
            <p style={{ fontSize: 12, color: "#b5aba0", margin: "4px 0 0" }}>
              检测到 {variables.length} 个变量，填写后发送到 AI Agent
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer", color: "#ccc", padding: 4,
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Variable inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {variables.map((varName) => (
            <div key={varName}>
              <label style={{
                display: "block",
                fontSize: 12,
                fontWeight: 500,
                color: "#8a8075",
                marginBottom: 4,
              }}>
                {varName}
              </label>
              <input
                value={values[varName] || ""}
                onChange={e => handleValueChange(varName, e.target.value)}
                placeholder={`输入 ${varName}…`}
                autoFocus={varName === variables[0]}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  border: "0.5px solid #e8e4de",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#3d3833",
                  outline: "none",
                  boxSizing: "border-box",
                  background: "#FDFBF7",
                }}
                onFocus={e => { e.target.style.borderColor = "#c9a55a" }}
                onBlur={e => { e.target.style.borderColor = "#e8e4de" }}
              />
            </div>
          ))}
        </div>

        {/* Preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#8a8075", marginBottom: 6 }}>
            预览
          </div>
          <div style={{
            padding: "12px 14px",
            background: "#FDFBF7",
            border: "0.5px solid #e8e4de",
            borderRadius: 8,
            fontSize: 12,
            color: "#8a8075",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
            maxHeight: 160,
            overflowY: "auto",
          }}>
            {preview}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "9px 20px",
              border: "0.5px solid #e8e4de",
              borderRadius: 8,
              background: "#fff",
              color: "#8a8075",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            取消
          </button>
          <button
            onClick={handleSend}
            disabled={!allFilled}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "9px 20px",
              border: "none",
              borderRadius: 8,
              background: allFilled ? "#c9a55a" : "#e8e4de",
              color: allFilled ? "#fff" : "#b5aba0",
              fontSize: 13,
              fontWeight: 500,
              cursor: allFilled ? "pointer" : "not-allowed",
            }}
          >
            <SendHorizonal size={14} />
            发送到 Agent
          </button>
        </div>
      </motion.div>
    </>
  )
}
