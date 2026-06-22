const STORAGE_KEY = 'pc_progress_v1';
const USER_KEY = 'pc_user_id_v1';
const API_BASE = (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform())
  ? 'http://80.241.218.217:3008'
  : '';

function authHeaders(extra) {
  const token = localStorage.getItem('auth_token');
  return token ? { 'Authorization': 'Bearer ' + token, ...extra } : { ...extra };
}

function getOrCreateUserId() {
  let id = localStorage.getItem(USER_KEY);
  if (!id) {
    id = (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2);
    localStorage.setItem(USER_KEY, id);
  }
  return id;
}

const BADGES = [
  { id: 'first-lesson',   icon: '🌱', name: 'Primeira lição',   check: (p) => Object.keys(p.completed).length >= 1 },
  { id: 'ten-lessons',    icon: '📚', name: '10 lições',         check: (p) => Object.keys(p.completed).length >= 10 },
  { id: 'thirty-lessons', icon: '🎯', name: '30 lições',         check: (p) => Object.keys(p.completed).length >= 30 },
  { id: 'all-lessons',    icon: '🦜', name: 'TrilhaDev Master',   check: (p) => Object.keys(p.completed).length >= LESSONS.length },
  { id: 'streak-3',       icon: '🔥', name: 'Streak 3 dias',     check: (p) => p.streak.count >= 3 },
  { id: 'streak-7',       icon: '⚡', name: 'Streak 7 dias',     check: (p) => p.streak.count >= 7 },
  { id: 'xp-50',          icon: '⭐', name: '50 XP',             check: (p) => p.xp >= 50 },
  { id: 'xp-200',         icon: '💎', name: '200 XP',            check: (p) => p.xp >= 200 },
  { id: 'xp-500',         icon: '🚀', name: '500 XP',            check: (p) => p.xp >= 500 },
  { id: 'coder',          icon: '💻', name: 'Programador',       check: (p) => LESSONS.filter(l => l.type === 'code' && p.completed[l.id]).length >= 5 },
];

const LEVELS = [
  { min: 0,    max: 99,       name: 'Iniciante',     next: 100 },
  { min: 100,  max: 249,      name: 'Aprendiz',      next: 250 },
  { min: 250,  max: 499,      name: 'Desenvolvedor', next: 500 },
  { min: 500,  max: 999,      name: 'Programador',   next: 1000 },
  { min: 1000, max: Infinity, name: 'Mestre',        next: null },
];


function getLevel(xp) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (!p.badges) p.badges = [];
      if (!p.nome)   p.nome = '';
      if (!p.avatar) p.avatar = '🦜';
      return p;
    }
  } catch (e) {
    console.warn('Falha ao ler progresso salvo', e);
  }
  return { completed: {}, code: {}, xp: 0, streak: { count: 0, lastDate: null }, badges: [], nome: '', avatar: '🦜' };
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  fetch(API_BASE + '/api/progress', {
    method: 'POST',
    headers: authHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(progress),
    credentials: 'include',
  }).catch(() => {});
}

let progress = loadProgress();

function isUnlocked(index) {
  if (index === 0) return true;
  return !!progress.completed[LESSONS[index - 1].id];
}

function bumpStreak() {
  const today = new Date().toDateString();
  if (progress.streak.lastDate === today) return;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  progress.streak.count = progress.streak.lastDate === yesterday ? progress.streak.count + 1 : 1;
  progress.streak.lastDate = today;
}

function markComplete(lessonId, xp) {
  if (progress.completed[lessonId]) return;
  progress.completed[lessonId] = true;
  progress.xp += xp;
  bumpStreak();
  const newBadges = checkBadges();
  saveProgress();
  renderHeader();
  renderPath();
  newBadges.forEach(b => showToast(`${b.icon} Conquista desbloqueada: <strong>${escapeHtml(b.name)}</strong>`));
  const lesson = LESSONS.find(l => l.id === lessonId);
  if (lesson) checkPhaseComplete(lesson.unit);
}

function checkBadges() {
  const newBadges = [];
  BADGES.forEach(b => {
    if (!progress.badges.includes(b.id) && b.check(progress)) {
      progress.badges.push(b.id);
      newBadges.push(b);
    }
  });
  return newBadges;
}

