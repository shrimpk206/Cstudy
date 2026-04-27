/* =====================================================
   바이브 코딩 학습 — 연습 엔진 (Duolingo 스타일)
   ===================================================== */

(function () {
  let state = null; // 활성 세션. null = 비활성

  /* ---------- 캐시 ---------- */
  const Q_CACHE = new Map();

  async function loadQuestions(path) {
    if (Q_CACHE.has(path)) return Q_CACHE.get(path);
    const url = path.split('/').map(encodeURIComponent).join('/');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`연습 파일 못 불러옴 (${res.status})`);
    const data = await res.json();
    Q_CACHE.set(path, data);
    return data;
  }

  /* ---------- 유틸 ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function shuffleIndices(n) {
    const a = Array.from({ length: n }, (_, i) => i);
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch {}
  }

  /* ---------- 시작 / 종료 ---------- */
  async function start(phaseId, lessonId) {
    const phase = window.App.PHASES.find((p) => p.id === phaseId);
    const lesson = phase?.lessons.find((l) => l.id === lessonId);
    if (!phase || !lesson) {
      alert('레슨을 찾지 못했어요');
      window.App.navigate('/');
      return;
    }
    if (!lesson.practiceFile) {
      alert('이 레슨은 연습 문제가 아직 없어요');
      window.App.navigate(`/lesson/${phaseId}/${lessonId}`);
      return;
    }

    state = {
      phase, lesson, phaseId, lessonId,
      questions: [],
      current: 0,
      answeredCorrect: [],
      firstTryCorrect: 0,
      answers: [],
      phase_state: 'loading',
    };

    showScreen();
    renderLoading();

    try {
      const data = await loadQuestions(lesson.practiceFile);
      // 방어적: exercises 검증
      const valid = (data.exercises || []).filter(validateExercise);
      if (valid.length === 0) throw new Error('유효한 문제가 없어요');
      state.questions = valid;
      state.phase_state = 'asking';
      renderCurrent();
    } catch (err) {
      console.error('[practice] load failed', err);
      renderError(err.message || '문제를 불러오지 못했어요');
    }
  }

  function close() {
    state = null;
    const screen = document.getElementById('practice-screen');
    if (screen) screen.remove();
    // 헤더/네비 다시 보이게 (비활성화 시 다시 표시)
  }

  function isActive() {
    return state !== null;
  }

  function validateExercise(ex) {
    if (!ex || !ex.id || !ex.type || !ex.prompt) return false;
    const required = {
      mcq: ['choices', 'answer'],
      wordbank: ['bank', 'answer'],
      reorder: ['lines', 'answer'],
      bugspot: ['code', 'answer'],
      rubric: ['items'],
    };
    const req = required[ex.type];
    if (!req) return false;
    return req.every((k) => ex[k] !== undefined);
  }

  /* ---------- 화면 셸 ---------- */
  function showScreen() {
    let screen = document.getElementById('practice-screen');
    if (screen) screen.remove();
    screen = document.createElement('div');
    screen.id = 'practice-screen';
    screen.className = 'practice-screen';
    screen.innerHTML = `
      <div class="practice-header">
        <button class="practice-close" id="practice-close" aria-label="닫기">✕</button>
        <div class="practice-progress" id="practice-progress"></div>
        <div class="practice-counter" id="practice-counter"></div>
      </div>
      <div class="practice-body" id="practice-body"></div>
      <div class="practice-actions" id="practice-actions"></div>
    `;
    document.body.appendChild(screen);
    document.getElementById('practice-close').addEventListener('click', () => {
      if (state && state.phase_state === 'asking' && state.current > 0) {
        if (!confirm('연습을 그만둘까요? 진행은 저장되지 않아요.')) return;
      }
      close();
      window.App.navigate(`/lesson/${state ? state.phaseId : ''}/${state ? state.lessonId : ''}`);
    });
  }

  function renderLoading() {
    document.getElementById('practice-body').innerHTML = '<div class="state-msg">불러오는 중…</div>';
    document.getElementById('practice-actions').innerHTML = '';
  }

  function renderError(msg) {
    document.getElementById('practice-body').innerHTML = `
      <div class="state-msg">
        <p>${escapeHtml(msg)}</p>
      </div>
    `;
    document.getElementById('practice-actions').innerHTML = `
      <button class="practice-action-btn primary" id="back-to-lesson">레슨으로 돌아가기</button>
    `;
    document.getElementById('back-to-lesson').addEventListener('click', () => {
      const pid = state.phaseId, lid = state.lessonId;
      close();
      window.App.navigate(`/lesson/${pid}/${lid}`);
    });
  }

  /* ---------- 진행도 ---------- */
  function renderProgressBar() {
    const total = state.questions.length;
    const segs = [];
    for (let i = 0; i < total; i++) {
      let cls = '';
      if (i < state.current) cls = state.answeredCorrect[i] ? 'done' : 'wrong';
      else if (i === state.current) cls = 'current';
      segs.push(`<div class="practice-progress-seg ${cls}"></div>`);
    }
    document.getElementById('practice-progress').innerHTML = segs.join('');
    document.getElementById('practice-counter').textContent = `${state.current + 1} / ${total}`;
  }

  /* ---------- 현재 문제 렌더 ---------- */
  function renderCurrent() {
    if (state.current >= state.questions.length) {
      finish();
      return;
    }
    renderProgressBar();
    const ex = state.questions[state.current];
    const body = document.getElementById('practice-body');
    const actions = document.getElementById('practice-actions');

    const promptHtml = window.marked ? marked.parse(ex.prompt) : `<p>${escapeHtml(ex.prompt)}</p>`;
    const scenarioHtml = ex.scenario
      ? `<div class="practice-scenario">${escapeHtml(ex.scenario)}</div>`
      : '';

    let questionHtml = '';
    let validate = null;
    let isReady = () => false;

    switch (ex.type) {
      case 'mcq': ({ html: questionHtml, validate, isReady } = renderMcq(ex)); break;
      case 'wordbank': ({ html: questionHtml, validate, isReady } = renderWordbank(ex)); break;
      case 'reorder': ({ html: questionHtml, validate, isReady } = renderReorder(ex)); break;
      case 'bugspot': ({ html: questionHtml, validate, isReady } = renderBugspot(ex)); break;
      case 'rubric': ({ html: questionHtml, validate, isReady } = renderRubric(ex)); break;
      default:
        console.warn('[practice] unknown type, skipping', ex.type);
        state.current++;
        renderCurrent();
        return;
    }

    body.innerHTML = `
      <div class="practice-prompt">${promptHtml}</div>
      ${scenarioHtml}
      ${questionHtml}
    `;
    actions.innerHTML = `
      <button class="practice-action-btn primary" id="check-btn" disabled>정답 확인</button>
    `;
    if (window.hljs) {
      body.querySelectorAll('pre code').forEach((b) => { try { hljs.highlightElement(b); } catch {} });
    }

    // 인터랙션 바인딩 (각 렌더러가 setup)
    const checkBtn = document.getElementById('check-btn');
    const updateReady = () => {
      checkBtn.disabled = !isReady();
    };
    bindCurrent(ex.type, ex, updateReady);

    checkBtn.addEventListener('click', () => {
      const correct = validate();
      handleAnswer(ex, correct);
    });
  }

  /* ---------- 인터랙션 바인딩 ---------- */
  function bindCurrent(type, ex, updateReady) {
    if (type === 'mcq') {
      document.querySelectorAll('.practice-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
          if (chip.classList.contains('disabled')) return;
          document.querySelectorAll('.practice-chip').forEach((c) => c.classList.remove('selected'));
          chip.classList.add('selected');
          updateReady();
        });
      });
    } else if (type === 'wordbank') {
      // 토큰 클릭 → 다음 빈칸에 채움 / 빈칸 클릭 → 비움
      document.querySelectorAll('.wordbank-token').forEach((tok) => {
        tok.addEventListener('click', () => {
          if (tok.classList.contains('used')) return;
          // 다음 빈 칸 찾기
          const blanks = document.querySelectorAll('.wordbank-blank');
          for (const b of blanks) {
            if (!b.classList.contains('filled')) {
              b.textContent = tok.textContent;
              b.dataset.tokenIdx = tok.dataset.idx;
              b.classList.add('filled');
              tok.classList.add('used');
              break;
            }
          }
          updateReady();
        });
      });
      document.querySelectorAll('.wordbank-blank').forEach((b) => {
        b.addEventListener('click', () => {
          if (!b.classList.contains('filled')) return;
          const idx = b.dataset.tokenIdx;
          const tok = document.querySelector(`.wordbank-token[data-idx="${idx}"]`);
          if (tok) tok.classList.remove('used');
          b.textContent = '___';
          b.classList.remove('filled');
          delete b.dataset.tokenIdx;
          updateReady();
        });
      });
    } else if (type === 'reorder') {
      document.querySelectorAll('.reorder-btn[data-dir]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const list = document.getElementById('reorder-list');
          const item = btn.closest('.reorder-item');
          const dir = btn.dataset.dir;
          if (dir === 'up' && item.previousElementSibling) {
            list.insertBefore(item, item.previousElementSibling);
          } else if (dir === 'down' && item.nextElementSibling) {
            list.insertBefore(item.nextElementSibling, item);
          }
          updateButtons();
          updateReady();
        });
      });
      function updateButtons() {
        const items = document.querySelectorAll('.reorder-item');
        items.forEach((it, i) => {
          it.querySelector('[data-dir="up"]').disabled = i === 0;
          it.querySelector('[data-dir="down"]').disabled = i === items.length - 1;
        });
      }
      updateButtons();
    } else if (type === 'bugspot') {
      document.querySelectorAll('.bugspot-line').forEach((line) => {
        line.addEventListener('click', () => {
          if (line.classList.contains('disabled')) return;
          document.querySelectorAll('.bugspot-line').forEach((l) => l.classList.remove('selected'));
          line.classList.add('selected');
          updateReady();
        });
      });
    } else if (type === 'rubric') {
      document.querySelectorAll('.rubric-item').forEach((item) => {
        item.addEventListener('click', () => {
          if (item.classList.contains('disabled')) return;
          item.classList.toggle('selected');
          const cb = item.querySelector('.rubric-checkbox');
          cb.textContent = item.classList.contains('selected') ? '✓' : '';
          updateReady();
        });
      });
    }
  }

  /* ---------- 렌더러: MCQ ---------- */
  function renderMcq(ex) {
    const order = shuffleIndices(ex.choices.length);
    const html = `
      <div class="practice-chips">
        ${order.map((origIdx) => `
          <button class="practice-chip" data-orig="${origIdx}">
            <span>${escapeHtml(ex.choices[origIdx])}</span>
          </button>
        `).join('')}
      </div>
    `;
    const isReady = () => !!document.querySelector('.practice-chip.selected');
    const validate = () => {
      const sel = document.querySelector('.practice-chip.selected');
      if (!sel) return false;
      const orig = parseInt(sel.dataset.orig, 10);
      const correct = orig === ex.answer;
      // 정/오답 시각화
      document.querySelectorAll('.practice-chip').forEach((c) => {
        c.classList.add('disabled');
        const idx = parseInt(c.dataset.orig, 10);
        if (idx === ex.answer) {
          c.classList.add('correct');
          c.insertAdjacentHTML('beforeend', '<span class="practice-chip-mark ok">✓</span>');
        } else if (c === sel && !correct) {
          c.classList.add('wrong');
          c.insertAdjacentHTML('beforeend', '<span class="practice-chip-mark no">✗</span>');
        }
      });
      return correct;
    };
    return { html, validate, isReady };
  }

  /* ---------- 렌더러: Wordbank ---------- */
  function renderWordbank(ex) {
    const blanks = ex.blanks || (Array.isArray(ex.answer) ? ex.answer.length : 1);
    const order = shuffleIndices(ex.bank.length);
    const html = `
      <div class="wordbank-blanks" id="wordbank-blanks">
        ${Array.from({ length: blanks }, () => `<div class="wordbank-blank">___</div>`).join('')}
      </div>
      <div class="wordbank-pool">
        ${order.map((origIdx) => `
          <button class="wordbank-token" data-idx="${origIdx}">${escapeHtml(ex.bank[origIdx])}</button>
        `).join('')}
      </div>
    `;
    const isReady = () => {
      const filled = document.querySelectorAll('.wordbank-blank.filled').length;
      return filled === blanks;
    };
    const validate = () => {
      const filled = Array.from(document.querySelectorAll('.wordbank-blank')).map((b) => b.textContent.trim());
      const expected = Array.isArray(ex.answer) ? ex.answer : [ex.answer];
      const correct = filled.length === expected.length && filled.every((v, i) => v === expected[i]);
      // 시각화
      document.querySelectorAll('.wordbank-token, .wordbank-blank').forEach((el) => el.classList.add('disabled'));
      document.querySelectorAll('.wordbank-blank').forEach((b, i) => {
        if (b.textContent.trim() === expected[i]) b.style.borderColor = 'var(--correct)';
        else b.style.borderColor = 'var(--wrong)';
      });
      return correct;
    };
    return { html, validate, isReady };
  }

  /* ---------- 렌더러: Reorder ---------- */
  function renderReorder(ex) {
    // 답: ex.answer는 lines 인덱스 순서. 화면에 셔플해서 표시.
    const shuffled = shuffleIndices(ex.lines.length);
    const html = `
      <div class="reorder-list" id="reorder-list">
        ${shuffled.map((origIdx) => `
          <div class="reorder-item" data-orig="${origIdx}">
            <code class="reorder-code">${escapeHtml(ex.lines[origIdx])}</code>
            <button class="reorder-btn" data-dir="up" aria-label="위로">▲</button>
            <button class="reorder-btn" data-dir="down" aria-label="아래로">▼</button>
          </div>
        `).join('')}
      </div>
    `;
    const isReady = () => true; // 항상 제출 가능 (사용자가 순서 그대로 두면 그게 답)
    const validate = () => {
      const items = Array.from(document.querySelectorAll('.reorder-item'));
      const userOrder = items.map((it) => parseInt(it.dataset.orig, 10));
      const expected = ex.answer;
      const correct = userOrder.every((v, i) => v === expected[i]);
      // 시각화
      items.forEach((it, i) => {
        it.querySelectorAll('.reorder-btn').forEach((b) => (b.disabled = true));
        if (userOrder[i] === expected[i]) {
          it.style.borderColor = 'var(--correct)';
        } else {
          it.style.borderColor = 'var(--wrong)';
        }
      });
      return correct;
    };
    return { html, validate, isReady };
  }

  /* ---------- 렌더러: Bugspot ---------- */
  function renderBugspot(ex) {
    const html = `
      <div class="bugspot-code">
        ${ex.code.map((line, i) => `
          <button class="bugspot-line" data-idx="${i}">
            <span class="bugspot-num">${i + 1}</span>
            <span class="bugspot-content">${escapeHtml(line)}</span>
          </button>
        `).join('')}
      </div>
    `;
    const isReady = () => !!document.querySelector('.bugspot-line.selected');
    const validate = () => {
      const sel = document.querySelector('.bugspot-line.selected');
      const idx = sel ? parseInt(sel.dataset.idx, 10) : -1;
      const correct = idx === ex.answer;
      document.querySelectorAll('.bugspot-line').forEach((l) => {
        l.classList.add('disabled');
        const i = parseInt(l.dataset.idx, 10);
        if (i === ex.answer) l.classList.add('correct');
        else if (l === sel && !correct) l.classList.add('wrong');
      });
      return correct;
    };
    return { html, validate, isReady };
  }

  /* ---------- 렌더러: Rubric ---------- */
  function renderRubric(ex) {
    const order = shuffleIndices(ex.items.length);
    const html = `
      <div class="rubric-items">
        ${order.map((origIdx) => `
          <button class="rubric-item" data-orig="${origIdx}">
            <div class="rubric-checkbox"></div>
            <div>${escapeHtml(ex.items[origIdx].label)}</div>
          </button>
        `).join('')}
      </div>
    `;
    const isReady = () => true; // 다중 선택. 0개 선택도 답으로 인정.
    const validate = () => {
      const items = document.querySelectorAll('.rubric-item');
      let allCorrect = true;
      items.forEach((it) => {
        const orig = parseInt(it.dataset.orig, 10);
        const expected = !!ex.items[orig].correct;
        const selected = it.classList.contains('selected');
        it.classList.add('disabled');
        if (selected === expected) {
          it.classList.add('correct-shown');
          if (expected) it.querySelector('.rubric-checkbox').textContent = '✓';
        } else {
          it.classList.add('wrong-shown');
          allCorrect = false;
          if (expected) {
            // 못 고른 정답
            it.querySelector('.rubric-checkbox').textContent = '!';
          } else {
            // 잘못 고름
            it.querySelector('.rubric-checkbox').textContent = '✗';
          }
        }
      });
      return allCorrect;
    };
    return { html, validate, isReady };
  }

  /* ---------- 정답/오답 처리 ---------- */
  function handleAnswer(ex, correct) {
    state.answeredCorrect.push(correct);
    if (correct) {
      state.firstTryCorrect++;
      vibrate(20);
    } else {
      vibrate([30, 50, 30]);
    }

    // 통계
    const game = window.App.getGameState();
    const stat = game.perQuestion[ex.id] || { seen: 0, correct: 0 };
    stat.seen++;
    if (correct) stat.correct++;
    game.perQuestion[ex.id] = stat;
    localStorage.setItem('vibecoding_gamestate_v1', JSON.stringify(game));

    // 결과 패널 표시 (액션 영역에 추가)
    const actions = document.getElementById('practice-actions');
    actions.innerHTML = `
      <div class="result-panel ${correct ? 'correct' : 'wrong'}">
        <div class="result-title">
          <span>${correct ? '✓ 정답!' : '✗ 다시 보기'}</span>
          ${correct ? '<span style="margin-left:auto;color:var(--xp);font-size:14px;">+10 XP</span>' : ''}
        </div>
        <div class="result-explain">${ex.explain ? (window.marked ? marked.parse(ex.explain) : escapeHtml(ex.explain)) : ''}</div>
      </div>
      <button class="practice-action-btn ${correct ? 'correct' : 'wrong'}" id="next-btn" style="margin-top:12px">다음 →</button>
    `;
    document.getElementById('next-btn').addEventListener('click', () => {
      state.current++;
      state.phase_state = 'asking';
      renderCurrent();
    });
  }

  /* ---------- 종료: 결과 + 컨페티 ---------- */
  function finish() {
    state.phase_state = 'finished';
    const total = state.questions.length;
    const correct = state.answeredCorrect.filter(Boolean).length;
    const allFirstTry = state.firstTryCorrect === total;

    let bonus = 0;
    let earned = correct * 10;
    if (allFirstTry && total > 0) {
      bonus = 20;
      earned += bonus;
    }

    // 게임 상태 갱신
    window.App.addXp(earned);
    let lessonState = 'read';
    if (correct >= 4 && allFirstTry) lessonState = 'perfect';
    else if (correct >= 4) lessonState = 'passed';
    else lessonState = 'read';
    window.App.markLessonState(state.phaseId, state.lessonId, lessonState);
    const newStreak = window.App.bumpStreak();

    showCelebration({ correct, total, earned, bonus, lessonState, newStreak });
  }

  function showCelebration({ correct, total, earned, bonus, lessonState, newStreak }) {
    const root = document.getElementById('celebration-root');
    const mascotMood = lessonState === 'perfect' ? 'happy' : (correct >= 4 ? 'happy' : 'sad');
    const title = lessonState === 'perfect'
      ? '★ 완벽! Perfect!'
      : (correct >= 4 ? '레슨 클리어! 🎉' : '한 번 더 풀어볼까요?');
    const sub = lessonState === 'perfect'
      ? `${total}문제 모두 첫 시도 정답`
      : `정답 ${correct} / ${total}`;

    root.innerHTML = `
      <div class="celebration-overlay">
        <div class="celebration-mascot mascot-svg mascot--${mascotMood}">
          ${window.App.getMascot() || ''}
        </div>
        <h2 class="celebration-title">${title}</h2>
        <div class="celebration-subtitle">${sub}</div>
        <div class="celebration-stats">
          <div class="celebration-stat">
            <div class="celebration-stat-num">+${earned}</div>
            <div class="celebration-stat-label">XP${bonus ? ' (보너스 +' + bonus + ')' : ''}</div>
          </div>
          <div class="celebration-stat">
            <div class="celebration-stat-num">🔥 ${newStreak}</div>
            <div class="celebration-stat-label">스트릭</div>
          </div>
        </div>
        <div class="celebration-buttons">
          ${getNextLessonHref() ? `<a class="celebration-btn primary" href="${getNextLessonHref()}" id="next-lesson-btn">다음 레슨 →</a>` : ''}
          <a class="celebration-btn secondary" href="#/phase/${state.phaseId}" id="back-phase-btn">Phase로 돌아가기</a>
        </div>
        ${correct >= 4 ? renderConfetti() : ''}
      </div>
    `;
    root.classList.add('active');

    // 클릭으로 닫기 처리 (배경)
    setTimeout(() => {
      const overlay = root.querySelector('.celebration-overlay');
      const closeAndGo = (href) => {
        root.classList.remove('active');
        root.innerHTML = '';
        const pid = state.phaseId;
        close();
        if (href) {
          location.hash = href.replace(/^#/, '');
        } else {
          window.App.navigate(`/phase/${pid}`);
        }
      };
      overlay.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', (e) => {
          e.preventDefault();
          closeAndGo(a.getAttribute('href'));
        });
      });
    }, 50);
  }

  function getNextLessonHref() {
    if (!state) return null;
    const phase = state.phase;
    const idx = phase.lessons.findIndex((l) => l.id === state.lessonId);
    const next = phase.lessons[idx + 1];
    if (next) return `#/lesson/${phase.id}/${next.id}`;
    // 다음 phase의 첫 레슨
    const phases = window.App.PHASES;
    const pIdx = phases.findIndex((p) => p.id === phase.id);
    if (phases[pIdx + 1]) {
      const nextPhase = phases[pIdx + 1];
      return `#/lesson/${nextPhase.id}/${nextPhase.lessons[0].id}`;
    }
    return null;
  }

  function renderConfetti() {
    const colors = ['#6ba6ff', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const pieces = [];
    for (let i = 0; i < 32; i++) {
      const left = Math.random() * 100;
      const delay = Math.random() * 0.6;
      const duration = 1.8 + Math.random() * 1.2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotate = Math.random() * 360;
      pieces.push(`<div class="confetti" style="left:${left}%; background:${color}; animation-delay:${delay}s; animation-duration:${duration}s; transform:rotate(${rotate}deg);"></div>`);
    }
    return pieces.join('');
  }

  /* ---------- export ---------- */
  window.Practice = { start, close, isActive };
})();
