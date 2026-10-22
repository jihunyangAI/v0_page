import { withBasePath } from '@/lib/paths'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { MarkdownContent } from '@/components/markdown-content'
import { PostCard } from '@/components/post-card'
import { TableOfContents } from '@/components/table-of-contents'
import { formatDate } from '@/lib/post-types'
import { getPostBySlug, getPublishedPosts, getRelatedPosts, getTableOfContents } from '@/lib/posts'

export const dynamicParams = false

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<'/posts/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      tags: post.tags,
      ...(post.thumbnail ? { images: [withBasePath(post.thumbnail)] } : {}),
    },
  }
}

export default async function PostPage({ params }: PageProps<'/posts/[slug]'>) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const toc = getTableOfContents(post.content)
  const related = getRelatedPosts(post)

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8">
      <div className="pt-8">
        <Link
          href="/posts"
          className="inline-flex items-center gap-1.5 rounded-md py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          전체 글
        </Link>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-16">
        <article className="mx-auto w-full max-w-[720px] min-w-0">
          <header className="pt-8 pb-10">
            {post.tags.length > 0 ? (
              <ul className="mb-5 flex flex-wrap gap-2" aria-label="태그">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/posts?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                      {`#${tag}`}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
            <h1 className="font-serif text-3xl leading-tight font-bold tracking-tight text-balance md:text-[2.6rem]">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-pretty text-muted-foreground">{post.description}</p>
            <time dateTime={post.date} className="mt-6 block text-sm text-muted-foreground">
              {formatDate(post.date)}
            </time>
          </header>

          {post.thumbnail ? (
            <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-secondary">
              <Image
                src={withBasePath(post.thumbnail)}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 720px, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}

          {toc.length > 0 ? (
            <div className="mb-10 lg:hidden">
              <TableOfContents items={toc} variant="mobile" />
            </div>
          ) : null}

          <MarkdownContent content={post.content} />

          <div className="mt-16 border-t border-border pt-8">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              전체 포스팅 목록으로 돌아가기
            </Link>
          </div>
        </article>

        {toc.length > 0 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24 mt-8 max-h-[calc(100dvh-8rem)] overflow-y-auto">
              <TableOfContents items={toc} variant="desktop" />
            </div>
          </aside>
        ) : null}
      </div>

      {related.length > 0 ? (
        <section className="mt-20 border-t border-border pt-12" aria-labelledby="related-posts">
          <h2 id="related-posts" className="mb-8 font-serif text-2xl font-bold">
            함께 읽으면 좋은 글
          </h2>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <PostCard post={item} compact />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
