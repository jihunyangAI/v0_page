/** Prefix root-relative assets and native URLs. next/link adds basePath itself. */
export function withBasePath(path: string): string {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  if (!basePath || !path.startsWith('/') || path.startsWith('//')) return path
  if (path === basePath || path.startsWith(`${basePath}/`) || path.startsWith(`${basePath}?`) || path.startsWith(`${basePath}#`)) return path
  return `${basePath}${path}`
}
