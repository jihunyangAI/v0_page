import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/posts'
import { isIndexable, siteUrl } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isIndexable()) return []
  return [
    { url: siteUrl('/')! },
    { url: siteUrl('/posts')! },
    ...getPublishedPosts().map((post) => ({
      url: siteUrl(`/posts/${encodeURIComponent(post.slug)}`)!,
      lastModified: post.date,
    })),
  ]
}
