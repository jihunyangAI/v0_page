'use client'

import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import { PostCard } from '@/components/post-card'
import type { PostSummary } from '@/lib/post-types'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 9

type PostsExplorerProps = {
  posts: PostSummary[]
  tags: string[]
}

type FilterState = {
  query: string
  tag: string | null
  page: number
}

function syncUrl({ query, tag, page }: FilterState) {
  const params = new URLSearchParams()
  if (query.trim()) params.set('q', query.trim())
  if (tag) params.set('tag', tag)
  if (page > 1) params.set('page', String(page))
  const search = params.toString()
  window.history.replaceState(null, '', `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`)
}

export function PostsExplorer({ posts, tags }: PostsExplorerProps) {
  const searchParams = useSearchParams()
  const listTopRef = useRef<HTMLDivElement>(null)

  const [filters, setFilters] = useState<FilterState>(() => {
    const initialTag = searchParams.get('tag')
    return {
      query: searchParams.get('q') ?? '',
      tag: initialTag && tags.includes(initialTag) ? initialTag : null,
      page: Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1),
    }
  })

  const update = (next: Partial<FilterState>) => {
    setFilters((prev) => {
      const merged = { ...prev, ...next }
      syncUrl(merged)
      return merged
    })
  }

  const filtered = useMemo(() => {
    const keyword = filters.query.trim().toLowerCase()
    return posts.filter((post) => {
      if (filters.tag && !post.tags.includes(filters.tag)) return false
      if (!keyword) return true
      return post.title.toLowerCase().includes(keyword) || post.description.toLowerCase().includes(keyword)
    })
  }, [posts, filters.query, filters.tag])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(filters.page, totalPages)
  const visiblePosts = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const hasFilters = filters.query.trim() !== '' || filters.tag !== null

  const goToPage = (page: number) => {
    update({ page })
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const resetFilters = () => update({ query: '', tag: null, page: 1 })

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="relative max-w-xl">
          <label htmlFor="post-search" className="sr-only">
            제목 또는 요약으로 검색
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="post-search"
            type="search"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value, page: 1 })}
            placeholder="제목이나 요약으로 검색"
            autoComplete="off"
            className="h-12 w-full rounded-full border border-input bg-card pr-11 pl-11 text-base text-foreground transition-colors placeholder:text-muted-foreground hover:border-primary/40 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.query ? (
            <button
              type="button"
              onClick={() => update({ query: '', page: 1 })}
              className="absolute top-1/2 right-3 flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">검색어 지우기</span>
            </button>
          ) : null}
        </div>

        {tags.length > 0 ? (
          <div role="group" aria-label="태그 필터" className="flex flex-wrap gap-2">
            <TagButton active={filters.tag === null} onClick={() => update({ tag: null, page: 1 })}>
              전체
            </TagButton>
            {tags.map((tag) => (
              <TagButton
                key={tag}
                active={filters.tag === tag}
                onClick={() => update({ tag: filters.tag === tag ? null : tag, page: 1 })}
              >
                {`#${tag}`}
              </TagButton>
            ))}
          </div>
        ) : null}
      </div>

      <div ref={listTopRef} className="scroll-mt-24 pt-8">
        <p className="mb-6 text-sm text-muted-foreground" aria-live="polite">
          {hasFilters ? `검색 결과 ${filtered.length}개` : `전체 ${filtered.length}개의 글`}
        </p>

        {visiblePosts.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((post, index) => (
              <li key={post.slug}>
                <PostCard post={post} priority={currentPage === 1 && index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <p className="font-serif text-lg font-bold">조건에 맞는 글이 없습니다.</p>
            <p className="mt-2 text-sm text-muted-foreground">다른 검색어를 입력하거나 태그 선택을 바꿔 보세요.</p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              필터 초기화
            </button>
          </div>
        )}

        {totalPages > 1 ? (
          <nav aria-label="페이지 이동" className="mt-12 flex items-center justify-center gap-1.5">
            <PageButton
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="이전 페이지"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </PageButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PageButton
                key={page}
                onClick={() => goToPage(page)}
                active={page === currentPage}
                aria-current={page === currentPage ? 'page' : undefined}
                aria-label={`${page}페이지`}
              >
                {page}
              </PageButton>
            ))}
            <PageButton
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="다음 페이지"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </PageButton>
          </nav>
        ) : null}
      </div>
    </div>
  )
}

function TagButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-sm transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-secondary-foreground hover:border-primary/40 hover:text-primary',
      )}
    >
      {children}
    </button>
  )
}

function PageButton({
  active = false,
  className,
  ...props
}: React.ComponentProps<'button'> & { active?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'flex size-10 items-center justify-center rounded-full border text-sm transition-colors disabled:pointer-events-none disabled:opacity-40',
        active
          ? 'border-primary bg-primary font-medium text-primary-foreground'
          : 'border-border bg-card hover:border-primary/40 hover:text-primary',
        className,
      )}
      {...props}
    />
  )
}
