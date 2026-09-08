'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const items = [
  { href: '/agent', label: 'Agent' },
  { href: '/docs', label: '文档' },
  { href: '/memos', label: '速记' },
  { href: '/design', label: '竞品' },
  { href: '/prompts', label: 'Prompt' },
]

export default function NavBar() {
  const router = useRouter()
  const pathname = usePathname()
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isMobile) {
    return (
      <nav
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 'var(--mobile-nav-height)',
          background: 'var(--sidebar)',
          borderTop: '0.5px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          zIndex: 100,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px 12px',
                color: active ? 'var(--accent)' : 'var(--text3)',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: active ? 600 : 400,
                minWidth: '48px',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <TooltipProvider>
      <nav
        className={cn(
          'w-[72px] flex-shrink-0 h-screen',
          'bg-white/70 backdrop-blur-xl',
          'border-r border-gray-200/40',
          'flex flex-col items-center py-4'
        )}
      >
        {/* Logo — 兔子返回导航页 */}
        <div>
          <Tooltip>
            <TooltipTrigger
              render={<Link href="/navigation" />}
              className="block"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
              >
                <Image
                  src="/rabbit_IMG_6712.png"
                  alt="回到首页"
                  width={44}
                  height={44}
                  className="object-contain brightness-125 contrast-110"
                />
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12}>
              返回灵感起点
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Nav items — 文字标签 */}
        <div className="flex flex-col gap-5 mt-6">
          {items.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'w-[60px] py-2.5 rounded-lg border cursor-pointer transition-all duration-200',
                  'text-xs font-medium tracking-wide',
                  active
                    ? 'bg-amber-50/80 text-amber-600 font-semibold border-amber-200/60 shadow-sm'
                    : 'text-gray-400 border-gray-200/40 hover:bg-gray-100/60 hover:text-gray-600 hover:border-gray-300/60'
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>

      </nav>
    </TooltipProvider>
  )
}
