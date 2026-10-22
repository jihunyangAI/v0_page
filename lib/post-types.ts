export type PostSummary = {
  slug: string
  title: string
  description: string
  date: string
  tags: string[]
  thumbnail?: string
}

export type Post = PostSummary & {
  related: string[]
  draft: boolean
  content: string
}

export type TocItem = {
  id: string
  text: string
  depth: 2 | 3
}

export function formatDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return `${year}년 ${month}월 ${day}일`
}
