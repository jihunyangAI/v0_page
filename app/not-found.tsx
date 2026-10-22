import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="mt-3 font-serif text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        주소가 바뀌었거나 아직 공개되지 않은 글일 수 있습니다.
      </p>
      <Link
        href="/posts"
        className="mt-8 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        전체 글 보기
      </Link>
    </div>
  )
}
