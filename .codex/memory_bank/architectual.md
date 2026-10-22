# 프로젝트 구조와 아키텍처

기준일: 2026-10-23. 프로젝트 루트는 `v0_page/`이며, 이 문서는 현재 소스를 기준으로 작성했다. 파일명 `architectual.md`는 사용자가 지정한 표기를 유지한다.

## 프로젝트 개요

v0에서 생성한 한국어 개인 블로그다. 글은 외부 API나 데이터베이스 대신 `content/posts/`의 Markdown 파일로 관리한다. Next.js App Router의 서버 컴포넌트에서 글을 읽고, 검색·태그 필터·페이지 이동·목차 강조·코드 복사는 클라이언트 컴포넌트에서 처리한다.

## 기술 스택

아래 버전은 설치 결과가 아닌 `package.json`의 선언 값이다.

| 용도 | 구성 |
| --- | --- |
| 프레임워크 | Next.js `16.4.0`, React·React DOM `^19` |
| 언어 | TypeScript `5.7.3`, `strict: true` |
| 패키지 관리자 | pnpm `12.3.4` (`packageManager` 필드) |
| 스타일 | Tailwind CSS `^4.3.3`, PostCSS, CSS 변수, `tw-animate-css` |
| UI | shadcn `^4.11.0`, Base UI `^1.5.0`, Lucide 아이콘 |
| 콘텐츠 | `gray-matter`, `react-markdown`, `remark-gfm`, `remark-parse`, `unified` |
| 코드·목차 | `rehype-pretty-code`, Shiki, `rehype-slug`, `github-slugger`, `mdast-util-to-string` |
| 분석 | `@vercel/analytics` `1.6.1` (프로덕션에서만 렌더링) |

## 디렉터리

```text
v0_page/
├── AGENTS.md                     # 작업 지침과 메모리 문서 읽기 안내
├── .codex/memory_bank/
│   └── architectual.md            # 이 문서
├── app/
│   ├── layout.tsx                 # 공통 레이아웃, 폰트, 메타데이터
│   ├── globals.css                # 테마 토큰, 전역·Markdown 스타일
│   ├── page.tsx                   # 홈
│   ├── not-found.tsx              # 404 화면
│   └── posts/
│       ├── page.tsx               # 전체 글 목록
│       └── [slug]/page.tsx        # 글 상세
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── post-card.tsx
│   ├── posts-explorer.tsx
│   ├── markdown-content.tsx
│   ├── table-of-contents.tsx
│   ├── code-block.tsx
│   └── ui/button.tsx
├── content/posts/                 # Markdown 글 8개 (초안 포함)
├── lib/
│   ├── posts.ts                   # 서버 전용 글 로딩·조회·목차 생성
│   ├── post-types.ts              # 글·요약·목차 타입과 날짜 표시
│   ├── site.ts                    # 사이트 이름·소개
│   └── utils.ts                   # 클래스 병합 유틸리티
├── public/                        # 이미지·아이콘 등 정적 자산
├── components.json               # shadcn 설정
├── next.config.mjs               # Next.js 설정
├── postcss.config.mjs            # Tailwind PostCSS 플러그인
├── tsconfig.json                 # TypeScript, @/* 경로 별칭
├── package.json                  # 의존성과 실행 스크립트
└── pnpm-workspace.yaml           # pnpm 옵션
```

`node_modules/`와 `.next/`는 의존성·빌드 산출물이며 구조 설명에서 제외한다. `next-env.d.ts`는 Next.js의 타입 참조 파일이다.

## 라우팅과 화면

| 경로 | 구현 | 역할 |
| --- | --- | --- |
| `/` | `app/page.tsx` | 사이트 소개, 최신 공개 글 최대 6개, 전체 글 링크 |
| `/posts` | `app/posts/page.tsx` | 공개 글 요약과 태그를 로드하고 `PostsExplorer`에 전달 |
| `/posts/[slug]` | `app/posts/[slug]/page.tsx` | 본문, 썸네일, 목차, 태그, 연관 글 최대 3개 |
| 없는 경로 | `app/not-found.tsx` | 404 화면 |

상세 페이지는 `generateStaticParams()`로 공개 글의 경로를 생성한다. `dynamicParams = false`이며 조회 결과가 없으면 `notFound()`를 호출한다. 글별 `generateMetadata()`는 제목·설명과 Open Graph article 정보를 만든다.