function showToast(html) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = html;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function launchConfetti() {
  const overlay = document.createElement('div');
  overlay.id = 'confetti-overlay';
  document.body.appendChild(overlay);
  const colors = ['#58cc02', '#ffc800', '#ff4b4b', '#1cb0f6', '#ce82ff'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = `left:${Math.random()*100}%;background:${colors[i%colors.length]};animation-delay:${(Math.random()*1.5).toFixed(2)}s;animation-duration:${(1.5+Math.random()*2).toFixed(2)}s;width:${Math.round(5+Math.random()*8)}px;height:${Math.round(5+Math.random()*8)}px;border-radius:${Math.random()>.5?'50%':'2px'};`;
    overlay.appendChild(p);
  }
  setTimeout(() => overlay.remove(), 5500);
}

function checkPhaseComplete(unitName) {
  const unitLessons = LESSONS.filter(l => l.unit === unitName);
  if (unitLessons.every(l => progress.completed[l.id])) {
    setTimeout(() => showPhaseComplete(unitName), 350);
  }
}

function showPhaseComplete(unitName) {
  closeModal();
  launchConfetti();
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <div style="text-align:center;padding:24px 16px">
      <div style="font-size:3.5rem;margin-bottom:8px">🎉</div>
      <h2 style="color:var(--green);margin:0 0 6px;font-size:1.4rem">${escapeHtml(unitName)}</h2>
      <p style="color:#888;margin:0 0 28px">Fase completa! Bora pra próxima.</p>
      <div class="actions" style="align-items:center">
        <button onclick="closeModal()">Continuar trilha →</button>
      </div>
    </div>
  `;
  overlay.classList.remove('hidden');
}

function openProfile() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  modal.innerHTML = renderProfileHTML();
  overlay.classList.remove('hidden');

  document.getElementById('nome-input').addEventListener('input', (e) => {
    progress.nome = e.target.value.trim();
    saveProgress();
  });
}

function renderProfileHTML() {
  const level = getLevel(progress.xp);
  const li = LEVELS.indexOf(level);
  const nextName = li < LEVELS.length - 1 ? LEVELS[li + 1].name : null;
  const pct = level.next ? Math.round(((progress.xp - level.min) / (level.next - level.min)) * 100) : 100;
  const nome = progress.nome || 'Aventureiro';
  const totalDone = Object.keys(progress.completed).length;

  return `
    <button class="close" onclick="closeModal()">×</button>
    <div style="text-align:center;margin-bottom:4px">
      <img src="logoararadev.jpeg" class="avatar-display" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid var(--green);" alt="TrilhaDev" />
      <input id="nome-input" class="nome-input" type="text" placeholder="Seu nome" value="${escapeHtml(nome)}" maxlength="30" />
    </div>
    <div class="profile-level">
      <span class="level-name">${escapeHtml(level.name)}</span>
      <span class="level-xp">${progress.xp} XP</span>
    </div>
    <div class="level-bar-wrap"><div class="level-bar-fill" style="width:${pct}%"></div></div>
    <p class="level-hint">${nextName ? `${level.next - progress.xp} XP pra ${nextName}` : 'Nível máximo!'}</p>
    <div class="stat-cards">
      <div class="stat-card"><span>${totalDone}</span><small>lições completas</small></div>
      <div class="stat-card"><span>${progress.streak.count}</span><small>dias de streak</small></div>
      <div class="stat-card"><span>${progress.badges.length}</span><small>conquistas</small></div>
    </div>
  `;
}

function renderAchievementsHTML() {
  const badgeHtml = BADGES.map(b => {
    const unlocked = progress.badges.includes(b.id);
    return `<div class="badge-item ${unlocked ? 'unlocked' : 'locked'}">
      <span class="badge-icon">${b.icon}</span>
      <span>${escapeHtml(b.name)}</span>
    </div>`;
  }).join('');

  return `
    <button class="close" onclick="closeModal()">×</button>
    <h2>Conquistas</h2>
    <p class="level-hint">${progress.badges.length}/${BADGES.length} desbloqueadas</p>
    <div class="badge-grid">${badgeHtml}</div>
  `;
}

function openAchievements() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  modal.innerHTML = renderAchievementsHTML();
  overlay.classList.remove('hidden');
}

function renderSettingsHTML() {
  return `
    <button class="close" onclick="closeModal()">×</button>
    <h2>Configurações</h2>
    <div class="settings-list">
      <div class="settings-row">
        <div>
          <strong>Apagar progresso</strong>
          <p class="level-hint">Remove todo o progresso salvo neste navegador.</p>
        </div>
        <button id="settings-reset-btn" class="danger-btn">Resetar</button>
      </div>
    </div>
    <p class="app-version">TrilhaDev v1.0</p>
  `;
}

function openSettings() {
  const overlay = document.getElementById('modal-overlay');
  const modal = document.getElementById('modal');
  modal.innerHTML = renderSettingsHTML();
  overlay.classList.remove('hidden');

  document.getElementById('settings-reset-btn').onclick = () => {
    if (confirm('Apagar todo o progresso salvo neste navegador?')) {
      fetch(API_BASE + '/api/progress/' + getOrCreateUserId(), { method: 'DELETE', headers: authHeaders(), credentials: 'include' }).catch(() => {});
      localStorage.removeItem(STORAGE_KEY);
      progress = loadProgress();
      renderHeader();
      renderPath();
      closeModal();
    }
  };
}

function renderHeader() {
  document.getElementById('streak-num').textContent = progress.streak.count;

  const level = getLevel(progress.xp);
  const li = LEVELS.indexOf(level);
  const nextName = li < LEVELS.length - 1 ? LEVELS[li + 1].name : null;
  const pct = level.next ? Math.round(((progress.xp - level.min) / (level.next - level.min)) * 100) : 100;

  document.getElementById('xp-text').textContent = level.next
    ? `${progress.xp} / ${level.next} XP`
    : `${progress.xp} XP`;
  document.getElementById('xp-level').textContent = level.name;
  document.getElementById('xp-bar').style.width = pct + '%';
}

const SVG_ICONS = {
  book:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
  code:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  lock:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  list:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
};

const ICONS = { theory: SVG_ICONS.book, code: SVG_ICONS.code, checklist: SVG_ICONS.list };
const WAVE_OFFSETS_BASE = [0, 70, 100, 70, 0, -70, -100, -70];
function getWaveOffsets() {
  const w = window.innerWidth;
  const scale = w < 380 ? 0.35 : w < 480 ? 0.45 : w < 640 ? 0.7 : 1;
  return WAVE_OFFSETS_BASE.map(o => Math.round(o * scale));
}

const FASE_DECOS = [
  // Fase 1 — Lógica
  [{ t:'{ }', big:true, l:'-12%', top:'8%' }, { t:'if', big:false, r:'-10%', top:'22%' }, { t:'let x', big:false, l:'-8%', top:'45%' }, { t:'=>', big:true, r:'-8%', top:'62%' }, { t:'true', big:false, l:'-10%', top:'80%' }],
  // Fase 2 — Estruturas
  [{ t:'[ ]', big:true, l:'-12%', top:'10%' }, { t:'Map', big:false, r:'-10%', top:'28%' }, { t:'{}', big:true, l:'-8%', top:'50%' }, { t:'.push()', big:false, r:'-8%', top:'68%' }, { t:'Set', big:false, l:'-10%', top:'85%' }],
  // Fase 3 — Recursão
  [{ t:'fn(fn)', big:false, l:'-12%', top:'10%' }, { t:'↩', big:true, r:'-10%', top:'30%' }, { t:'base', big:false, l:'-8%', top:'52%' }, { t:'∞', big:true, r:'-8%', top:'70%' }, { t:'return', big:false, l:'-10%', top:'86%' }],
  // Fase 4 — Algoritmos
  [{ t:'O(n)', big:false, l:'-12%', top:'8%' }, { t:'sort()', big:false, r:'-10%', top:'26%' }, { t:'O(n²)', big:false, l:'-8%', top:'48%' }, { t:'O(log n)', big:false, r:'-8%', top:'66%' }, { t:'O(1)', big:false, l:'-10%', top:'82%' }],
  // Fase 5 — SQL
  [{ t:'SELECT', big:false, l:'-12%', top:'10%' }, { t:'JOIN', big:false, r:'-10%', top:'28%' }, { t:'WHERE', big:false, l:'-8%', top:'50%' }, { t:'INDEX', big:false, r:'-8%', top:'68%' }, { t:'GROUP BY', big:false, l:'-10%', top:'84%' }],
  // Fase 6 — Debug
  [{ t:'null?', big:false, l:'-12%', top:'8%' }, { t:'console.log', big:false, r:'-10%', top:'26%' }, { t:'fix', big:false, l:'-8%', top:'50%' }, { t:'stack trace', big:false, r:'-8%', top:'68%' }, { t:'diff', big:false, l:'-10%', top:'84%' }],
  // Fase 7 — Testes
  [{ t:'test()', big:false, l:'-12%', top:'10%' }, { t:'assert', big:false, r:'-10%', top:'28%' }, { t:'mock()', big:false, l:'-8%', top:'50%' }, { t:'coverage', big:false, r:'-8%', top:'68%' }, { t:'expect()', big:false, l:'-10%', top:'84%' }],
  // Fase 8 — Arquitetura
  [{ t:'API', big:false, l:'-12%', top:'8%' }, { t:'.env', big:false, r:'-10%', top:'26%' }, { t:'MVC', big:false, l:'-8%', top:'48%' }, { t:'middleware', big:false, r:'-8%', top:'66%' }, { t:'auth()', big:false, l:'-10%', top:'82%' }],
  // Fase 9 — APIs REST
  [{ t:'GET /', big:false, l:'-12%', top:'10%' }, { t:'POST', big:false, r:'-10%', top:'28%' }, { t:'JSON', big:false, l:'-8%', top:'50%' }, { t:'200 OK', big:false, r:'-8%', top:'68%' }, { t:'fetch()', big:false, l:'-10%', top:'84%' }],
  // Fase 10 — Git
  [{ t:'commit', big:false, l:'-12%', top:'8%' }, { t:'push', big:false, r:'-10%', top:'26%' }, { t:'branch', big:false, l:'-8%', top:'48%' }, { t:'rebase', big:false, r:'-8%', top:'66%' }, { t:'merge', big:false, l:'-10%', top:'82%' }],
];

function addTrackDecos(track, faseIdx) {
  const items = FASE_DECOS[faseIdx % FASE_DECOS.length];
  items.forEach(d => {
    const el = document.createElement('div');
    el.className = 'deco-item ' + (d.big ? 'big' : 'small');
    el.textContent = d.t;
    el.style.position = 'absolute';
    el.style.top = d.top;
    if (d.l) el.style.left = d.l;
    if (d.r) el.style.right = d.r;
    track.appendChild(el);
  });
}

const FASE_COLORS = [
  '#ff4b4b', '#1cb0f6', '#a560e8', '#ff9600',
  '#2ec4b6', '#ce82ff', '#58cc02', '#4c6ef5',
  '#ff6b6b', '#ffd43b',
];

const FASE_ICONS_LIST = ['{ }', '[ ]', 'fn()', 'O(n)', 'SQL', 'bug', 'test()', 'arch', 'REST', 'git'];

function getFaseIndex(unitName) {
  const m = unitName.match(/Fase (\d+)/);
  return m ? parseInt(m[1]) - 1 : 0;
}

function renderPath() {
  const container = document.getElementById('path');
  container.innerHTML = '';
  let lastUnit = null;
  let track = null;
  let groupIndex = 0;

  const waveOffsets = getWaveOffsets();
  const nextIndex = LESSONS.findIndex((lesson, i) => isUnlocked(i) && !progress.completed[lesson.id]);

  const unitStats = {};
  LESSONS.forEach((lesson) => {
    if (!unitStats[lesson.unit]) unitStats[lesson.unit] = { total: 0, done: 0 };
    unitStats[lesson.unit].total++;
    if (progress.completed[lesson.id]) unitStats[lesson.unit].done++;
  });

  LESSONS.forEach((lesson, index) => {
    if (lesson.unit !== lastUnit) {
      const stats = unitStats[lesson.unit];
      const pct = Math.round((stats.done / stats.total) * 100);
      const fi = getFaseIndex(lesson.unit);
      const color = FASE_COLORS[fi % FASE_COLORS.length];
      const icon = FASE_ICONS_LIST[fi % FASE_ICONS_LIST.length];
      const shortTitle = lesson.unit.replace(/^Fase \d+ — /, '');

      const banner = document.createElement('div');
      banner.className = 'fase-banner';
      banner.style.background = color;
      banner.innerHTML = `
        <div class="fase-banner-text">
          <span class="fase-banner-label">Fase ${fi + 1}</span>
          <span class="fase-banner-title">${escapeHtml(shortTitle)}</span>
          <div class="fase-banner-progress">
            <span class="fase-banner-count">${stats.done}/${stats.total} lições</span>
            <div class="fase-banner-bar"><div class="fase-banner-bar-fill" style="width:${pct}%"></div></div>
          </div>
        </div>
        <span class="fase-banner-icon">${icon}</span>
      `;
      container.appendChild(banner);

      track = document.createElement('div');
      track.className = 'fase-track';
      container.appendChild(track);
      addTrackDecos(track, fi);

      lastUnit = lesson.unit;
      groupIndex = 0;
    }

    const unlocked = isUnlocked(index);
    const done = !!progress.completed[lesson.id];
    const isCurrent = index === nextIndex;

    const wrap = document.createElement('div');
    wrap.className = 'lesson-wrap ' + (done ? 'done' : unlocked ? 'unlocked' : 'locked');
    const offset = waveOffsets[groupIndex % waveOffsets.length];
    wrap.style.transform = `translateX(${offset}px)`;

    const node = document.createElement('button');
    node.className = 'lesson-node ' + (done ? 'done' : unlocked ? 'unlocked' : 'locked') + (isCurrent ? ' current' : '');
    node.disabled = !unlocked;
    node.innerHTML = done ? SVG_ICONS.check : unlocked ? (ICONS[lesson.type] || SVG_ICONS.book) : SVG_ICONS.lock;
    if (unlocked) node.addEventListener('click', () => openLesson(index));

    const label = document.createElement('span');
    label.className = 'lesson-label';
    label.textContent = lesson.title;

    wrap.appendChild(node);
    wrap.appendChild(label);

    if (isCurrent) {
      const badge = document.createElement('div');
      badge.className = 'start-badge';
      badge.textContent = done ? 'em andamento' : 'começar';
      wrap.appendChild(badge);

      const mascotWrap = document.createElement('div');
      mascotWrap.className = 'mascot';
      const mascotImg = document.createElement('img');
      mascotImg.src = 'araradev.jpeg';
      mascotImg.alt = 'TrilhaDev';
      mascotImg.className = 'mascot-img';
      mascotWrap.appendChild(mascotImg);
      wrap.appendChild(mascotWrap);
    }

    track.appendChild(wrap);
    groupIndex++;
  });
}

function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
  setActiveNav('trilha');
}

function setActiveNav(name) {
  document.querySelectorAll('.bottombar button').forEach(b => {
    b.classList.toggle('active', b.dataset.nav === name);
  });
}

function scrollToCurrent() {
  const current = document.querySelector('.lesson-node.current');
  if (current) current.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============================================================
// AUDIO — Web Audio API (sem arquivos externos)
// ============================================================
let _audioCtx = null;
function _getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playSound(type) {
  try {
    const ctx = _getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const note = (freq, start, dur, vol, wave) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = wave || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, now + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.05);
    };

    if (type === 'correct') {
      note(523.25, 0,    0.18, 0.3);
      note(659.25, 0.1,  0.18, 0.28);
      note(783.99, 0.2,  0.28, 0.25);
    } else if (type === 'wrong') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      osc.start(now); osc.stop(now + 0.45);
    } else if (type === 'complete') {
      note(523.25, 0,    0.25, 0.22);
      note(659.25, 0.12, 0.25, 0.2);
      note(783.99, 0.24, 0.25, 0.18);
      note(1046.5, 0.36, 0.5,  0.22);
    }
  } catch (e) {}
}

// ============================================================
// LESSON SCREEN — estado e funções
// ============================================================
let _ls = null;

function openLessonScreen(index) {
  const lesson = LESSONS[index];
  if (!lesson || lesson.type !== 'theory' || !lesson.quiz || !lesson.quiz.length) {
    _openLessonModal(index);
    return;
  }

  _ls = {
    lesson,
    index,
    qi: 0,
    total: lesson.quiz.length,
    correct: 0,
    answered: false,
    selected: null,
    done: !!progress.completed[lesson.id],
  };

  document.getElementById('lesson-screen').classList.remove('hidden');
  _lsRenderQuestion();
}

function _lsRenderQuestion() {
  const { lesson, qi, total } = _ls;
  const q = lesson.quiz[qi];

  document.getElementById('ls-progress-fill').style.width = Math.round((qi / total) * 100) + '%';

  document.getElementById('ls-body').innerHTML = `
    <div class="ls-question-wrap">
      <div class="ls-type-label">Escolha a resposta correta</div>
      <div class="ls-question">${q.q}</div>
      <div class="ls-options">
        ${q.options.map((opt, oi) => `
          <button class="ls-opt" data-oi="${oi}" onclick="_lsSelect(this,${oi})">${opt}</button>
        `).join('')}
      </div>
    </div>
  `;

  _ls.answered = false;
  _ls.selected = null;

  const fb = document.getElementById('ls-feedback');
  fb.className = 'ls-feedback';
  fb.innerHTML = '';

  const vBtn = document.getElementById('ls-verify-btn');
  vBtn.disabled = true;
  vBtn.classList.remove('ready');
  vBtn.textContent = 'VERIFICAR';

  const footer = document.getElementById('ls-footer');
  footer.style.display = '';
}

function _lsSelect(el, oi) {
  if (_ls.answered) return;
  document.querySelectorAll('.ls-opt').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  _ls.selected = oi;
  const vBtn = document.getElementById('ls-verify-btn');
  vBtn.disabled = false;
  vBtn.classList.add('ready');
}

function _lsVerify() {
  if (_ls.selected === null || _ls.answered) return;
  _ls.answered = true;

  const { lesson, qi, selected } = _ls;
  const q = lesson.quiz[qi];
  const isCorrect = selected === q.answer;
  if (isCorrect) _ls.correct++;

  document.querySelectorAll('.ls-opt').forEach((btn, i) => {
    btn.disabled = true;
    btn.classList.remove('selected');
    if (i === q.answer)                btn.classList.add('correct');
    else if (i === selected && !isCorrect) btn.classList.add('wrong');
  });

  playSound(isCorrect ? 'correct' : 'wrong');

  const correctAnswerText = q.options[q.answer];

  const fb = document.getElementById('ls-feedback');
  fb.className = 'ls-feedback ' + (isCorrect ? 'correct' : 'wrong');
  fb.innerHTML = `
    <div class="ls-feedback-top">
      <div class="ls-feedback-icon">${isCorrect ? '🎉' : '💡'}</div>
      <div>
        <div class="ls-feedback-title">${isCorrect ? 'Arrasou!' : 'Quase lá!'}</div>
        ${!isCorrect ? `<div class="ls-feedback-hint">Resposta certa: ${correctAnswerText}</div>` : ''}
      </div>
    </div>
    <button class="ls-continue-btn" onclick="_lsContinue()">CONTINUAR</button>
  `;

  document.getElementById('ls-footer').style.display = 'none';
  requestAnimationFrame(() => fb.classList.add('visible'));
}

function _lsContinue() {
  _ls.qi++;
  if (_ls.qi >= _ls.total) {
    _lsComplete();
    return;
  }
  document.getElementById('ls-progress-fill').style.width = Math.round((_ls.qi / _ls.total) * 100) + '%';
  _lsRenderQuestion();
}

function _lsComplete() {
  const { lesson, correct, total, done } = _ls;

  document.getElementById('ls-progress-fill').style.width = '100%';
  document.getElementById('ls-footer').style.display = 'none';
  document.getElementById('ls-feedback').className = 'ls-feedback';
  document.getElementById('ls-feedback').innerHTML = '';

  if (!done) markComplete(lesson.id, lesson.xp);

  playSound('complete');
  launchConfetti();

  const accuracy = Math.round((correct / total) * 100);
  document.getElementById('ls-body').innerHTML = `
    <div class="ls-complete">
      <div class="ls-complete-icon">🏆</div>
      <h2 class="ls-complete-title">Lição concluída!</h2>
      <p class="ls-complete-sub">${escapeHtml(lesson.title)}</p>
      <div class="ls-score-row">
        <div class="ls-score-card">
          <span style="color:#58cc02">${correct}/${total}</span>
          <small>acertos</small>
        </div>
        <div class="ls-score-card">
          <span style="color:#1cb0f6">${accuracy}%</span>
          <small>precisão</small>
        </div>
      </div>
      ${!done ? `<div class="ls-xp-badge"><span class="ls-xp-badge-num">+${lesson.xp}</span><span class="ls-xp-badge-label">XP ganho</span></div>` : ''}
      <button class="ls-complete-btn" onclick="closeLessonScreen()">CONTINUAR</button>
    </div>
  `;
}

function closeLessonScreen() {
  document.getElementById('lesson-screen').classList.add('hidden');
  _ls = null;
  setTimeout(scrollToCurrent, 100);
}

// ============================================================
// ABERTURA DE LIÇÃO — roteamento por tipo
// ============================================================
function openLesson(index) {
  const lesson = LESSONS[index];
  if (lesson.type === 'theory') {
    openLessonScreen(index);
    return;
  }
  _openLessonModal(index);
}

function _openLessonModal(index) {
  const lesson = LESSONS[index];
  const done = !!progress.completed[lesson.id];
  const modal = document.getElementById('modal');

  let body;
  if (lesson.type === 'code') body = renderCode(lesson);
  else body = renderChecklist(lesson);

  modal.innerHTML = `
    <button class="close" id="close-modal" aria-label="Fechar">×</button>
    <h2>${escapeHtml(lesson.title)}</h2>
    ${body}
  `;
  document.getElementById('modal-overlay').classList.remove('hidden');
  document.getElementById('close-modal').onclick = closeModal;

  if (lesson.type === 'code') attachCodeHandlers(lesson, done);
  else attachChecklistHandlers(lesson, done);
}

// ---------- THEORY ----------
function renderTheory(lesson) {
  const quizHtml = lesson.quiz
    .map(
      (q, qi) => `
    <div class="quiz-q" data-qi="${qi}">
      <p>${qi + 1}. ${q.q}</p>
      ${q.options
        .map(
          (opt, oi) => `
        <label class="quiz-opt">
          <input type="radio" name="q${qi}" value="${oi}"> ${opt}
        </label>`
        )
        .join('')}
      <div class="quiz-feedback"></div>
    </div>`
    )
    .join('');

  return `
    <div class="lesson-content">${lesson.content}</div>
    <div class="quiz">${quizHtml}</div>
    <div class="actions">
      <button id="check-btn">Conferir</button>
      <div id="result-msg"></div>
    </div>
  `;
}

function attachTheoryHandlers(lesson, done) {
  const checkBtn = document.getElementById('check-btn');
  const resultMsg = document.getElementById('result-msg');

  if (done) {
    resultMsg.textContent = 'Lição já concluída ✓';
    checkBtn.textContent = 'Fechar';
    checkBtn.onclick = closeModal;
    return;
  }

  checkBtn.onclick = () => {
    let allCorrect = true;
    lesson.quiz.forEach((q, qi) => {
      const selected = document.querySelector(`input[name="q${qi}"]:checked`);
      const feedback = document.querySelector(`.quiz-q[data-qi="${qi}"] .quiz-feedback`);
      if (!selected) {
        feedback.textContent = '⚠️ escolha uma opção';
        feedback.className = 'quiz-feedback warn';
        allCorrect = false;
        return;
      }
      const isCorrect = Number(selected.value) === q.answer;
      feedback.innerHTML = isCorrect ? '✅ correto' : `❌ a resposta certa é: ${q.options[q.answer]}`;
      feedback.className = 'quiz-feedback ' + (isCorrect ? 'ok' : 'err');
      if (!isCorrect) allCorrect = false;
    });

    if (allCorrect) {
      resultMsg.textContent = '🎉 Lição concluída!';
      markComplete(lesson.id, lesson.xp);
      checkBtn.textContent = 'Continuar';
      checkBtn.onclick = closeModal;
    } else {
      resultMsg.textContent = 'Quase! Revisa as respostas erradas e tenta de novo.';
    }
  };
}

// ---------- CODE ----------
function renderCode(lesson) {
  const savedCode = progress.code[lesson.id] || lesson.starter;
  return `
    <div class="lesson-content">${lesson.content}</div>
    <textarea id="code-input" rows="8">${escapeHtml(savedCode)}</textarea>
    <div class="actions">
      <button id="run-btn">Rodar testes</button>
      <div id="result-msg"></div>
    </div>
    <div id="test-results"></div>
  `;
}

function runTests(lesson, code) {
  let fn;
  try {
    fn = new Function(`${code}\n;return ${lesson.funcName};`)();
    if (typeof fn !== 'function') throw new Error(`função "${lesson.funcName}" não encontrada`);
  } catch (e) {
    return { error: `Erro ao carregar seu código: ${e.message}`, results: [] };
  }

  const results = lesson.tests.map((t) => {
    try {
      const actual = fn(...t.args);
      return { ...t, actual, pass: JSON.stringify(actual) === JSON.stringify(t.expected) };
    } catch (e) {
      return { ...t, actual: `Erro: ${e.message}`, pass: false };
    }
  });

  return { results };
}

function attachCodeHandlers(lesson, done) {
  const runBtn = document.getElementById('run-btn');
  const resultMsg = document.getElementById('result-msg');
  const testResults = document.getElementById('test-results');
  const textarea = document.getElementById('code-input');

  if (done) resultMsg.textContent = 'Lição já concluída ✓ (pode continuar testando)';

  runBtn.onclick = () => {
    const code = textarea.value;
    progress.code[lesson.id] = code;
    saveProgress();

    const { error, results } = runTests(lesson, code);
    if (error) {
      testResults.innerHTML = `<div class="test-row err">${escapeHtml(error)}</div>`;
      resultMsg.textContent = '';
      return;
    }

    testResults.innerHTML = results
      .map((r) => {
        const args = r.args.map((a) => JSON.stringify(a)).join(', ');
        return `<div class="test-row ${r.pass ? 'ok' : 'err'}">
          ${r.pass ? '✅' : '❌'} entrada: ${escapeHtml(args)} → esperado ${escapeHtml(JSON.stringify(r.expected))}, obteve ${escapeHtml(JSON.stringify(r.actual))}
        </div>`;
      })
      .join('');

    const allPass = results.every((r) => r.pass);
    if (allPass) {
      resultMsg.textContent = '🎉 Todos os testes passaram!';
      markComplete(lesson.id, lesson.xp);
    } else {
      resultMsg.textContent = 'Quase lá — ajusta o código e roda de novo.';
    }
  };
}

// ---------- CHECKLIST ----------
function renderChecklist(lesson) {
  const done = !!progress.completed[lesson.id];
  return `
    <div class="lesson-content">${lesson.content}</div>
    <div class="actions">
      <button id="done-btn" ${done ? 'disabled' : ''}>${done ? 'Concluído ✓' : 'Marquei como feito'}</button>
    </div>
  `;
}

function attachChecklistHandlers(lesson, done) {
  if (done) return;
  const btn = document.getElementById('done-btn');
  btn.onclick = () => {
    markComplete(lesson.id, lesson.xp);
    btn.textContent = 'Concluído ✓';
    btn.disabled = true;
  };
}

// ---------- INIT ----------
document.getElementById('nav-trilha').onclick = () => {
  closeModal();
  scrollToCurrent();
  setActiveNav('trilha');
};

document.getElementById('nav-conquistas').onclick = () => {
  openAchievements();
  setActiveNav('conquistas');
};

document.getElementById('nav-perfil').onclick = () => {
  openProfile();
  setActiveNav('perfil');
};

document.getElementById('nav-config').onclick = () => {
  openSettings();
  setActiveNav('config');
};

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderPath, 200);
});

async function initApp() {
  try {
    const res = await fetch(API_BASE + '/api/progress', { headers: authHeaders(), credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data) {
        progress = { badges: [], nome: '', avatar: '🦜', ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      }
    }
  } catch (_) {}
  renderHeader();
  renderPath();
  setTimeout(scrollToCurrent, 100);
}

(async function boot() {
  try {
    const res = await fetch(API_BASE + '/api/me', { headers: authHeaders(), credentials: 'include' });
    if (res.ok) {
      await initApp();
    } else {
      window.location.href = '/';
    }
  } catch (_) {
    window.location.href = '/';
  }
})();
