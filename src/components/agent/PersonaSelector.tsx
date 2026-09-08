"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Sparkles } from "lucide-react"
import { useState } from "react"
import { useAgentStore, PERSONA_LIST } from "@/store/agentStore"

export default function PersonaSelector() {
  const { persona, setPersona } = useAgentStore()
  const [open, setOpen] = useState(false)

  const active = PERSONA_LIST.find(p => p.key === persona) || PERSONA_LIST[0]

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: "4px 10px",
          fontSize: 11,
          fontWeight: 500,
          border: "0.5px solid #e8e4de",
          borderRadius: 14,
          background: "#fff",
          color: "#8a8075",
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "all 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#c9a55a"
          e.currentTarget.style.color = "#c9a55a"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e8e4de"
          e.currentTarget.style.color = "#8a8075"
        }}
      >
        <span>{active.emoji}</span>
        <span>{active.name}</span>
        <ChevronDown size={11} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, zIndex: 99 }}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: 0,
                background: "#fff",
                border: "0.5px solid #e8e4de",
                borderRadius: 12,
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                zIndex: 100,
                minWidth: 160,
                overflow: "hidden",
                padding: 4,
              }}
            >
              {PERSONA_LIST.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setPersona(p.key)
                    setOpen(false)
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "8px 12px",
                    fontSize: 13,
                    border: "none",
                    borderRadius: 8,
                    background: persona === p.key ? "rgba(201,165,90,0.08)" : "transparent",
                    color: persona === p.key ? "#c9a55a" : "#3d3833",
                    cursor: "pointer",
                    fontWeight: persona === p.key ? 600 : 400,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    if (persona !== p.key) {
                      e.currentTarget.style.background = "#FDFBF7"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (persona !== p.key) {
                      e.currentTarget.style.background = "transparent"
                    }
                  }}
                >
                  <span>{p.emoji}</span>
                  <span>{p.name}</span>
                  {persona === p.key && (
                    <Sparkles size={12} color="#c9a55a" style={{ marginLeft: "auto" }} />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
