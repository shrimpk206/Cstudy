/* =====================================================
   바이브 코딩 학습 — 모바일 웹앱
   ===================================================== */

/* ---------- 데이터: 레슨 매니페스트 ---------- */
const PHASES = [
  {
    id: 2,
    folder: 'phase2_어휘',
    title: 'Phase 2 — 어휘',
    description: '프로그래밍 단어 30+개를 10개 그룹으로',
    lessons: [
      { id: '01', file: '01_데이터를_담는_그릇.md', practiceFile: 'questions/phase2/01.json', title: '데이터를 담는 그릇', subtitle: '변수, 배열, 객체' },
      { id: '02', file: '02_동작을_묶는_단위.md', practiceFile: 'questions/phase2/02.json', title: '동작을 묶는 단위', subtitle: '함수, 인자, 반환값' },
      { id: '03', file: '03_흐름_제어.md', practiceFile: 'questions/phase2/03.json', title: '흐름 제어', subtitle: '조건문, 반복문, map/filter' },
      { id: '04', file: '04_타입과_널.md', practiceFile: 'questions/phase2/04.json', title: '타입과 널', subtitle: 'string, number, null, undefined' },
      { id: '05', file: '05_파일과_모듈.md', practiceFile: 'questions/phase2/05.json', title: '파일과 모듈', subtitle: 'import, export' },
      { id: '06', file: '06_라이브러리와_의존성.md', practiceFile: 'questions/phase2/06.json', title: '라이브러리와 의존성', subtitle: 'npm, pip, package.json' },
      { id: '07', file: '07_API와_HTTP.md', practiceFile: 'questions/phase2/07.json', title: 'API와 HTTP', subtitle: '요청, 응답, 상태코드' },
      { id: '08', file: '08_환경변수와_시크릿.md', practiceFile: 'questions/phase2/08.json', title: '환경변수와 시크릿', subtitle: '.env, API 키 보안' },
      { id: '09', file: '09_비동기.md', practiceFile: 'questions/phase2/09.json', title: '비동기', subtitle: 'async/await, Promise' },
      { id: '10', file: '10_클래스와_객체지향.md', practiceFile: 'questions/phase2/10.json', title: '클래스와 객체지향', subtitle: 'class, instance, this' },
    ],
  },
  {
    id: 3,
    folder: 'phase3_에러읽기',
    title: 'Phase 3 — 에러 읽기',
    description: 'AI에게 에러를 다시 던지는 법',
    lessons: [
      { id: '01', file: '01_에러메시지_구조.md', practiceFile: 'questions/phase3/01.json', title: '에러 메시지의 구조', subtitle: '스택 트레이스 읽기' },
      { id: '02', file: '02_자주나오는_에러5종.md', practiceFile: 'questions/phase3/02.json', title: '자주 나오는 에러 5종', subtitle: 'TypeError, Reference, Syntax…' },
      { id: '03', file: '03_AI에게_에러_다시_물어보기.md', practiceFile: 'questions/phase3/03.json', title: 'AI에게 에러 다시 물어보기', subtitle: '좋은 프롬프트 5요소' },
      { id: '04', file: '04_스스로_검색하는_법.md', practiceFile: 'questions/phase3/04.json', title: '스스로 검색하는 법', subtitle: '검색어 만드는 공식' },
    ],
  },
  {
    id: 4,
    folder: 'phase4_프롬프트엔지니어링',
    title: 'Phase 4 — 프롬프트 엔지니어링',
    description: '결과물 품질을 좌우하는 패턴',
    lessons: [
      { id: '01', file: '01_좋은_명세_쓰는_법.md', practiceFile: 'questions/phase4/01.json', title: '좋은 명세 쓰는 법', subtitle: '명세 7가지 요소' },
      { id: '02', file: '02_컨텍스트_제공.md', practiceFile: 'questions/phase4/02.json', title: '컨텍스트 제공', subtitle: '6종 컨텍스트' },
      { id: '03', file: '03_안될때_재시도_패턴.md', practiceFile: 'questions/phase4/03.json', title: '안 될 때 재시도 패턴', subtitle: '9가지 패턴' },
      { id: '04', file: '04_AI결과물_검수_체크리스트.md', practiceFile: 'questions/phase4/04.json', title: 'AI 결과물 검수', subtitle: '보안 / 버그 / 품질 / 성능' },
      { id: '05', file: '05_프로젝트_한바퀴_연습.md', practiceFile: 'questions/phase4/05.json', title: '프로젝트 한 바퀴', subtitle: '졸업 실습' },
    ],
  },
];

