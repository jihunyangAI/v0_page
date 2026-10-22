import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PostCard } from '@/components/post-card'
import { getPostSummaries } from '@/lib/posts'
import { siteConfig } from '@/lib/site'

export default function HomePage() {
  const latestPosts = getPostSummaries(6)

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <section className="border-b border-border/70 py-16 md:py-24" aria-labelledby="site-title">
        <p className="text-sm font-medium text-primary">개인 블로그</p>
        <h1 id="site-title" className="mt-3 font-serif text-4xl font-bold tracking-tight text-balance md:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">{siteConfig.description}</p>
      </section>

      <section className="py-14" aria-labelledby="latest-posts">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 id="latest-posts" className="font-serif text-2xl font-bold">
            최신 글
          </h2>
        </div>

        {latestPosts.length > 0 ? (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post, index) => (
              <li key={post.slug}>
                <PostCard post={post} priority={index < 3} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">아직 공개된 글이 없습니다.</p>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            전체 포스팅 보기
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
