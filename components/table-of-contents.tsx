'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { TocItem } from '@/lib/post-types'
import { cn } from '@/lib/utils'

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )
    headings.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

function TocList({ items, activeId }: { items: TocItem[]; activeId: string | null }) {
  return (
    <ol className="flex flex-col gap-0.5 text-sm">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? 'location' : undefined}
            className={cn(
              'block border-l-2 py-1.5 leading-snug transition-colors',
              item.depth === 3 ? 'pl-6' : 'pl-3',
              activeId === item.id
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  )
}

export function TableOfContents({ items, variant }: { items: TocItem[]; variant: 'mobile' | 'desktop' }) {
  const [ids] = useState(() => items.map((item) => item.id))
  const activeId = useActiveHeading(ids)

  if (variant === 'mobile') {
    return (
      <details className="group rounded-lg border border-border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          목차
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <nav aria-label="목차" className="border-t border-border px-2 py-3">
          <TocList items={items} activeId={activeId} />
        </nav>
      </details>
    )
  }

  return (
    <nav aria-labelledby="toc-heading">
      <p id="toc-heading" className="mb-3 pl-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
        목차
      </p>
      <TocList items={items} activeId={activeId} />
    </nav>
  )
}