`app/layout.tsx`는 한국어 문서 언어, Noto Sans KR·Noto Serif KR 폰트, 헤더·푸터, 본문 바로가기, 공통 메타데이터를 제공한다. `NODE_ENV`가 `production`인 경우에만 Analytics를 포함한다.

## 글 데이터 흐름

1. `lib/posts.ts`는 `server-only`로 보호되며 Node.js `fs`로 `process.cwd()/content/posts`의 `.md` 파일을 읽는다. 따라서 실행 기준 디렉터리는 프로젝트 루트여야 한다.
2. `gray-matter`로 frontmatter와 본문을 분리한다. 파일명에서 `.md`를 제외한 값이 URL slug다.
3. `title`, `description`은 비어 있지 않은 필수 문자열이다. `date`는 유효한 Date 객체 또는 `YYYY-MM-DD` 형식 문자열을 처리한다. `tags`, `related`는 문자열 배열로 정리하고 `thumbnail`은 선택 문자열로 처리한다.
4. `draft: true`인 글은 공개 목록·상세 조회·태그 집계·정적 경로·연관 글 후보에서 제외한다. 날짜가 미래라는 이유만으로 자동 비공개 처리하지는 않는다.
5. 공개 글은 날짜 내림차순, 같은 날짜에는 한국어 제목 순으로 정렬한다. 파일 로딩과 공개 목록은 React `cache()`로 감싼다.
6. `toSummary()`는 본문·초안 여부·연관 slug를 제외한 카드용 데이터만 반환한다. 클라이언트 목록에는 이 요약을 전달한다.
7. 연관 글은 frontmatter의 `related` slug를 우선하고, 공통 태그 수와 최신순을 사용해 채운 뒤, 남는 자리는 나머지 최신 글로 채운다. 자기 자신과 중복은 제외한다.

현재 `content/posts/upcoming-series.md`는 `draft: true`인 예제다. 글 추가·수정은 이 폴더의 Markdown을 편집하는 방식이며, 프로덕션 정적 페이지 반영에는 재빌드가 필요하다.

## 렌더링과 인터랙션

- `MarkdownContent`는 서버에서 비동기 `MarkdownAsync`를 사용한다. GFM, 제목 ID, `github-light` 테마 코드 강조를 적용한다. 표는 가로 스크롤 영역으로 감싸고 외부 HTTP(S) 링크에는 새 창과 `noopener noreferrer`를 지정한다.
- `getTableOfContents()`는 Markdown의 최상위 제목 노드를 순회하고 2·3단계 제목을 목차 항목으로 만든다. `github-slugger`로 제목 ID를 생성한다.
- `TableOfContents`는 클라이언트에서 `IntersectionObserver`로 현재 제목을 강조한다. 모바일은 접이식, 데스크톱은 상세 페이지의 sticky 사이드바로 표시한다.
- `PostsExplorer`는 제목·설명을 대소문자 구분 없이 검색하고 태그를 함께 필터링한다. 페이지당 9개를 표시하며 `q`, `tag`, `page` 쿼리를 초기 상태로 읽고 `history.replaceState()`로 URL에 반영한다.
- `CodeBlock`은 클립보드 복사와 복사 상태 표시를 담당한다.
- `PostCard`는 목록·홈의 기본 카드와 연관 글용 compact 변형을 제공한다. `SiteHeader`·`SiteFooter`는 `lib/site.ts`의 사이트 정보를 공유한다.
- `components/ui/button.tsx`는 Base UI와 `class-variance-authority` 기반 공통 버튼이다. `components.json`은 shadcn `base-nova` 스타일과 경로 별칭을 지정한다.

## 스타일과 설정

`app/globals.css`에서 Tailwind, 애니메이션, shadcn 스타일을 불러온다. 밝은 배경과 파란 기본색의 CSS 토큰, 글꼴, 반응형 레이아웃, Markdown 본문 스타일을 관리한다. 공통 폰트는 `next/font/google`을 사용한다.

`tsconfig.json`의 `@/*`는 프로젝트 루트를 가리킨다. `next.config.mjs`에는 `images.unoptimized: true`가 설정되어 있다. 기존 `typescript.ignoreBuildErrors` 옵션을 제거하여 빌드 시 타입 오류를 차단하고, 배포 워크플로에서도 별도로 타입 검사를 실행한다.

## 실행과 검증

프로젝트 루트에서 실행한다. Windows에서 기존에 안내한 Corepack 명령을 기준으로 한다.

