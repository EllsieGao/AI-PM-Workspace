'use client'
import { useState, useRef, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  content: string
  variant?: 'default' | 'chat'
}

/* ── 代码块组件（含 Copy 按钮） ── */
function CodeBlock({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLPreElement>(null)

  const handleCopy = useCallback(async () => {
    const text = preRef.current?.textContent || ''
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [])

  return (
    <div className="relative group my-4">
      <pre
        ref={preRef}
        className="bg-neutral-50/90 border border-neutral-200/50 rounded-xl p-4 overflow-x-auto text-sm leading-relaxed text-neutral-700"
      >
        {children}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2.5 right-2.5 text-[11px] text-neutral-400 hover:text-neutral-600
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        {copied ? '✓ 已复制' : '⎘ 复制'}
      </button>
    </div>
  )
}

/* ── 主渲染器 ── */
export default function MdRenderer({ content, variant = 'default' }: Props) {
  /* ── Chat 杂志排版变体 ── */
  if (variant === 'chat') {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          /* 行内代码 */
          code({ className, children, ...props }) {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  className="bg-neutral-100/80 text-neutral-700 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return <code className={className} {...props}>{children}</code>
          },

          /* 代码块 */
          pre({ children }) {
            return <CodeBlock>{children}</CodeBlock>
          },

          /* 标题 */
          h1({ children }) {
            return <h1 className="text-lg font-medium text-neutral-800 mt-6 mb-3 tracking-tight">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-base font-medium text-neutral-800 mt-5 mb-2">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-[15px] font-medium text-neutral-700 mt-4 mb-2">{children}</h3>
          },

          /* 列表 */
          ul({ children }) {
            return <ul className="pl-5 my-2 space-y-1 list-disc text-neutral-700">{children}</ul>
          },
          ol({ children }) {
            return <ol className="pl-5 my-2 space-y-1 list-decimal text-neutral-700">{children}</ol>
          },

          /* 引用块 — 淡金竖线装饰 */
          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-amber-200/70 pl-4 py-0.5 my-4 text-neutral-500 italic text-sm leading-relaxed">
                {children}
              </blockquote>
            )
          },

          /* 段落 */
          p({ children }) {
            return <p className="my-2 text-neutral-800 leading-relaxed">{children}</p>
          },

          /* 链接 */
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-amber-700 underline underline-offset-2 hover:text-amber-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            )
          },

          /* 分割线 */
          hr() {
            return <hr className="my-6 border-neutral-200" />
          },

          /* 表格 */
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto">
                <table className="w-full text-sm border-collapse">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border border-neutral-200 bg-neutral-50 px-3 py-2 text-left font-medium text-neutral-700">
                {children}
              </th>
            )
          },
          td({ children }) {
            return <td className="border border-neutral-200 px-3 py-2 text-neutral-600">{children}</td>
          },

          /* 加粗 */
          strong({ children }) {
            return <strong className="font-semibold text-neutral-900">{children}</strong>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  /* ── 默认变体（沿用 .md-body 样式） ── */
  return (
    <div className="md-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
