# ROCk 양궁기록장

학교 양궁부 학생들의 훈련 기록을 관리하는 React + Vite 기반 PWA 웹앱입니다.

## 주요 기능

- 학생 사진, 이름, 학년/반, 수상 경력 관리
- 거리별 훈련 기록 입력: 20m, 25m, 30m, 35m
- 세트별 점수 입력과 총점/평균 자동 계산
- 학생별 기록 상세, 성장 그래프
- 관리자 모드 전용 순위/비교, 기록 수정/삭제, 학생 카드 순서 변경
- localStorage 기반 데이터 저장
- PWA 설치 지원

## 로컬 실행

백엔드와 프론트 개발 서버를 각각 실행합니다.

터미널 1:

```bash
npm run dev:server
```

터미널 2:

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

빌드 결과물은 `dist/` 폴더에 생성됩니다.

## Render 배포

Render에서 GitHub 저장소를 연결한 뒤 Web Service로 배포합니다.

- Build Command: `npm ci && npm run build`
- Start Command: `npm start`

이 저장소에는 `render.yaml`이 포함되어 있어 Render Blueprint로도 배포할 수 있습니다.

현재 백엔드는 JSON 파일에 데이터를 저장합니다. Render 무료 환경에서는 재배포/재시작 때 파일 저장소가 유지되지 않을 수 있으므로, 실제 운영에서는 Render Disk 또는 PostgreSQL 같은 영구 저장소로 바꾸는 것을 권장합니다.

## GitHub Pages 배포

`.github/workflows/deploy.yml`이 포함되어 있습니다.

GitHub 저장소의 `Settings > Pages`에서 Source를 `GitHub Actions`로 설정하면 `main` 브랜치 push 시 자동 배포됩니다.

## PWA

`public/manifest.webmanifest`, `public/sw.js`, `public/icons/archery-icon.svg`가 포함되어 있습니다.

모바일 브라우저에서 배포 주소에 접속한 뒤 홈 화면에 추가하면 앱처럼 사용할 수 있습니다.
