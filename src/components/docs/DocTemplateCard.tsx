'use client'

import { useState } from 'react'
import { useMotionValue, useSpring, useTransform, motion } from 'framer-motion'

interface Props {
  icon: string
  title: string
  engTitle: string
  description: string
  badgeClass: string
  badgeText: string
  glowColor: string
  onClick: () => void
}

export default function DocTemplateCard({ icon, title, description, badgeClass, badgeText, glowColor, onClick }: Props) {
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const [isHovered, setIsHovered] = useState(false)

  const springConfig = { stiffness: 300, damping: 20 }

  /* 3D tilt: mouse → rotation with spring physics */
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), springConfig)

  /* Glow position */
  const glowX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), springConfig)
  const glowY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width)
    mouseY.set((e.clientY - rect.top) / rect.height)
  }

  const handleMouseLeave = () => {
    mouseX.set(0.5)
    mouseY.set(0.5)
    setIsHovered(false)
  }

  return (
    <motion.div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        perspective: 600,
        transformStyle: 'preserve-3d',
      }}
      className="relative h-[260px] w-full rounded-2xl border border-gray-200/60 bg-white
                 cursor-pointer overflow-hidden select-none
                 shadow-[0_4px_24px_rgba(0,0,0,0.015)] hover:shadow-md
                 transition-shadow duration-300"
    >
      {/* 特种纸对角网格纹理 */}
      <div
        className="absolute inset-0 pointer-events-none
                   bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
                   bg-[size:32px_32px]
                   [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
      />

      {/* 鼠标跟随莫兰迪微光 */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{
          background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColor}18, transparent 60%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      />

      {/* 内容层 — translateZ 营造 3D 浮出感 */}
      <div
        className="relative z-10 flex flex-col justify-between h-full p-6"
        style={{ transformStyle: 'preserve-3d', transform: 'translateZ(28px)' }}
      >
        {/* 顶行：图标 + 标签 */}
        <div className="flex items-start justify-between">
          <span className="text-2xl">{icon}</span>
          <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${badgeClass}`}>
            {badgeText}
          </span>
        </div>

        {/* 中间：英文衬线标题 + 描述 */}
        <div>
          <h3 className="font-serif font-medium text-xl text-neutral-800 leading-tight mt-1">
            {title}
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed mt-2 line-clamp-2">
            {description}
          </p>
        </div>

        {/* 底部：行动指引 */}
        <div className="text-[11px] text-neutral-300 transition-colors duration-200">
          新建文档 →
        </div>
      </div>
    </motion.div>
  )
}
