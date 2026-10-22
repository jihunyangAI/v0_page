import { withBasePath } from '@/lib/paths'
import Image from 'next/image'
import Link from 'next/link'
import { formatDate, type PostSummary } from '@/lib/post-types'

type PostCardProps = {
  post: PostSummary
  priority?: boolean
  compact?: boolean
}

export function PostCard({ post, priority = false, compact = false }: PostCardProps) {
  if (compact) {
    return (
      <article className="h-full">
        <Link
          href={`/posts/${post.slug}`}
          className="group flex h-full flex-col gap-2.5 rounded-xl border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_oklch(0.3_0.05_255/0.25)] focus-visible:border-primary"
        >
          <time dateTime={post.date} className="text-xs font-medium tracking-wide text-muted-foreground">
            {formatDate(post.date)}
          </time>
          <h3 className="font-serif text-lg leading-snug font-bold text-balance transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
        </Link>
      </article>
    )
  }

  return (
    <article className="h-full">
      <Link
        href={`/posts/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_8px_24px_-12px_oklch(0.3_0.05_255/0.25)] focus-visible:border-primary"
      >
        {post.thumbnail ? (
          <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-secondary">
            <Image
              src={withBasePath(post.thumbnail)}
              alt=""
              fill
              sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              priority={priority}
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 p-6">
          <time dateTime={post.date} className="text-xs font-medium tracking-wide text-muted-foreground">
            {formatDate(post.date)}
          </time>
          <h3 className="font-serif text-xl leading-snug font-bold text-balance text-foreground transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-3 text-[0.95rem] leading-relaxed text-muted-foreground">{post.description}</p>
          {post.tags.length > 0 ? (
            <ul className="mt-auto flex flex-wrap gap-1.5 pt-2" aria-label="태그">
              {post.tags.map((tag) => (
                <li key={tag} className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground">
                  {`#${tag}`}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