```powershell
cd C:\CODEX_TEST\v0_test\v0_page
corepack.cmd pnpm install
corepack.cmd pnpm dev
```

기본 개발 주소는 `http://localhost:3000`이다. 사용 중인 포트와 실제 주소는 서버 출력으로 확인한다.

```powershell
corepack.cmd pnpm build
corepack.cmd pnpm start
corepack.cmd pnpm exec tsc --noEmit
```

`start`는 프로덕션 빌드 후 실행한다. 현재 `package.json`에는 별도 `test`·`lint` 스크립트가 없다. 위 명령은 실행 방법을 기록한 것이며, 이 문서 작성 과정에서 빌드나 타입 검사 성공을 검증한 것은 아니다.

## 변경 시 함께 갱신할 위치

- 사이트 이름·소개: `lib/site.ts`
- 글·썸네일 참조: `content/posts/`, 정적 이미지: `public/`
- 글 필드·조회 규칙: `lib/post-types.ts`, `lib/posts.ts`
- 화면·탐색 경로: `app/`, 화면 조각: `components/`
- 디자인 토큰·본문 스타일: `app/globals.css`
- 구조·라우팅·데이터 흐름·실행 명령 변경: 이 문서


## GitHub Pages 배포 (2026-10-23)

- `.github/workflows/deploy-pages.yml`: `v0_deploy` push 또는 해당 브랜치 수동 실행으로 배포한다. Node.js 24와 packageManager에 지정된 pnpm으로 의존성을 설치하고, 정적 빌드·타입 검사·내부 링크 검사를 통과한 결과물을 배포한다.
- `GITHUB_PAGES=true`일 때만 `output: export`, `trailingSlash: true`를 사용한다. 결과물은 `out/`, 캐시는 `.next/`이므로 로컬 빌드 전 개발 서버를 종료한다.
- `NEXT_PUBLIC_BASE_PATH`는 configure-pages의 `base_path`에서 전달한다. `next/link`는 자동 접두사를 사용하고 네이티브 링크·이미지·메타데이터는 `lib/paths.ts`의 `withBasePath()`를 사용한다. 검색 URL은 현재 pathname을 유지한다.
- Pages 빌드에서는 Vercel Analytics를 제외한다. `next/font/google`는 빌드 시 Google Fonts 네트워크 연결이 필요하다.
- `scripts/check-pages.mjs` (`pnpm check:pages`)가 필수 HTML 파일, 모든 공개 글의 출력 및 초안의 비공개 여부, HTML 내부 링크·이미지·JS·CSS 경로와 basePath를 확인한다.
- 저장소의 Pages 사용 자격 및 Settings → Pages → Source: GitHub Actions 설정이 선행되어야 한다. github-pages 환경의 배포 브랜치 제한에는 v0_deploy를 허용해야 한다. 비공개 저장소의 플랜 제약은 사용자가 결정한다.
- 상세 설정과 로컬 확인은 `docs/github-pages.md`를 참조한다. 실제 배포 성공 여부는 Actions 실행과 공개 URL로 별도 검증한다.

## Vercel 배포 (2026-10-23)

- `v0_vercel` 브랜치의 `vercel.json`은 Next.js 프리셋, `pnpm install --frozen-lockfile`, `pnpm build`를 지정한다. 정적 설정만 필요하므로 별도 설정 패키지 의존성 없이 JSON을 사용한다.
- `package.json`의 `engines.node`는 `24.x`다. Vercel에는 `ENABLE_EXPERIMENTAL_COREPACK=1`을 설정해 `packageManager`의 pnpm 버전을 사용한다.
- `git.deploymentEnabled`는 이 파일이 적용되는 브랜치 중 `v0_vercel`만 허용한다. 파일이 없는 다른 브랜치까지 전역 차단하지는 않는다. Vercel 프로젝트의 Production Branch는 대시보드에서 별도로 `v0_vercel`로 설정해야 한다.
- Root Directory는 저장소 루트이며 Output Directory는 Next.js 기본값이다. Vercel에 `GITHUB_PAGES`와 `NEXT_PUBLIC_BASE_PATH`를 설정하지 않는다. 기본 Next.js 빌드에서는 `/v0_page` 접두사와 `out/` 정적 내보내기를 사용하지 않는다.
- 연결 및 확인 절차는 `docs/vercel.md`에 기록했다. 저장소 설정 작성과 실제 원격 프로젝트 연결·배포 성공은 구분하며, 성공 여부는 Vercel 배포 상태와 공개 URL로 검증한다.
