---
title: "Next.js로 정적 블로그 만들기"
description: "App Router와 파일 시스템만으로 데이터베이스 없는 블로그를 만드는 과정을 정리했습니다. 빌드할 때 Markdown을 읽어 정적 페이지로 만듭니다."
date: "2026-10-15"
tags: ["Next.js", "블로그", "개발"]
thumbnail: "/images/posts/nextjs-blog.png"
related:
  - markdown-guide
  - typescript-tips
---

개인 블로그에 데이터베이스가 꼭 필요할까요? 글이 수백 개가 되기 전까지는 **파일 시스템**만으로 충분합니다. 이 글에서는 이 블로그의 구조를 간단히 소개합니다.

## 전체 구조

글은 `content/posts` 폴더에 있고, 페이지는 `app` 폴더에 있습니다.

```text
content/
  posts/
    markdown-guide.md
    nextjs-blog.md
app/
  page.tsx
  posts/
    page.tsx
    [slug]/
      page.tsx
```

## 빌드 시점에 글 읽기

### 서버에서만 파일 읽기

파일을 읽는 코드는 서버 컴포넌트에서만 실행됩니다. 실수로 클라이언트에서 불러오지 않도록 `server-only` 패키지를 가져옵니다.

```ts
import 'server-only'
import fs from 'node:fs'

export function getSlugs() {
  return fs
    .readdirSync('content/posts')
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''))
}
```

### 정적 경로 만들기

`generateStaticParams`로 공개된 글의 slug만 내보내고, `dynamicParams`를 `false`로 두면 목록에 없는 주소는 자동으로 404가 됩니다.

```tsx
export const dynamicParams = false

export function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }))
}
```

## 배포

새 글을 추가하고 저장소에 푸시하면 다시 빌드되면서 목록과 상세 페이지에 자동으로 반영됩니다. 따로 관리자 화면이 없어도 되니 관리할 것이 훨씬 적습니다.

> 가장 유지보수하기 쉬운 코드는 작성하지 않은 코드다.
