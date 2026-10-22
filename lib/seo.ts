import type { Metadata } from 'next'
import { siteConfig } from './site'
import { withBasePath } from './paths'

/** SITE_URL is the origin; deployment paths are handled by NEXT_PUBLIC_BASE_PATH. */
export function getSiteOrigin(): string | undefined {
  const configured = process.env.SITE_URL
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const value = configured || (vercelHost ? `https://${vercelHost}` : undefined)
  if (!value) return process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : undefined
  const url = new URL(value)
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('SITE_URL must be an absolute HTTP(S) origin without credentials, path, query or fragment.')
  }
  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('Production SITE_URL must use HTTPS.')
  }
  return url.origin
}

export function siteUrl(path: string): string | undefined {
  const origin = getSiteOrigin()
  return origin ? new URL(withBasePath(path), origin).href : undefined
}

export function isIndexable(): boolean {
  return process.env.NODE_ENV === 'production' &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production') && Boolean(getSiteOrigin())
}

export function pageMetadata(path: string, title: string, description: string, thumbnail?: string): Metadata {
  const url = siteUrl(path)
  const image = siteUrl(thumbnail || '/apple-icon.png')
  return {
    title,
    description,
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: {
      type: 'website', siteName: siteConfig.name, locale: 'ko_KR', title, description,
      ...(url ? { url } : {}),
      ...(image ? { images: [{ url: image, alt: title }] } : {}),
    },
    twitter: {
      card: thumbnail ? 'summary_large_image' : 'summary', title, description,
      ...(image ? { images: [image] } : {}),
    },
  }
}
