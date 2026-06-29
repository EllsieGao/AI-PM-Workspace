"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Pen, FileText, MessageCircle, Crosshair } from "lucide-react"
import RunningRabbit from "@/components/ui/running-rabbit"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.4 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

const features = [
  { icon: MessageCircle, title: "AI Agent", desc: "基于 DeepSeek 的智能对话助手，支持 PRD 生成、需求分析、竞品研究等 PM 核心工作场景", color: "text-rose-400", bg: "bg-rose-50" },
  { icon: FileText, title: "文档中心", desc: "PRD、会议纪要、技术方案、复盘报告统一管理，支持 Markdown 编辑与 AI 辅助写作", color: "text-amber-400", bg: "bg-amber-50" },
  { icon: Pen, title: "灵感速记", desc: "快速捕获产品灵感碎片，支持分类、搜索、AI 自动分析标签，批量发送到 Agent 深度加工", color: "text-emerald-400", bg: "bg-emerald-50" },
  { icon: Crosshair, title: "竞品雷达", desc: "按项目追踪竞品动态，AI 自动分析功能矩阵，行业笔记统一管理", color: "text-blue-400", bg: "bg-blue-50" },
  { icon: Sparkles, title: "Prompt 库", desc: "内置 PM 专业模板 + 自定义 Prompt，覆盖需求、竞品、数据等场景，一键复用提效", color: "text-purple-400", bg: "bg-purple-50" },
]

export default function NavigationPage() {
  const rabbitRef = useRef<HTMLDivElement>(null)
  const rabbitInView = useInView(rabbitRef, { once: true })
  const cardsRef = useRef<HTMLDivElement>(null)
  const cardsInView = useInView(cardsRef, { once: true, margin: "-50px" })

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* ═══════════════════════════════════
          背景 —— 丰富的彩色光团
          ═══════════════════════════════════ */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8EB] via-[#FFFDF5] to-[#FFF3E0]" />
        {/* 大块暖黄光团 */}
        <div className="absolute -top-20 -left-20 w-[40vw] h-[40vw] rounded-full bg-gradient-to-br from-amber-200/30 via-yellow-200/20 to-orange-100/15 blur-[120px]" />
        <div className="absolute top-[10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-bl from-amber-200/25 via-yellow-200/15 to-orange-100/10 blur-[100px]" />
        <div className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-r from-amber-100/20 via-yellow-100/15 to-transparent blur-[90px]" />
        <div className="absolute bottom-0 left-[10%] w-[45vw] h-[35vw] rounded-full bg-gradient-to-tr from-amber-200/22 via-yellow-100/15 to-orange-50/10 blur-[130px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-tl from-amber-100/25 via-orange-100/12 to-transparent blur-[110px]" />
        {/* 小颗亮点 */}
        <div className="absolute top-[20%] left-[50%] w-32 h-32 rounded-full bg-white/50 blur-[40px]" />
        <div className="absolute top-[60%] left-[60%] w-24 h-24 rounded-full bg-amber-100/40 blur-[30px]" />
        <div className="absolute top-[35%] left-[15%] w-20 h-20 rounded-full bg-white/40 blur-[25px]" />
      </div>

      {/* ═══════════════════════════════════
          内容
          ═══════════════════════════════════ */}
      <div className="relative z-10 mx-auto max-w-6xl px-8 py-16 flex flex-col items-center gap-16">
        {/* ── Hero 玻璃卡片 ── */}
        <div className="relative w-full rounded-3xl border border-amber-200/30 bg-white/60 backdrop-blur-md shadow-[0_8px_30px_rgb(200,180,140,0.06)] p-12 text-center overflow-hidden">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-white/30 blur-[60px] rounded-full" />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              ref={rabbitRef}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={rabbitInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.3, duration: 0.9, ease: "easeOut" }}
              className="relative mb-5"
            >
              <RunningRabbit size={200} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={rabbitInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-gray-800 mb-4"
            >
              AI PM 灵感空间
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={rabbitInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.9, duration: 0.8 }}
              className="text-base md:text-lg text-gray-600 max-w-xl mb-10 leading-relaxed"
            >
              你的 AI 产品搭档，让每一个想法精准落地。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={rabbitInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <Link href="/agent">
                <button className="group/cta relative inline-flex items-center gap-2.5 rounded-xl bg-[#c9a55a] px-7 py-3 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-lg hover:shadow-amber-200/20 active:translate-y-0">
                  进入空间
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
                </button>
              </Link>
            </motion.div>
          </div>
        </div>

        {/* ── 四个功能玻璃卡片 ── */}
        <motion.div
          ref={cardsRef}
          variants={containerVariants}
          initial="hidden"
          animate={cardsInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 w-full"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={cardVariants}
              className="relative rounded-2xl border border-amber-200/30 bg-white/60 backdrop-blur-md p-6 text-center shadow-[0_4px_20px_rgba(200,150,180,0.04)] hover:shadow-[0_8px_30px_rgba(200,150,180,0.1)] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className={`inline-flex p-3 rounded-xl ${f.bg} ${f.color} mb-4 backdrop-blur-sm`}>
                <f.icon className="size-5" />
              </div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ── 页脚 ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.5 }}
        className="relative z-10 pb-10 text-center pointer-events-none"
      >
        <p className="font-serif text-xs tracking-wider text-gray-400/60 leading-relaxed">
          From chaos to order, every idea deserves a soft landing.
          <br />
          / 从混乱到有序，让每一个灵感温柔着陆。
        </p>
      </motion.div>
    </div>
  )
}
