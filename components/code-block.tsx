'use client'

import { useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

type CodeBlockProps = {
  language?: string
  children: React.ReactNode
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const label = language && language !== 'plaintext' ? language : 'text'

  const handleCopy = async () => {
    const code = containerRef.current?.querySelector('code')?.innerText ?? ''
    try {
      await navigator.clipboard.writeText(code.replace(/\n$/, ''))
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[oklch(0.975_0.005_85)]">
      <div className="flex items-center justify-between border-b border-border px-4 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          <span>{copied ? '복사됨' : '복사'}</span>
        </button>
        <span className="sr-only" aria-live="polite">
          {copied ? '코드가 클립보드에 복사되었습니다.' : ''}
        </span>
      </div>
      <div ref={containerRef}>{children}</div>
    </div>
  )
}
