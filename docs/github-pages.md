# GitHub Pages 배포

`v0_deploy` 브랜치에 push하면 GitHub Actions가 정적 페이지를 빌드하여 배포합니다. PAT나 별도 배포 키는 필요하지 않습니다.

## 최초 설정

1. 저장소가 GitHub Pages를 사용할 수 있어야 합니다. 현재 비공개 저장소에서 플랜 제한 안내가 나타나면 저장소 소유자가 공개 전환 또는 지원 플랜을 선택해야 합니다. 공개 전환 전에 저장소 내용과 커밋 이력을 검토하세요.
2. 저장소 **Settings → Pages → Build and deployment → Source**를 **GitHub Actions**로 설정합니다.
3. **Settings → Environments → github-pages**의 배포 브랜치 제한이 있다면 `v0_deploy`를 허용합니다.
4. `v0_deploy`에 변경을 push하고 **Actions → Deploy GitHub Pages** 실행 결과를 확인합니다. 완료된 deploy job의 URL이 실제 사이트 주소입니다.

수동 실행은 워크플로가 기본 브랜치에도 있어야 Actions UI에 표시될 수 있습니다. 수동 실행 시에도 `v0_deploy`를 선택해야 하며 다른 브랜치 실행은 건너뜁니다. 일반 배포는 `v0_deploy` push로 시작합니다.

## 빌드 동작

워크플로는 `package.json`의 pnpm 버전과 Node.js 24를 사용하고 lockfile을 고정해 설치합니다. configure-pages의 `base_path`를 사용하므로 저장소 하위 경로와 사용자 사이트/커스텀 도메인의 루트 경로에 대응합니다. 도메인 변경 시 재빌드가 필요합니다.

Pages 빌드에는 서버가 없으므로 Markdown은 빌드 시 HTML로 생성됩니다. 글 수정 후 재배포가 필요합니다. Vercel Analytics는 Pages에서 제외하고 이미지는 원본 정적 파일로 제공합니다. Google Fonts는 빌드 시 다운로드하므로 빌드 환경이 fonts.googleapis.com 및 fonts.gstatic.com에 연결되어야 합니다.

## 로컬 정적 빌드 확인 (PowerShell)

```powershell
$env:GITHUB_PAGES = 'true'
$env:NEXT_PUBLIC_BASE_PATH = '/v0_page'
corepack.cmd pnpm build
corepack.cmd pnpm exec tsc --noEmit
corepack.cmd pnpm check:pages
Remove-Item Env:GITHUB_PAGES, Env:NEXT_PUBLIC_BASE_PATH
```

생성물은 `out/`, 빌드 캐시는 `.next/`에 있습니다. 로컬 Pages 빌드는 개발 서버를 종료한 뒤 실행하세요. 정적 결과물은 `next start`로 실행하지 않습니다. 평소 개발은 환경변수를 지운 뒤 기존 `pnpm dev`를 사용합니다.

검사는 필수 HTML 파일과 HTML 내 로컬 링크·이미지·JS·CSS 경로 및 저장소 접두사를 확인합니다. Actions의 build/typecheck/link 검증이 성공한 경우에만 배포 artifact가 업로드됩니다.

## 참고

- [Next.js static export](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js basePath](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
