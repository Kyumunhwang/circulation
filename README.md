# 중학교 2학년 과학 [순환] 인터랙티브 시뮬레이션

중학교 2학년 과학 교육과정 **`[9과11-02] 혈액의 순환 경로와 기능`** 단원을 전자칠판 및 웹 브라우저에서 직관적으로 수업할 수 있도록 제작한 인터랙티브 웹 시뮬레이션입니다.

---

## 주요 기능

- **실시간 혈액 순환 시뮬레이션 (SVG + 60fps Canvas)**: 심방·심실 수축과 이완(`심방 수축` → `심실 수축` → `심실 이완`)에 맞춰 4개 판막(삼첨판·폐동맥 판막·이첨판·대동맥 판막)이 개폐되고, 적혈구(RBC) 입자가 단방향으로 이동하며 모세혈관에서 산소 포화도에 따라 색이 전환됩니다.
- **4가지 학습 모드**: `전체 순환 보기`, `폐순환 집중 모드`, `체순환 집중 모드`, `동맥혈·정맥혈 하이라이트 모드`
- **3단 교사용 대시보드**:
  - 좌측/중앙: 확대·축소(`75% ~ 200%`) 및 드래그 이동 가능한 순환계 모식도
  - 우측 상단: 6종 **해부학 확대 모식도**(`1x`/`2x` 인라인 확대·패닝 및 `2배 크게 보기` 모달 지원)
  - 우측 하단: **단계별 교사용 해설 카드** (이동 방향, 원리, 좌심실 근육벽 두께 비교, 수업 발문 팁)
- **모세혈관 미시 확대 뷰**: 폐포 기체 교환(`O₂`/`CO₂`) 및 조직세포 물질 교환(`O₂`/`영양소`/`CO₂`/`노폐물`) 확산 애니메이션
- **교사용 수업 보조 도구**: 블라인드 테스트(`레이블 숨기기`), `핵심 오개념 비교` 팝업(동맥 vs 동맥혈, 정맥 vs 정맥혈, 폐동맥/폐정맥 예외), `형성평가 퀴즈` 5문항(객관식 + 순환 경로 순서 맞추기)

---

## 교사용 수업 가이드

자세한 차시별 수업 흐름(1~2차시), 전자칠판 조작법 및 수업 활용 팁은 아래 문서를 참고하세요.

- [교사용 시뮬레이션 조작 가이드 및 수업 활용 시나리오](docs/TEACHER_GUIDE.md)

---

## 로컬 개발 및 오프라인 실행

> **Windows PowerShell 안내:** PowerShell 실행 정책으로 `npm.ps1`이 차단된 경우 `cmd /c npm ...` 형태로 실행하세요.

### 1. 의존성 설치 및 개발 서버 실행
```powershell
cmd /c npm install
cmd /c npm run dev:circulation-sim
```
실행 후 브라우저에서 `http://localhost:3412` 로 접속합니다.

### 2. 단일 실행 파일(`dist/index.html`) 빌드 (오프라인 교실용)
```powershell
cmd /c npm run build
```
`vite-plugin-singlefile`을 통해 외부 CDN이나 서버 없이 동작하는 단일 파일 `dist/index.html`이 생성됩니다. 인터넷이 없는 교실 PC에서는 `dist/index.html`을 더블클릭해 바로 실행할 수 있습니다.

---

## Render (Static Site) 웹호스팅 배포 방법

이 저장소에는 Render 정적 사이트 배포 설정 파일인 [`render.yaml`](render.yaml)이 포함되어 있습니다.

### 방법 1: Blueprint (`render.yaml`) 자동 배포 (권장)
1. [Render Dashboard](https://dashboard.render.com/)에 로그인 후 **New +** → **Blueprint**를 선택합니다.
2. GitHub 저장소 `https://github.com/Kyumunhwang/circulation.git` (`main` 브랜치)를 연결합니다.
3. 저장소 루트의 `render.yaml`이 자동 인식되며 아래 설정으로 Static Site가 생성됩니다.
   - **Runtime**: `Static`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
   - **Rewrite Rule**: `/*` → `/index.html`
4. **Apply**를 클릭하면 빌드 후 고유 URL(`https://circulation-simulation.onrender.com` 등)로 즉시 웹호스팅됩니다.

### 방법 2: Manual Static Site 수동 생성
1. Render Dashboard에서 **New +** → **Static Site**를 선택하고 GitHub 저장소를 연결합니다.
2. 아래 항목을 입력합니다.
   - **Branch**: `main`
   - **Build Command**: `npm ci && npm run build`
   - **Publish Directory**: `dist`
3. **Redirects/Rewrites** 탭에서 Source `/*`, Destination `/index.html`, Action `Rewrite` 규칙을 추가한 뒤 **Create Static Site**를 클릭합니다.