const SPECIAL = {
  cheatsheet: { folder: 'phase2_어휘', file: '어휘_치트시트.md', title: '어휘 치트시트' },
  readme: { folder: '', file: 'README.md', title: '시작 가이드' },
  progress_md: { folder: '', file: '진도표.md', title: '진도표 원본' },
};

/* ---------- 진도 (localStorage) ---------- */
const PROGRESS_KEY = 'vibecoding_progress_v1';
const GAMESTATE_KEY = 'vibecoding_gamestate_v1';
const THEME_KEY = 'vibecoding_theme_v1';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}
function setLessonDone(phaseId, lessonId, done) {
  const p = getProgress();
  const key = `${phaseId}/${lessonId}`;
  if (done) p[key] = true;
  else delete p[key];
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
}
function isLessonDone(phaseId, lessonId) {
  return Boolean(getProgress()[`${phaseId}/${lessonId}`]);
}

/* ---------- 게임 상태 (XP, 스트릭, 레슨 상태) ---------- */
function getGameState() {
  try {
    const raw = JSON.parse(localStorage.getItem(GAMESTATE_KEY) || '{}');
    return {
      xp: raw.xp || 0,
      streakCount: raw.streakCount || 0,
      streakLastDay: raw.streakLastDay || null,
      streakFreezeUsedThisWeek: raw.streakFreezeUsedThisWeek || false,
      freezeWeekStart: raw.freezeWeekStart || null,
      perLesson: raw.perLesson || {},
      perQuestion: raw.perQuestion || {},
    };
  } catch {
    return { xp: 0, streakCount: 0, streakLastDay: null, streakFreezeUsedThisWeek: false, freezeWeekStart: null, perLesson: {}, perQuestion: {} };
  }
}
function saveGameState(s) {
  localStorage.setItem(GAMESTATE_KEY, JSON.stringify(s));
}
function todayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function daysBetween(a, b) {
  if (!a || !b) return Infinity;
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db - da) / (1000 * 60 * 60 * 24));
}
function weekStartISO(iso) {
  if (!iso) return todayISO();
  const d = new Date(iso + 'T00:00:00');
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function addXp(n) {
  const s = getGameState();
  s.xp = (s.xp || 0) + n;
  saveGameState(s);
}
function bumpStreak() {
  const s = getGameState();
  const today = todayISO();
  if (s.streakLastDay === today) {
    saveGameState(s);
    return s.streakCount;
  }
  // 주차 갱신 시 동결권 리셋
  const thisWeek = weekStartISO(today);
  if (s.freezeWeekStart !== thisWeek) {
    s.freezeWeekStart = thisWeek;
    s.streakFreezeUsedThisWeek = false;
  }
  const gap = daysBetween(s.streakLastDay, today);
  if (s.streakLastDay === null) {
    s.streakCount = 1;
  } else if (gap === 1) {
    s.streakCount = (s.streakCount || 0) + 1;
  } else if (gap === 2 && !s.streakFreezeUsedThisWeek) {
    // 1일 빠짐 → 동결권 사용
    s.streakFreezeUsedThisWeek = true;
    s.streakCount = (s.streakCount || 0) + 1;
  } else {
    s.streakCount = 1;
  }
  s.streakLastDay = today;
  saveGameState(s);
  return s.streakCount;
}
function markLessonState(phaseId, lessonId, state) {
  // state: 'read' | 'passed' | 'perfect'
  const s = getGameState();
  const key = `${phaseId}/${lessonId}`;
  const existing = s.perLesson[key] || {};
  // 승격만 허용 (read < passed < perfect). 강등은 무시.
  const order = { read: 1, passed: 2, perfect: 3 };
  const newOrder = order[state] || 0;
  const oldOrder = order[existing.state] || 0;
  s.perLesson[key] = {
    ...existing,
    state: newOrder >= oldOrder ? state : existing.state,
    attempts: (existing.attempts || 0) + 1,
    lastAt: Date.now(),
  };
  saveGameState(s);
}
function getLessonState(phaseId, lessonId) {
  const s = getGameState();
  const entry = s.perLesson[`${phaseId}/${lessonId}`];
  if (entry && entry.state) return entry.state;
  // 폴백: 옛 진도 시스템에서 읽음 상태였는지 확인
  if (isLessonDone(phaseId, lessonId)) return 'read';
  return null;
}
function phaseProgress(phase) {
  let done = 0, perfect = 0;
  for (const l of phase.lessons) {
    const st = getLessonState(phase.id, l.id);
    if (st) done++;
    if (st === 'perfect') perfect++;
  }
  return { done, perfect, total: phase.lessons.length };
}
function totalProgress() {
  let done = 0, total = 0, perfect = 0;
  for (const p of PHASES) {
    total += p.lessons.length;
    const pp = phaseProgress(p);
    done += pp.done;
    perfect += pp.perfect;
  }
  return { done, perfect, total };
}

/* ---------- 테마 ---------- */
function applyTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#fafafa');
    document.getElementById('theme-btn').textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0f0f10');
    document.getElementById('theme-btn').textContent = '🌙';
  }
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved);
}
function toggleTheme() {
  const current = localStorage.getItem(THEME_KEY) || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

/* ---------- 라우터 ---------- */
function parseRoute() {
  const hash = (location.hash || '').replace(/^#/, '') || '/';
  if (hash === '/' || hash === '') return { name: 'home' };
  if (hash === '/cheatsheet') return { name: 'special', key: 'cheatsheet' };
  if (hash === '/readme') return { name: 'special', key: 'readme' };
  if (hash === '/progress') return { name: 'progress' };

  const phase = hash.match(/^\/phase\/(\d+)$/);
  if (phase) return { name: 'phase', phaseId: parseInt(phase[1], 10) };

  const lesson = hash.match(/^\/lesson\/(\d+)\/([^/]+)$/);
  if (lesson) return { name: 'lesson', phaseId: parseInt(lesson[1], 10), lessonId: lesson[2] };

  const practice = hash.match(/^\/practice\/(\d+)\/([^/]+)$/);
  if (practice) return { name: 'practice', phaseId: parseInt(practice[1], 10), lessonId: practice[2] };

  return { name: 'home' };
}
function navigate(hash) {
  location.hash = hash;
}

/* ---------- 마크다운 로딩 ---------- */
const MD_CACHE = new Map();

async function loadMarkdown(folder, file) {
  const path = folder ? `${folder}/${file}` : file;
  if (MD_CACHE.has(path)) return MD_CACHE.get(path);

  const url = path.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(url);
  if (!res.ok) throw new Error(`못 가져옴: ${path} (${res.status})`);
  const text = await res.text();
  MD_CACHE.set(path, text);
  return text;
}

function renderMarkdown(md) {
  const html = marked.parse(md, {
    breaks: false,
    gfm: true,
  });
  return html;
}

function highlightCode(container) {
  if (!window.hljs) return;
  container.querySelectorAll('pre code').forEach((block) => {
    try {
      hljs.highlightElement(block);
    } catch {}
  });
}

/* ---------- 헤더 / 네비 업데이트 ---------- */
function setHeader(title, showBack) {
  document.getElementById('page-title').textContent = title;
  document.getElementById('back-btn').hidden = !showBack;
}

function updateBottomNav(routeName) {
  document.querySelectorAll('#bottom-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === routeName);
  });
}

/* ---------- 화면: 홈 ---------- */
const MASCOT_LINES = [
  '오늘도 한 레슨 어때요?',
  '5분이면 충분해요 🌱',
  '한 문제씩, 천천히',
  '어제보다 한 단어 더',
  '못 풀어도 괜찮아요',
];

function loadMascotSvgInline() {
  // 마스코트는 페이지마다 inline SVG를 사용하기 위해 fetch
  return fetch('mascot.svg').then(r => r.text()).catch(() => '');
}
let MASCOT_SVG_CACHE = '';
async function ensureMascot() {
  if (MASCOT_SVG_CACHE) return MASCOT_SVG_CACHE;
  MASCOT_SVG_CACHE = await loadMascotSvgInline();
  return MASCOT_SVG_CACHE;
}

function renderHome() {
  const tot = totalProgress();
  const game = getGameState();
  const mascotLine = MASCOT_LINES[Math.floor(Math.random() * MASCOT_LINES.length)];
  const phaseCards = PHASES.map((phase) => {
    const { done, perfect, total } = phaseProgress(phase);
    const pct = total ? Math.round((done / total) * 100) : 0;
    return `
      <a class="phase-card" href="#/phase/${phase.id}">
        <div class="phase-card-title">${phase.title}</div>
        <div class="phase-card-desc">${phase.description}</div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-text">${done} / ${total} 완료${perfect > 0 ? ` · ★ ${perfect}` : ''}</div>
      </a>
    `;
  }).join('');

  return `
    <div class="gamebar">
      <div class="gamebar-stat streak"><span>🔥</span><span class="num">${game.streakCount || 0}</span></div>
      <div class="gamebar-stat xp"><span>⭐</span><span class="num">${game.xp || 0}</span></div>
      <div class="gamebar-mascot" id="home-mascot"></div>
    </div>
    <div class="mascot-bubble">
      <div id="home-mascot-bubble"></div>
      <div>${mascotLine}</div>
    </div>
    <div class="welcome">
      <h2>안녕하세요 👋</h2>
      <p>전체 진도 ${tot.done} / ${tot.total}${tot.perfect ? ` · ★ ${tot.perfect}개 완벽` : ''}</p>
    </div>
    ${phaseCards}
    <div class="home-section-title">자료</div>
    <a class="quick-link" href="#/cheatsheet">
      <span class="quick-link-icon">📖</span>
      <div>
        <div>어휘 치트시트</div>
        <div style="font-size:12px;color:var(--text-dim)">단어 빠르게 검색</div>
      </div>
      <span class="quick-link-arrow">›</span>
    </a>
    <a class="quick-link" href="#/readme">
      <span class="quick-link-icon">🧭</span>
      <div>
        <div>시작 가이드</div>
        <div style="font-size:12px;color:var(--text-dim)">README — 프로그램 개요</div>
      </div>
      <span class="quick-link-arrow">›</span>
    </a>
    <a class="quick-link" href="#/progress">
      <span class="quick-link-icon">✓</span>
      <div>
        <div>진도 / 졸업 시험</div>
        <div style="font-size:12px;color:var(--text-dim)">전체 체크리스트 + 5문항</div>
      </div>
      <span class="quick-link-arrow">›</span>
    </a>
  `;
}

/* ---------- 화면: Phase ---------- */
function renderPhase(phaseId) {
  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return `<div class="state-msg">Phase를 찾을 수 없어요.</div>`;
  const { done, total } = phaseProgress(phase);
  const pct = total ? Math.round((done / total) * 100) : 0;

  const items = phase.lessons.map((l) => {
    const st = getLessonState(phase.id, l.id);
    const stateClass = st || '';
    return `
      <a class="lesson-item" href="#/lesson/${phase.id}/${l.id}">
        <div class="lesson-check ${stateClass}"></div>
        <div class="lesson-text">
          <div class="lesson-title">${l.title}</div>
          <div class="lesson-subtitle">${l.subtitle}</div>
        </div>
        <span class="lesson-arrow">›</span>
      </a>
    `;
  }).join('');

  const { perfect } = phaseProgress(phase);
  return `
    <div class="welcome">
      <h2>${phase.title}</h2>
      <p>${phase.description}</p>
      <div class="progress-bar" style="margin-top:14px"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="progress-text">${done} / ${total} 완료${perfect ? ` · ★ ${perfect}개 완벽` : ''}</div>
    </div>
    ${items}
  `;
}

/* ---------- 화면: 레슨 ---------- */
async function renderLesson(phaseId, lessonId) {
  const phase = PHASES.find((p) => p.id === phaseId);
  if (!phase) return `<div class="state-msg">Phase 못 찾음</div>`;
  const idx = phase.lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return `<div class="state-msg">레슨 못 찾음</div>`;
  const lesson = phase.lessons[idx];

  let md;
  try {
    md = await loadMarkdown(phase.folder, lesson.file);
  } catch (e) {
    return `<div class="state-msg">파일을 불러오지 못했어요.<br><small>${e.message}</small></div>`;
  }

  const html = renderMarkdown(md);
  const lessonState = getLessonState(phase.id, lesson.id);
  const hasPractice = !!lesson.practiceFile;

  // 이전/다음 버튼 (Phase 내에서만)
  const prev = phase.lessons[idx - 1];
  const next = phase.lessons[idx + 1];

  const prevBtn = prev
    ? `<a class="lesson-nav-btn" href="#/lesson/${phase.id}/${prev.id}">
         <div class="lesson-nav-label">← 이전</div>
         <div class="lesson-nav-title">${prev.title}</div>
       </a>`
    : `<div class="lesson-nav-btn disabled"><div class="lesson-nav-label">처음</div></div>`;

  const nextBtn = next
    ? `<a class="lesson-nav-btn next" href="#/lesson/${phase.id}/${next.id}">
         <div class="lesson-nav-label">다음 →</div>
         <div class="lesson-nav-title">${next.title}</div>
       </a>`
    : `<div class="lesson-nav-btn next disabled"><div class="lesson-nav-label">끝</div></div>`;

  // 연습 시작 CTA / 상태 라벨
  let practiceLabel = '🎯 연습 시작 (5문제)';
  if (lessonState === 'passed') practiceLabel = '✓ 통과됨 — 다시 풀기';
  else if (lessonState === 'perfect') practiceLabel = '★ 완벽! 다시 풀기';

  const practiceBtn = hasPractice
    ? `<a class="practice-cta" href="#/practice/${phase.id}/${lesson.id}">${practiceLabel}</a>`
    : `<button class="practice-cta" disabled>🎯 연습 곧 나와요</button>`;

  const skipLink = hasPractice
    ? `<a class="practice-skip" href="#/practice/${phase.id}/${lesson.id}">→ 건너뛰고 바로 연습</a>`
    : '';

  return `
    ${skipLink}
    <article class="lesson-content">${html}</article>
    <div class="lesson-footer">
      ${practiceBtn}
      <a class="practice-cta-secondary" href="#" id="mark-read-link">📖 읽기만 완료 표시</a>
      <div class="lesson-nav">
        ${prevBtn}
        ${nextBtn}
      </div>
    </div>
  `;
}

/* ---------- 화면: 진도 ---------- */
function renderProgress() {
  const tot = totalProgress();
  const pct = tot.total ? Math.round((tot.done / tot.total) * 100) : 0;
  const game = getGameState();

  const sections = PHASES.map((phase) => {
    const items = phase.lessons.map((l) => {
      const st = getLessonState(phase.id, l.id);
      const stateClass = st || '';
      return `
        <a class="lesson-item" href="#/lesson/${phase.id}/${l.id}">
          <div class="lesson-check ${stateClass}"></div>
          <div class="lesson-text">
            <div class="lesson-title">${l.title}</div>
            <div class="lesson-subtitle">${l.subtitle}</div>
          </div>
        </a>
      `;
    }).join('');
    return `
      <div class="home-section-title">${phase.title}</div>
      ${items}
    `;
  }).join('');

  return `
    <div class="gamebar">
      <div class="gamebar-stat streak"><span>🔥</span><span class="num">${game.streakCount || 0}</span></div>
      <div class="gamebar-stat xp"><span>⭐</span><span class="num">${game.xp || 0}</span></div>
      <div class="gamebar-mascot"></div>
    </div>
    <div class="progress-summary">
      <div class="progress-summary-num">${tot.done} <span style="font-size:18px;color:var(--text-dim)">/ ${tot.total}</span></div>
      <div class="progress-summary-label">${pct}% 완료${tot.perfect ? ` · ★ ${tot.perfect}개 완벽` : ''}</div>
      <div class="progress-bar" style="margin-top:12px"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>

    ${sections}

    <div class="home-section-title">졸업 시험</div>
    <div class="quick-link" style="display:block">
      <ol style="margin:0;padding-left:20px;line-height:1.7;font-size:14px">
        <li>AI가 만든 50줄짜리 JS 코드에서 변수/함수/조건문/반복문을 짚을 수 있다.</li>
        <li><code style="font-size:12px">TypeError: Cannot read property 'x' of undefined</code>를 한 줄로 설명할 수 있다.</li>
        <li>AI가 "환경변수 추가하세요" 했을 때 어떤 파일에 어떤 형식으로 넣는지 안다.</li>
        <li>새 프로젝트 명세를 200자 이상으로, 성공 조건 포함해서 쓸 수 있다.</li>
        <li>AI 결과물이 마음에 안 들 때 "다시 해줘" 대신 구체적으로 짚어 요청할 수 있다.</li>
      </ol>
    </div>

    <button class="reset-btn" id="reset-btn">진도 초기화</button>
  `;
}

/* ---------- 화면: 특수 (치트시트 / README) ---------- */
async function renderSpecial(key) {
  const item = SPECIAL[key];
  if (!item) return `<div class="state-msg">못 찾음</div>`;
  let md;
  try {
    md = await loadMarkdown(item.folder, item.file);
  } catch (e) {
    return `<div class="state-msg">파일을 불러오지 못했어요.<br><small>${e.message}</small></div>`;
  }
  return `<article class="lesson-content">${renderMarkdown(md)}</article>`;
}

/* ---------- 마스코트 inject ---------- */
function injectMascots() {
  if (!MASCOT_SVG_CACHE) return;
  document.querySelectorAll('.gamebar-mascot, #home-mascot-bubble').forEach((el) => {
    if (!el.dataset.mascotLoaded) {
      el.innerHTML = MASCOT_SVG_CACHE;
      el.dataset.mascotLoaded = '1';
    }
  });
}

/* ---------- 라우팅 디스패치 ---------- */
async function render() {
  const route = parseRoute();

  // 연습 모드는 별도 처리 — practice.js에 위임
  if (route.name === 'practice') {
    if (window.Practice && window.Practice.start) {
      await window.Practice.start(route.phaseId, route.lessonId);
      return;
    }
  }

  // 다른 라우트로 이동 시 연습 화면 정리
  if (window.Practice && window.Practice.isActive && window.Practice.isActive()) {
    window.Practice.close();
  }

  const main = document.getElementById('app-content');
  main.innerHTML = `<div class="state-msg">불러오는 중…</div>`;

  let html = '';
  let title = '바이브 코딩 학습';
  let showBack = false;
  let navName = 'home';

  switch (route.name) {
    case 'home':
      title = '바이브 코딩 학습';
      html = renderHome();
      navName = 'home';
      break;

    case 'phase': {
      const phase = PHASES.find((p) => p.id === route.phaseId);
      title = phase ? phase.title : 'Phase';
      showBack = true;
      html = renderPhase(route.phaseId);
      navName = 'home';
      break;
    }

    case 'lesson': {
      const phase = PHASES.find((p) => p.id === route.phaseId);
      const lesson = phase?.lessons.find((l) => l.id === route.lessonId);
      title = lesson ? lesson.title : '레슨';
      showBack = true;
      html = await renderLesson(route.phaseId, route.lessonId);
      navName = 'home';
      break;
    }

    case 'progress':
      title = '진도';
      html = renderProgress();
      navName = 'progress';
      break;

    case 'special':
      title = SPECIAL[route.key]?.title || '';
      showBack = true;
      html = await renderSpecial(route.key);
      navName = route.key === 'cheatsheet' ? 'cheatsheet' : 'home';
      break;
  }

  setHeader(title, showBack);
  updateBottomNav(navName);

  main.innerHTML = html;
  highlightCode(main);
  injectMascots();
  main.scrollTop = 0;
  window.scrollTo(0, 0);

  // 레슨: 읽음 표시 링크
  const markReadLink = document.getElementById('mark-read-link');
  if (markReadLink && route.name === 'lesson') {
    markReadLink.addEventListener('click', (e) => {
      e.preventDefault();
      const cur = isLessonDone(route.phaseId, route.lessonId);
      setLessonDone(route.phaseId, route.lessonId, !cur);
      // 게임상태에도 read 마킹
      if (!cur) markLessonState(route.phaseId, route.lessonId, 'read');
      render();
    });
  }

  // 진도: 초기화 버튼 (게임상태 함께 초기화)
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('진도와 XP/스트릭을 모두 초기화할까요?')) {
        localStorage.removeItem(PROGRESS_KEY);
        localStorage.removeItem(GAMESTATE_KEY);
        render();
      }
    });
  }
}

/* ---------- 초기화 ---------- */
async function init() {
  initTheme();
  await ensureMascot();

  document.getElementById('back-btn').addEventListener('click', () => {
    if (history.length > 1) history.back();
    else navigate('/');
  });
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);

  window.addEventListener('hashchange', render);

  // marked 옵션
  if (window.marked) {
    marked.setOptions({ gfm: true, breaks: false });
  }

  // 외부에서 사용
  window.App = {
    render,
    addXp,
    bumpStreak,
    markLessonState,
    getGameState,
    getMascot: () => MASCOT_SVG_CACHE,
    PHASES,
    navigate,
  };

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
