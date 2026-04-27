# 바이브 코딩 학습 프로그램

> AI에게 정확하게 지시하고, AI가 만든 코드를 검수하기 위한 최소 코딩 지식.
> 정통 개발자 양성 코스가 아닙니다.

## 이 프로그램의 목표

**못하게 만드는 것:**
- 변수, 함수, API, 비동기 같은 단어를 들을 때 머릿속이 하얘지지 않게
- AI가 만든 코드를 보고 "여긴 데이터를 담는 부분, 여긴 외부에 요청 보내는 부분"이라고 구분할 수 있게
- 에러가 났을 때 무작정 "안 돼"라고만 하지 않고, 에러 메시지를 AI에게 도움이 되는 형태로 다시 던질 수 있게
- 처음부터 명세를 잘 적어서 AI가 헛다리 짚지 않게

**의도적으로 안 다루는 것:**
- 직접 모든 코드를 짜는 능력
- 학술적으로 완벽한 정의
- Phase 1(파일/터미널/Git 기초) — 이미 익숙하시다고 하셔서 생략

## 진행 방식

- 순서대로 안 봐도 됩니다. 그날 만나는 개념을 골라서 보세요.
- 각 파일은 5~10분 안에 다 읽힙니다.
- 모든 파일 끝에 **자가점검 질문**이 있습니다. 답이 막히면 그 부분만 다시 읽으세요.

## 폴더 구조

```
codingstudy/
├── README.md                  ← 지금 보는 파일
├── 진도표.md                   ← 체크하면서 진행
├── phase2_어휘/                ← 프로그래밍 단어 30개를 10개 그룹으로
├── phase3_에러읽기/            ← AI에게 에러를 다시 물어보는 법
├── phase4_프롬프트엔지니어링/  ← 결과물 품질을 좌우하는 프롬프트 패턴
│
├── index.html                 ← 모바일 웹앱 (GitHub Pages로 배포)
├── style.css
├── app.js
├── manifest.json              ← PWA (홈 화면에 설치 가능)
├── icon.svg
├── icon-maskable.svg
└── .nojekyll                  ← GitHub Pages가 Jekyll 처리 안 하게
```

## 권장 순서 (강제 아님)

1. `phase2_어휘/01_데이터를_담는_그릇.md`부터 순서대로 한 번 훑기 (총 10개)
2. `phase2_어휘/어휘_치트시트.md`를 옆에 두고 vibe coding 하면서 모르는 단어 나오면 즉시 검색
3. 에러를 만나면 `phase3_에러읽기/`로
4. 새 프로젝트를 시작할 때마다 `phase4_프롬프트엔지니어링/01_좋은_명세_쓰는_법.md` 다시 읽기

## 예제 언어

- 웹/앱: **JavaScript** (Cursor, Claude Code, ChatGPT가 기본으로 잘 다루는 언어)
- 자동화/데이터: **Python**
- 두 언어를 다 외울 필요는 없습니다. **공통 개념**만 알면 됩니다.

---

## 모바일 앱 (GitHub Pages 배포)

이 폴더 자체가 정적 웹앱입니다. 모바일 폰에서 학습할 수 있게 만들었습니다.

### 로컬에서 미리 보기

`file://`로 열면 fetch가 막혀서 안 됩니다. 간단한 로컬 서버 한 줄:

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# 그 다음 브라우저에서 http://localhost:8000 열기
```

### GitHub Pages 배포 — 처음 한 번만

1. GitHub에서 새 저장소 만들기 (예: `codingstudy`, public)
2. 이 폴더에서:
   ```bash
   git init
   git add .
   git commit -m "first"
   git branch -M main
   git remote add origin https://github.com/<유저명>/codingstudy.git
   git push -u origin main
   ```
3. GitHub 저장소 페이지 → Settings → Pages
4. **Source**: Deploy from a branch
5. **Branch**: `main` / `/ (root)` 선택 → Save
6. 1~2분 기다리면 `https://<유저명>.github.io/codingstudy/` 가 활성화

### 그 후 자료 수정/추가

`.md` 파일 수정 후:
```bash
git add .
git commit -m "update lesson"
git push
```
1분쯤 후 자동 반영됩니다.

### 폰에 홈 화면 아이콘으로 설치 (PWA)

1. 위 URL을 모바일 크롬/사파리에서 열기
2. 메뉴 → "홈 화면에 추가" (Add to Home Screen)
3. 앱처럼 전체 화면으로 실행됨. 진도는 폰 안에 저장됨

### 진도 데이터

- 브라우저 localStorage에 저장 (폰 별로 따로)
- 데이터 옮기고 싶으면: 진도 화면 가서 수동으로 다시 체크 (단순함을 위해 동기화는 빼둠)
- 초기화: 진도 화면 하단 "진도 초기화" 버튼
