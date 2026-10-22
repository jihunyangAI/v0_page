import { MarkdownAsync, type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import { CodeBlock } from '@/components/code-block'

const prettyCodeOptions: PrettyCodeOptions = {
  theme: 'github-light',
  keepBackground: false,
  defaultLang: 'plaintext',
}

const components: Components = {
  pre({ node: _node, ...props }) {
    const language = (props as Record<string, unknown>)['data-language']
    return (
      <CodeBlock language={typeof language === 'string' ? language : undefined}>
        <pre {...props} />
      </CodeBlock>
    )
  },
  table({ node: _node, ...props }) {
    return (
      <div className="overflow-x-auto rounded-lg border border-border" role="region" aria-label="표" tabIndex={0}>
        <table {...props} />
      </div>
    )
  },
  a({ node: _node, href = '', ...props }) {
    const isExternal = /^https?:\/\//.test(href)
    return (
      <a href={href} {...props} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})} />
    )
  },
  img({ node: _node, alt = '', ...props }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} loading="lazy" decoding="async" {...props} />
  },
}

export async function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-content">
      <MarkdownAsync
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypePrettyCode, prettyCodeOptions]]}
        components={components}
      >
        {content}
      </MarkdownAsync>
    </div>
  )
}
