import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import matter from 'gray-matter'

const output = resolve('out')
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/$/, '')
const files = []
function walk(directory) {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry)
    if (statSync(path).isDirectory()) walk(path)
    else if (path.endsWith('.html')) files.push(path)
  }
}
for (const page of ['index.html', '404.html', 'posts/index.html']) {
  if (!existsSync(join(output, page))) throw new Error(`Missing exported page: ${page}`)
}
walk(output)
for (const filename of readdirSync('content/posts').filter(name => name.endsWith('.md'))) {
  const slug = filename.slice(0, -3)
  const { data } = matter(readFileSync(join('content/posts', filename), 'utf8'))
  const exported = existsSync(join(output, 'posts', slug, 'index.html'))
  if (data.draft === true && exported) throw new Error(`Draft post was exported: ${slug}`)
  if (data.draft !== true && !exported) throw new Error(`Published post is missing: ${slug}`)
}
let checked = 0
const failures = []
for (const file of files) {
  const html = readFileSync(file, 'utf8')
  if (html.includes('/_vercel/insights/')) failures.push(`${file}: Vercel Analytics enabled`)
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const target = match[1].replaceAll('&amp;', '&')
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#|\?)/i.test(target)) continue
    const pathname = decodeURIComponent(target.split(/[?#]/)[0])
    if (basePath && pathname.startsWith('/') && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) {
      failures.push(`${file}: URL missing basePath: ${target}`)
      continue
    }
    const local = pathname.startsWith('/')
      ? resolve(output, `.${pathname.slice(basePath.length) || '/'}`)
      : resolve(dirname(file), pathname)
    if (!local.startsWith(`${output}/`) && !local.startsWith(`${output}\\`) && local !== output) {
      failures.push(`${file}: URL escapes export: ${target}`)
      continue
    }
    if (![local, join(local, 'index.html'), `${local}.html`].some(path => existsSync(path) && statSync(path).isFile())) {
      failures.push(`${file}: Missing local target: ${target}`)
    }
    checked++
  }
}
if (failures.length) throw new Error(failures.join('\n'))
console.log(`Verified ${files.length} HTML files and ${checked} local links/assets (basePath: ${basePath || '/'}).`)
