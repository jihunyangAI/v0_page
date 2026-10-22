// Execute the real TypeScript modules without a Next build or network access.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')
const root = process.cwd()
const modules = new Map()
function load(file) {
  const absolute = path.resolve(root, file)
  if (modules.has(absolute)) return modules.get(absolute).exports
  const module = { exports: {} }
  modules.set(absolute, module)
  const source = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const localRequire = (name) => {
    if (name === 'server-only') return {}
    if (name.startsWith('@/')) return load(`${name.slice(2)}.ts`)
    if (name.startsWith('.')) return load(path.resolve(path.dirname(absolute), `${name}.ts`))
    return require(name)
  }
  new Function('require', 'module', 'exports', source)(localRequire, module, module.exports)
  return module.exports
}
const seo = load('lib/seo.ts')
const original = { ...process.env }
try {
  process.env.NODE_ENV = 'production'
  process.env.VERCEL_ENV = 'production'
  delete process.env.SITE_URL
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL
  delete process.env.NEXT_PUBLIC_BASE_PATH
  assert.equal(seo.siteUrl('/posts'), undefined)
  assert.equal(seo.isIndexable(), false)
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'production.test'
  assert.equal(seo.siteUrl('/posts'), 'https://production.test/posts')
  process.env.SITE_URL = 'https://canonical.test'
  assert.equal(seo.siteUrl('/posts'), 'https://canonical.test/posts')
  for (const invalid of ['javascript:alert(1)', 'https://host.test/path', 'https://host.test?q=1', 'https://u:p@host.test', 'http://host.test']) {
    process.env.SITE_URL = invalid
    assert.throws(() => seo.getSiteOrigin())
  }
  process.env.SITE_URL = 'https://canonical.test'
  for (const route of ['/', '/posts', '/posts/prompt-engineering']) {
    const meta = seo.pageMetadata(route, 'Title', 'Description')
    assert.equal(meta.alternates.canonical, `https://canonical.test${route}`)
    assert.equal(meta.openGraph.url, meta.alternates.canonical)
    assert.equal(meta.twitter.images[0], 'https://canonical.test/apple-icon.png')
  }
  const posts = load('lib/posts.ts').getPublishedPosts()
  const sitemap = load('app/sitemap.ts').default
  const robots = load('app/robots.ts').default
  const urls = sitemap().map((item) => item.url)
  assert.equal(urls.length, posts.length + 2)
  for (const post of posts) assert.ok(urls.includes(`https://canonical.test/posts/${encodeURIComponent(post.slug)}`))
  assert.ok(!urls.some((url) => url.endsWith('/upcoming-series')))
  assert.equal(robots().sitemap, 'https://canonical.test/sitemap.xml')
  process.env.NEXT_PUBLIC_BASE_PATH = '/v0_page'
  assert.equal(seo.siteUrl('/posts'), 'https://canonical.test/v0_page/posts')
  process.env.VERCEL_ENV = 'preview'
  assert.deepEqual(sitemap(), [])
  assert.equal(robots().rules.disallow, '/')
  assert.equal(seo.isIndexable(), false)
  console.log(`SEO checks passed: URL validation, route canonicals, ${posts.length} published posts, draft exclusion, Pages base path, preview blocking.`)
} finally {
  process.env = original
}
