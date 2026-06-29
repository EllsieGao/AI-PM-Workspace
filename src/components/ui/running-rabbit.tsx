"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function RunningRabbit({ size = 200 }: { size?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative flex items-center justify-center"
    >
      {/* 柔和光晕 */}
      <div className="absolute inset-0 w-56 h-56 rounded-full bg-gradient-to-r from-pink-200/25 via-amber-100/15 to-pink-100/20 blur-[60px]" />

      <Image
        src="/rabbit_IMG_6712.png"
        alt="粉色小兔"
        width={size}
        height={size}
        className="relative z-10 object-contain drop-shadow-[0_10px_25px_rgba(200,150,180,0.3)]"
        priority
      />
    </motion.div>
  )
}
