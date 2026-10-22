# Vercel 배포

배포 대상은 `jihunyangAI/v0_page` 저장소의 `v0_vercel` 브랜치다. Vercel GitHub 연동이 이 브랜치의 푸시를 빌드하고 배포한다. GitHub Actions는 기존 GitHub Pages 배포에 사용한다.

## 최초 연결

1. [Vercel 새 프로젝트](https://vercel.com/new)에서 사용할 계정 또는 팀을 선택하고 GitHub 저장소 `jihunyangAI/v0_page`를 Import한다. 저장소가 보이지 않으면 Vercel GitHub 앱의 저장소 접근 권한을 허용한다.
2. Framework Preset은 **Next.js**, Root Directory는 **저장소 루트(`./`)**로 설정한다. 로컬 폴더 이름인 `v0_page`를 하위 경로로 지정하지 않는다.
3. Node.js 버전은 **24.x**를 사용한다. Install Command는 `pnpm install --frozen-lockfile`, Build Command는 `pnpm build`이며 `vercel.json`에 기록되어 있다. Output Directory는 **Next.js 기본값**으로 두고 Override를 끈다.
4. Environment Variables에는 `ENABLE_EXPERIMENTAL_COREPACK=1`을 추가해 `package.json`의 `packageManager`에 지정한 pnpm을 사용한다. 현재 블로그에는 별도의 API 키가 필요하지 않다. `GITHUB_PAGES`와 `NEXT_PUBLIC_BASE_PATH`는 추가하지 않는다. 기존에 있다면 제거한다.
5. 프로젝트 생성 후 **Settings → Environments → Production → Branch Tracking**에서 Production Branch를 **`v0_vercel`**로 지정한다. 이 값은 `vercel.json`에서 지정할 수 없다. 최초 Import가 다른 브랜치를 사용했다면 `v0_vercel`을 선택해 새 배포를 생성한다.
6. Deployments에서 `v0_vercel`의 Production 배포가 Ready인지 확인하고 배포 URL의 홈, `/posts`, `/posts/prompt-engineering`을 연다. `/v0_page` 접두사는 사용하지 않는다.

`vercel.json`의 `git.deploymentEnabled`는 이 설정 파일을 사용하는 브랜치 중 `v0_vercel`만 자동 배포하도록 제한한다. 다른 브랜치에는 이 파일이 없을 수 있으므로, 모든 브랜치에 대한 전역 차단 설정으로 간주하지 않는다. Production Branch를 반드시 별도로 지정한다.

## 로컬 확인과 CLI

프로젝트 루트에서 실행한다.

```powershell
corepack.cmd pnpm install --frozen-lockfile
corepack.cmd pnpm exec tsc --noEmit
corepack.cmd pnpm build
corepack.cmd pnpm start
```

`next/font/google`이 빌드 중 Google Fonts를 다운로드하므로 네트워크 연결이 필요하다. GitHub Pages용 환경 변수를 설정한 터미널이라면 제거한 뒤 빌드한다.

Vercel CLI 설치를 권장한다. 환경 변수 동기화, 배포, 로그 확인을 터미널에서 수행할 수 있다.

```powershell
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
vercel deploy
vercel logs
```

일상적인 Production 배포는 `v0_vercel` 브랜치에 커밋을 푸시하면 된다. `vercel deploy`는 기본적으로 Preview를 생성한다. CLI 연결 정보 `.vercel/`과 `.env.local`은 Git에 올리지 않는다.

## 설정 근거

- [Vercel Git 배포 설정](https://vercel.com/docs/project-configuration/git-configuration)
- [Vercel 정적 프로젝트 설정](https://vercel.com/docs/project-configuration/vercel-json)
- [Vercel 패키지 관리자와 Corepack](https://vercel.com/docs/package-managers)
- [Production 환경](https://vercel.com/docs/deployments/environments#production-environment)
