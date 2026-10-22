import 'server-only'

import fs from 'node:fs'
import path from 'node:path'
import { cache } from 'react'
import matter from 'gray-matter'
import GithubSlugger from 'github-slugger'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { toString } from 'mdast-util-to-string'
import type { Post, PostSummary, TocItem } from './post-types'

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts')
const RELATED_LIMIT = 3

function normalizeDate(value: unknown, file: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim()
  }
  throw new Error(`[posts] ${file}: date는 "YYYY-MM-DD" 형식이어야 합니다.`)
}

function requireString(data: Record<string, unknown>, key: string, file: string): string {
  const value = data[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`[posts] ${file}: frontmatter의 "${key}"는 필수 항목입니다.`)
  }
  return value.trim()
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim() !== '').map((item) => item.trim())
}

function parsePostFile(fileName: string): Post {
  const slug = fileName.replace(/\.md$/, '')
  const raw = fs.readFileSync(path.join(POSTS_DIR, fileName), 'utf8')
  const { data, content } = matter(raw)

  const thumbnail = typeof data.thumbnail === 'string' && data.thumbnail.trim() !== '' ? data.thumbnail.trim() : undefined

  return {
    slug,
    title: requireString(data, 'title', fileName),
    description: requireString(data, 'description', fileName),
    date: normalizeDate(data.date, fileName),
    tags: toStringArray(data.tags),
    thumbnail,
    related: toStringArray(data.related),
    draft: data.draft === true,
    content,
  }
}

const getAllPostsIncludingDrafts = cache((): Post[] => {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map(parsePostFile)
})

function byNewest(a: PostSummary, b: PostSummary) {
  if (a.date === b.date) return a.title.localeCompare(b.title, 'ko')
  return a.date < b.date ? 1 : -1
}

export function toSummary(post: Post): PostSummary {
  const { slug, title, description, date, tags, thumbnail } = post
  return { slug, title, description, date, tags, ...(thumbnail ? { thumbnail } : {}) }
}

export const getPublishedPosts = cache((): Post[] => {
  return getAllPostsIncludingDrafts()
    .filter((post) => !post.draft)
    .sort(byNewest)
})

export function getPostSummaries(limit?: number): PostSummary[] {
  const summaries = getPublishedPosts().map(toSummary)
  return typeof limit === 'number' ? summaries.slice(0, limit) : summaries
}

export function getPostBySlug(slug: string): Post | undefined {
  return getPublishedPosts().find((post) => post.slug === slug)
}

export function getAllTags(): string[] {
  const counts = new Map<string, number>()
  for (const post of getPublishedPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko'))
    .map(([tag]) => tag)
}

export function getRelatedPosts(post: Post): PostSummary[] {
  const candidates = getPublishedPosts().filter((other) => other.slug !== post.slug)
  const bySlug = new Map(candidates.map((other) => [other.slug, other]))
  const picked = new Map<string, Post>()

  for (const slug of post.related) {
    const match = bySlug.get(slug)
    if (match && !picked.has(slug)) picked.set(slug, match)
    if (picked.size >= RELATED_LIMIT) break
  }

  if (picked.size < RELATED_LIMIT) {
    const tagSet = new Set(post.tags)
    const byTags = candidates
      .filter((other) => !picked.has(other.slug))
      .map((other) => ({ other, shared: other.tags.filter((tag) => tagSet.has(tag)).length }))
      .filter(({ shared }) => shared > 0)
      .sort((a, b) => b.shared - a.shared || byNewest(a.other, b.other))

    for (const { other } of byTags) {
      if (picked.size >= RELATED_LIMIT) break
      picked.set(other.slug, other)
    }
  }

  for (const other of candidates) {
    if (picked.size >= RELATED_LIMIT) break
    if (!picked.has(other.slug)) picked.set(other.slug, other)
  }

  return [...picked.values()].map(toSummary)
}

export function getTableOfContents(content: string): TocItem[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(content)
  const slugger = new GithubSlugger()
  const items: TocItem[] = []

  for (const node of tree.children) {
    if (node.type !== 'heading') continue
    const text = toString(node)
    const id = slugger.slug(text)
    if (node.depth === 2 || node.depth === 3) {
      items.push({ id, text, depth: node.depth })
    }
  }

  return items
}
