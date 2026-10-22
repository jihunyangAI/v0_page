---
title: "Markdown으로 블로그 글 작성하기"
description: "Markdown 파일로 블로그 포스팅을 작성하고 관리하는 방법을 소개합니다. 자주 쓰는 문법부터 표와 코드 블록까지 한 번에 정리했습니다."
date: "2026-10-22"
tags: ["Markdown", "블로그", "글쓰기"]
thumbnail: "/images/posts/markdown-guide.png"
draft: false
related:
  - nextjs-blog
  - writing-workflow
---

블로그 글을 쓰는 도구는 많지만, 저는 결국 **Markdown**으로 돌아왔습니다. 평범한 텍스트 파일이라 어디서든 열리고, 버전 관리가 쉽고, 무엇보다 글 자체에 집중할 수 있기 때문입니다.

이 글에서는 이 블로그가 Markdown 파일을 어떻게 다루는지, 그리고 글을 쓸 때 자주 쓰는 문법을 정리해 보겠습니다.

## 왜 Markdown인가

> 좋은 도구는 눈에 띄지 않는다. 쓰는 사람이 도구를 잊고 생각에만 몰두하게 만든다.

Markdown은 서식을 위한 기호가 최소한이라 글을 쓰는 흐름이 끊기지 않습니다. 별표 두 개로 **굵게**, 하나로 *기울임*을 표현하고, 백틱으로 `인라인 코드`를 감쌉니다.

### 파일 하나가 글 하나

이 블로그에서는 `content/posts` 폴더의 `.md` 파일 하나가 글 하나입니다. 파일명이 곧 주소가 됩니다.

- `markdown-guide.md` → `/posts/markdown-guide`
- `nextjs-blog.md` → `/posts/nextjs-blog`

### 버전 관리가 쉽다

텍스트 파일이므로 Git으로 변경 이력을 그대로 남길 수 있습니다. 어떤 문장을 언제 고쳤는지 언제든 되돌아볼 수 있다는 점은 생각보다 큰 안심이 됩니다.

## Frontmatter 작성법

각 파일의 맨 위에는 글의 정보를 담는 **frontmatter**가 있습니다. YAML 형식으로 작성합니다.

```yaml
---
title: "Markdown으로 블로그 글 작성하기"
description: "목록 카드에 보일 짧은 요약입니다."
date: "2026-10-22"
tags: ["Markdown", "블로그"]
thumbnail: "/images/posts/markdown-guide.png"
draft: false
related:
  - nextjs-blog
---
```

각 항목의 의미는 다음과 같습니다.

| 항목 | 필수 여부 | 설명 |
| --- | :---: | --- |
| `title` | 필수 | 글 제목. 페이지 제목에도 사용됩니다. |
| `description` | 필수 | 목록 카드의 요약과 검색 결과 설명에 쓰입니다. |
| `date` | 필수 | `YYYY-MM-DD` 형식의 작성일. 최신순 정렬 기준입니다. |
| `tags` | 선택 | 태그 목록. 필터와 연관 글 추천에 쓰입니다. |
| `thumbnail` | 선택 | `public` 폴더 기준 이미지 경로입니다. |
| `draft` | 선택 | `true`면 공개 목록과 상세 페이지에서 제외됩니다. |
| `related` | 선택 | 함께 읽으면 좋은 글의 slug 목록입니다. |

## 자주 쓰는 문법

### 목록

순서가 없는 목록은 `-`로, 순서가 있는 목록은 숫자로 시작합니다.

1. 주제를 한 문장으로 적는다
2. 소제목으로 뼈대를 세운다
3. 각 소제목 아래 문단을 채운다
4. 소리 내어 읽으며 다듬는다

### 링크와 이미지

링크는 `[텍스트](주소)` 형식으로 씁니다. 예를 들어 [Markdown 공식 가이드](https://www.markdownguide.org/)처럼요. 이미지는 앞에 느낌표를 붙입니다.

![책상 위에 펼쳐진 노트와 노트북](/images/posts/markdown-guide.png)

### 코드 블록

코드 블록은 백틱 세 개로 감싸고, 언어 이름을 적으면 구문 강조가 적용됩니다. 오른쪽 위의 복사 버튼으로 코드를 바로 복사할 수 있습니다.

```ts
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

export function readPost(slug: string) {
  const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.md`)
  const { data, content } = matter(fs.readFileSync(filePath, 'utf8'))
  return { slug, title: data.title as string, content }
}
```

긴 명령어도 모바일에서는 가로로 스크롤됩니다.

```bash
pnpm dlx some-very-long-command --with-a-long-flag=value --another-flag=another-value --output ./content/posts
```

## 마치며

Markdown의 장점은 결국 **단순함**입니다. 서식에 신경 쓰는 시간을 줄이면, 그만큼 무엇을 쓸지 고민하는 시간이 늘어납니다. 오늘 짧은 메모 하나라도 `.md` 파일로 남겨 보세요.
