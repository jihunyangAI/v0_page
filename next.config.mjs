const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const basePath = isGitHubPages ? (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '') : ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isGitHubPages ? { output: 'export', basePath, trailingSlash: true } : {}),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: { unoptimized: true },
}

export default nextConfig
