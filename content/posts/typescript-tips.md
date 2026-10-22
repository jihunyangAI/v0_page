---
title: "블로그 코드를 지키는 TypeScript 습관"
description: "작은 프로젝트라도 타입이 있으면 마음이 편합니다. frontmatter 검증부터 유니언 타입까지, 블로그를 만들며 익힌 습관을 공유합니다."
date: "2026-09-28"
tags: ["TypeScript", "개발", "Next.js"]
related:
  - nextjs-blog
---

혼자 쓰는 블로그 코드라도 몇 달 뒤의 나는 남과 같습니다. TypeScript는 그런 미래의 나에게 남기는 친절한 메모입니다.

## frontmatter를 믿지 말기

Markdown 파일의 frontmatter는 사람이 직접 쓰기 때문에 언제든 틀릴 수 있습니다. 그래서 읽어 올 때 한 번 검증합니다.

```ts
function requireString(data: Record<string, unknown>, key: string) {
  const value = data[key]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`"${key}"는 필수 항목입니다.`)
  }
  return value
}
```

빌드 중에 오류가 나면 잘못된 글이 배포되기 전에 바로 알 수 있습니다.

## 좁은 타입 쓰기

### 유니언 타입

목차에는 H2와 H3만 들어갑니다. 그렇다면 `number`보다 `2 | 3`이 더 정확합니다.

```ts
type TocItem = {
  id: string
  text: string
  depth: 2 | 3
}
```

### 선택 항목은 선택으로

썸네일이 없는 글도 있으니 `thumbnail?: string`으로 선언하고, 쓰는 쪽에서 반드시 확인하게 만듭니다.

## 마치며

타입은 코드를 느리게 만드는 것이 아니라, 고칠 때 덜 두렵게 만들어 줍니다.
