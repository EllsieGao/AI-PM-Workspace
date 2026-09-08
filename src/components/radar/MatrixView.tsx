"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Check, Minus, HelpCircle } from "lucide-react"
import { useRadarStore } from "@/store/radarStore"

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  has: { icon: Check, label: "支持", color: "#10b981", bg: "#ecfdf5" },
  partial: { icon: Minus, label: "部分", color: "#f59e0b", bg: "#fffbeb" },
  none: { icon: X, label: "不支持", color: "#ef4444", bg: "#fef2f2" },
  unknown: { icon: HelpCircle, label: "未知", color: "#b5aba0", bg: "#f9fafb" },
}

const STATUS_OPTIONS = ["has", "partial", "none", "unknown"]

export default function MatrixView() {
  const { competitors, updateCompetitor } = useRadarStore()
  const [newFeatureName, setNewFeatureName] = useState("")
  const [addingFeature, setAddingFeature] = useState(false)
  const [editingCell, setEditingCell] = useState<{ competitorId: string; featureName: string } | null>(null)
  const [ourProduct, setOurProduct] = useState<Record<string, string>>({})

  // Collect all unique feature names from all competitors
  const allFeatures = useMemo(() => {
    const featureSet = new Set<string>()
    competitors.forEach(c => {
      if (c.features_json && typeof c.features_json === "object") {
        Object.keys(c.features_json).forEach(k => featureSet.add(k))
      }
    })
    // Include our product features too
    Object.keys(ourProduct).forEach(k => featureSet.add(k))
    return Array.from(featureSet)
  }, [competitors, ourProduct])

  const getFeatureValue = (competitor: any, featureName: string): string => {
    return competitor.features_json?.[featureName] || "unknown"
  }

  const handleStatusChange = async (competitorId: string, featureName: string, newStatus: string) => {
    const comp = competitors.find(c => c.id === competitorId)
    if (!comp) return
    const currentFeatures = { ...(comp.features_json || {}) }
    currentFeatures[featureName] = newStatus
    await updateCompetitor(competitorId, { features_json: currentFeatures } as any)
    setEditingCell(null)
  }

  const handleAddFeature = () => {
    if (!newFeatureName.trim()) return
    // Initialize the feature for all competitors as unknown
    competitors.forEach(async (c) => {
      const currentFeatures = { ...(c.features_json || {}) }
      if (!currentFeatures[newFeatureName.trim()]) {
        currentFeatures[newFeatureName.trim()] = "unknown"
        await updateCompetitor(c.id, { features_json: currentFeatures } as any)
      }
    })
    setNewFeatureName("")
    setAddingFeature(false)
  }

  const handleOurProductChange = (featureName: string, value: string) => {
    setOurProduct(prev => ({ ...prev, [featureName]: value }))
  }

  if (competitors.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: 40, color: "#b5aba0", fontSize: 13 }}>
        请先添加竞品，然后使用 AI 分析或手动构建对比矩阵
      </div>
    )
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          fontSize: 13,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                position: "sticky",
                left: 0,
                background: "#fafaf9",
                padding: "10px 14px",
                textAlign: "left",
                fontWeight: 600,
                color: "#3d3833",
                borderBottom: "0.5px solid #e8e4de",
                minWidth: 140,
                zIndex: 2,
                fontSize: 12,
              }}
            >
              功能维度
            </th>
            {/* Our product column */}
            <th
              style={{
                padding: "10px 14px",
                textAlign: "center",
                fontWeight: 600,
                color: "#c9a55a",
                borderBottom: "0.5px solid #e8e4de",
                minWidth: 100,
                background: "rgba(201,165,90,0.04)",
              }}
            >
              <div>我们的产品</div>
              <div style={{ fontSize: 10, fontWeight: 400, color: "#b5aba0" }}>（参考）</div>
            </th>
            {competitors.map(comp => (
              <th
                key={comp.id}
                style={{
                  padding: "10px 14px",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#3d3833",
                  borderBottom: "0.5px solid #e8e4de",
                  minWidth: 120,
                }}
              >
                {comp.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allFeatures.map((feature, idx) => (
            <tr
              key={feature}
              style={{
                background: idx % 2 === 0 ? "transparent" : "#fdfcfb",
              }}
            >
              <td
                style={{
                  position: "sticky",
                  left: 0,
                  background: idx % 2 === 0 ? "#fff" : "#fdfcfb",
                  padding: "8px 14px",
                  fontWeight: 500,
                  color: "#3d3833",
                  borderBottom: "0.5px solid #f5f3f0",
                  fontSize: 12,
                }}
              >
                {feature}
              </td>
              {/* Our product cell */}
              <td
                style={{
                  padding: "4px",
                  textAlign: "center",
                  borderBottom: "0.5px solid #f5f3f0",
                  background: "rgba(201,165,90,0.02)",
                }}
              >
                <select
                  value={ourProduct[feature] || "unknown"}
                  onChange={e => handleOurProductChange(feature, e.target.value)}
                  style={{
                    padding: "3px 6px",
                    fontSize: 11,
                    border: "0.5px solid #e8e4de",
                    borderRadius: 4,
                    background: "#fff",
                    color: "#3d3833",
                    cursor: "pointer",
                    outline: "none",
                  }}
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                  ))}
                </select>
              </td>
              {competitors.map(comp => {
                const value = getFeatureValue(comp, feature)
                const config = STATUS_CONFIG[value] || STATUS_CONFIG.unknown
                const StatusIcon = config.icon
                const isEditing = editingCell?.competitorId === comp.id && editingCell?.featureName === feature

                return (
                  <td
                    key={comp.id}
                    style={{
                      padding: "4px",
                      textAlign: "center",
                      borderBottom: "0.5px solid #f5f3f0",
                      cursor: "pointer",
                    }}
                    onClick={() => setEditingCell({ competitorId: comp.id, featureName: feature })}
                  >
                    {isEditing ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 2,
                          justifyContent: "center",
                          background: "#fff",
                          border: "0.5px solid #c9a55a",
                          borderRadius: 6,
                          padding: 2,
                        }}
                      >
                        {STATUS_OPTIONS.map(s => {
                          const sc = STATUS_CONFIG[s]
                          const Icon = sc.icon
                          return (
                            <button
                              key={s}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(comp.id, feature, s)
                              }}
                              title={sc.label}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 4,
                                border: "none",
                                background: value === s ? sc.bg : "transparent",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Icon size={14} color={sc.color} />
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: config.bg,
                          color: config.color,
                          fontSize: 11,
                          fontWeight: 500,
                        }}
                      >
                        <StatusIcon size={12} />
                        {config.label}
                      </span>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add feature row */}
      <div style={{ marginTop: 12 }}>
        <AnimatePresence mode="wait">
          {addingFeature ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}
            >
              <input
                value={newFeatureName}
                onChange={e => setNewFeatureName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleAddFeature()
                  if (e.key === "Escape") {
                    setAddingFeature(false)
                    setNewFeatureName("")
                  }
                }}
                placeholder="功能名称，如：AI 对话"
                autoFocus
                style={{
                  padding: "6px 12px",
                  border: "0.5px solid #c9a55a",
                  borderRadius: 8,
                  fontSize: 12,
                  outline: "none",
                  background: "#fff",
                  width: 200,
                }}
              />
              <button
                onClick={handleAddFeature}
                style={{
                  padding: "6px 12px",
                  border: "none",
                  borderRadius: 6,
                  background: "#c9a55a",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                添加
              </button>
              <button
                onClick={() => {
                  setAddingFeature(false)
                  setNewFeatureName("")
                }}
                style={{
                  padding: "6px 12px",
                  border: "0.5px solid #e8e4de",
                  borderRadius: 6,
                  background: "#fff",
                  color: "#8a8075",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                取消
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setAddingFeature(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                border: "1.5px dashed #ddd",
                borderRadius: 8,
                background: "transparent",
                color: "#8a8075",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              <Plus size={14} /> 添加功能维度
            </button>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
