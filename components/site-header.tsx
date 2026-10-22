import Link from 'next/link'
import { siteConfig } from '@/lib/site'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-tight text-foreground transition-colors hover:text-primary"
        >
          {siteConfig.name}
        </Link>
        <nav aria-label="주요 메뉴">
          <ul className="flex items-center gap-1 text-sm">
            <li>
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                홈
              </Link>
            </li>
            <li>
              <Link
                href="/posts"
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                전체 글
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
