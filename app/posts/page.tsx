import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PostsExplorer } from '@/components/posts-explorer'
import { getAllTags, getPostSummaries } from '@/lib/posts'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...pageMetadata('/posts', '전체 글', '조용한 문장에 공개된 모든 글을 최신순으로 모아 보고, 검색과 태그로 찾아볼 수 있습니다.'),
  title: '전체 글',
  description: '조용한 문장에 공개된 모든 글을 최신순으로 모아 보고, 검색과 태그로 찾아볼 수 있습니다.',
}

export default function PostsPage() {
  const posts = getPostSummaries()
  const tags = getAllTags()

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <header className="py-12 md:py-16">
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl">전체 글</h1>
        <p className="mt-3 text-muted-foreground">
          {'지금까지 쓴 글을 최신순으로 모았습니다. 검색어와 태그를 함께 사용해 원하는 글을 찾아보세요.'}
        </p>
      </header>
      <Suspense fallback={null}>
        <PostsExplorer posts={posts} tags={tags} />
      </Suspense>
    </div>
  )
}
