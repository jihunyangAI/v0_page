import type { MetadataRoute } from 'next'
import { isIndexable, siteUrl } from '@/lib/seo'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable()) return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/' }, sitemap: siteUrl('/sitemap.xml') }
}
