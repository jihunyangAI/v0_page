import { siteConfig } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p className="font-serif font-semibold text-foreground">{siteConfig.name}</p>
        <p>{siteConfig.description}</p>
      </div>
    </footer>
  )
}
