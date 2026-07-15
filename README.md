# Presence

중요한 온라인 순간을 앞둔 사용자의 촬영 환경과 얼굴 컨디션을 점검하고, 더 나은 시각적 첫인상을 준비하도록 돕는 SvelteKit 서비스입니다.

## 구현 범위

- 브라우저 카메라 프리뷰와 MediaPipe 기반 밝기·얼굴 위치·정면 여부 가이드
- 카메라 권한 거부 시 JPG/PNG 업로드 대체 흐름
- 촬영, 검토, YouCam 분석, 개선 가이드, 재촬영, Before/After 비교
- 영어 기본값과 기기별 언어 설정을 지원하는 한국어 i18n
- YouCam AI Skin Analysis v2.1과 Skin Tone Analysis v2.0 서버 연동
- API Key가 없을 때 전체 UX를 확인할 수 있는 명시적 데모 모드
- 서버·클라이언트 경계의 Zod 응답 검증
- SvelteKit Vercel 어댑터

> 이 서비스는 의료 진단이나 질병 판정을 제공하지 않습니다. 촬영 환경과 온라인 화면에서의 시각적 준비도를 돕는 용도입니다.

## 시작하기

요구 사항: Node.js 20 이상, pnpm 10 이상

```bash
pnpm install
cp .env.example .env
pnpm dev
```

`YOUCAM_API_KEY`가 비어 있으면 분석 결과에 `SAMPLE REPORT` 배지가 표시됩니다. 실제 API를 사용하려면 YouCam API Console에서 발급한 Bearer API Key를 `.env`에 입력하세요. 키는 SvelteKit 서버 코드에서만 읽으며 브라우저 번들에 포함되지 않습니다.

## YouCam 처리 흐름

각 기능은 다음 순서로 독립 처리됩니다.

1. File API로 업로드 URL과 `file_id` 요청
2. 사전 서명된 URL에 이미지 PUT 업로드
3. `file_id`로 AI Task 생성
4. `task_id` 상태를 success/error까지 polling
5. Skin Analysis와 Skin Tone 결과를 UI 계약으로 정규화

Skin Analysis와 Skin Tone은 병렬 실행합니다. Photo Lighting은 계정별 활성 기능명과 과금 범위를 확인한 뒤 `YOUCAM_LIGHTING_FEATURE`에 공식 feature slug를 지정하면 같은 어댑터 흐름으로 실행됩니다.

## 명령어

```bash
pnpm check      # Svelte/TypeScript 검사
pnpm lint       # Prettier + ESLint
pnpm test       # 단위 테스트
pnpm build      # Vercel 배포 빌드
```

## 구조

```text
src/lib/domains/
├── camera/               # 브라우저 카메라와 촬영 품질
├── analysis/             # 공유 계약과 YouCam 서버 어댑터
├── appearance-guidance/  # 결과 기반 개선 가이드
└── comparison/           # 기기 내 Before/After 상태

src/routes/
├── +page.svelte          # MVP 사용자 플로우
└── api/analyze/+server.ts
```

문서에서 제안한 Boundra 원칙은 현재 MVP 속도를 위해 도메인별 `client/server/shared` 경계, 서버 전용 비밀값, 공유 계약 검증에 한정해 적용했습니다. 별도 코드 생성이나 프레임워크 확장은 하지 않았습니다.

## 이미지 출처

- 랜딩 화면 인물 사진: [Jake Nackos / Unsplash](https://unsplash.com/photos/IF9TK5Uy-KI)
