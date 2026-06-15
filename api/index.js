'use strict';
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const crypto  = require('crypto');
const bcrypt  = require('bcryptjs');
const path    = require('path');
const mysql   = require('mysql2/promise');

const ALLOWED_ORIGINS = [
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  'http://localhost:3008',
];

const PORT = process.env.PORT || 3008;

if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS || !process.env.SESSION_SECRET) {
  console.error('FATAL: ADMIN_USER, ADMIN_PASS e SESSION_SECRET precisam estar no .env');
  process.exit(1);
}

// ── MySQL pool ────────────────────────────────────────────────────────────────

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'araradev',
  password: process.env.DB_PASS     || 'Araradev2024!',
  database: process.env.DB_NAME     || 'araradev',
  waitForConnections: true,
  connectionLimit: 10,
});

async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS xp_events (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(64) NOT NULL,
      amount INT NOT NULL,
      source VARCHAR(40) NOT NULL,
      ref_id VARCHAR(128) NOT NULL,
      created_at BIGINT NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY ux_xp_user_source_ref (user_id, source, ref_id),
      KEY idx_xp_period (created_at, amount),
      KEY idx_xp_user_period (user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lesson_completions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(64) NOT NULL,
      lesson_id VARCHAR(128) NOT NULL,
      xp INT NOT NULL,
      completed_at BIGINT NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY ux_lesson_user_lesson (user_id, lesson_id),
      KEY idx_lesson_user_time (user_id, completed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(64) NOT NULL,
      challenge_date DATE NOT NULL,
      correct INT NOT NULL,
      total INT NOT NULL,
      xp INT NOT NULL,
      completed_at BIGINT NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY ux_daily_user_date (user_id, challenge_date),
      KEY idx_daily_date (challenge_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  await backfillProgressTables();
}

async function backfillProgressTables() {
  const [rows] = await pool.query('SELECT user_id, data FROM progress');
  for (const row of rows) {
    let progress;
    try {
      progress = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    } catch {
      continue;
    }

    const completed = progress?.completed || {};
    for (const lessonId of Object.keys(completed)) {
      if (!completed[lessonId]) continue;
      await pool.query(
        'INSERT IGNORE INTO lesson_completions (user_id, lesson_id, xp, completed_at) VALUES (?,?,?,?)',
        [row.user_id, lessonId, 0, 0]
      );
    }

    const hasXpEvents = Array.isArray(progress?.xpEvents) && progress.xpEvents.length > 0;
    if (!hasXpEvents && Number(progress?.xp || 0) > 0) {
      await pool.query(
        'INSERT IGNORE INTO xp_events (user_id, amount, source, ref_id, created_at) VALUES (?,?,?,?,?)',
        [row.user_id, Number(progress.xp), 'legacy', 'progress-json', 0]
      );
    }

    if (hasXpEvents) {
      for (const event of progress.xpEvents) {
        const amount = Number(event?.amount || 0);
        const source = String(event?.source || 'event').slice(0, 40);
        if (!source.startsWith('lesson:')) continue;
        const refId = source.includes(':') ? source.split(':').slice(1).join(':') : source;
        if (amount <= 0) continue;
        await pool.query(
          'INSERT IGNORE INTO xp_events (user_id, amount, source, ref_id, created_at) VALUES (?,?,?,?,?)',
          [row.user_id, amount, source.split(':')[0] || 'event', refId || String(event?.at || 0), Number(event?.at || 0)]
        );
      }
    }
  }
}

const schemaReady = ensureSchema().catch((err) => {
  console.error('FATAL: erro ao preparar schema do banco', err);
  process.exit(1);
});

// ── Express setup ─────────────────────────────────────────────────────────────

const app = express();

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sid',
  cookie: {
    httpOnly: true,
    secure: process.env.HTTPS === 'true',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(async (_req, _res, next) => {
  await schemaReady;
  next();
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function safeCompare(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function requireAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  if (req.path.startsWith('/admin/api/')) return res.status(401).json({ error: 'Unauthorized' });
  res.redirect('/admin');
}

async function requireAuth(req, res, next) {
  if (req.session?.userId) return next();
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.slice(7);
    const [rows] = await pool.query('SELECT id FROM users WHERE token = ?', [token]);
    if (rows.length) { req.session.userId = rows[0].id; return next(); }
  }
  res.status(401).json({ error: 'Não autenticado' });
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post('/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return res.status(400).json({ error: 'Preencha todos os campos' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha mínimo 6 caracteres' });

  try {
    const emailKey = email.toLowerCase().trim();
    const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [emailKey]);
    if (exists.length) return res.status(409).json({ error: 'Email já cadastrado' });

    const hash  = await bcrypt.hash(password, 10);
    const id    = crypto.randomUUID();
    const token = crypto.randomUUID();
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, avatar, token, created_at) VALUES (?,?,?,?,?,?,?)',
      [id, emailKey, hash, name.trim(), '🦜', token, Date.now()]
    );

    req.session.userId = id;
    res.json({ ok: true, token, user: { id, email: emailKey, name: name.trim(), avatar: '🦜' } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Preencha todos os campos' });

  try {
    const emailKey = email.toLowerCase().trim();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailKey]);
    if (!rows.length) return res.status(401).json({ error: 'Email ou senha inválidos' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou senha inválidos' });

    if (!user.token) {
      user.token = crypto.randomUUID();
      await pool.query('UPDATE users SET token = ? WHERE id = ?', [user.token, user.id]);
    }

    req.session.userId = user.id;
    res.json({ ok: true, token: user.token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/me', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT id, email, name, avatar FROM users WHERE id = ?', [req.session.userId]);
  if (!rows.length) { req.session.destroy(() => {}); return res.status(401).json({ error: 'Sessão inválida' }); }
  res.json(rows[0]);
});

app.patch('/api/me', requireAuth, async (req, res) => {
  const { name, avatar } = req.body;
  if (name)   await pool.query('UPDATE users SET name = ? WHERE id = ?',   [name.trim(), req.session.userId]);
  if (avatar) await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, req.session.userId]);
  res.json({ ok: true });
});

// ── Progress API ──────────────────────────────────────────────────────────────

app.get('/api/progress', requireAuth, async (req, res) => {
  const [rows] = await pool.query('SELECT data FROM progress WHERE user_id = ?', [req.session.userId]);
  res.json(rows.length ? rows[0].data : null);
});

app.post('/api/progress', requireAuth, async (req, res) => {
  const data = JSON.stringify(req.body);
  await pool.query(
    'INSERT INTO progress (user_id, data, updated_at) VALUES (?,?,?) ON DUPLICATE KEY UPDATE data=VALUES(data), updated_at=VALUES(updated_at)',
    [req.session.userId, data, Date.now()]
  );
  res.json({ ok: true });
});

app.post('/api/lesson-completions', requireAuth, async (req, res) => {
  const { lessonId, xp } = req.body;
  const amount = Number(xp);
  if (!lessonId || !Number.isInteger(amount) || amount <= 0) return res.status(400).json({ error: 'Dados inválidos' });

  const now = Date.now();
  await pool.query(
    'INSERT IGNORE INTO lesson_completions (user_id, lesson_id, xp, completed_at) VALUES (?,?,?,?)',
    [req.session.userId, String(lessonId), amount, now]
  );
  await pool.query(
    'INSERT IGNORE INTO xp_events (user_id, amount, source, ref_id, created_at) VALUES (?,?,?,?,?)',
    [req.session.userId, amount, 'lesson', String(lessonId), now]
  );
  res.json({ ok: true });
});

app.post('/api/daily-challenges', requireAuth, async (req, res) => {
  const { date, correct, total, xp } = req.body;
  const amount = Number(xp);
  const correctCount = Number(correct);
  const totalCount = Number(total);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !Number.isInteger(amount) || amount <= 0 || !Number.isInteger(correctCount) || !Number.isInteger(totalCount)) {
    return res.status(400).json({ error: 'Dados inválidos' });
  }

  const now = Date.now();
  await pool.query(
    'INSERT IGNORE INTO daily_challenges (user_id, challenge_date, correct, total, xp, completed_at) VALUES (?,?,?,?,?,?)',
    [req.session.userId, date, correctCount, totalCount, amount, now]
  );
  await pool.query(
    'INSERT IGNORE INTO xp_events (user_id, amount, source, ref_id, created_at) VALUES (?,?,?,?,?)',
    [req.session.userId, amount, 'daily', String(date), now]
  );
  res.json({ ok: true });
});

app.get('/api/ranking', requireAuth, async (req, res) => {
  const period = ['global', 'weekly', 'monthly'].includes(req.query.period) ? req.query.period : 'weekly';
  const now = Date.now();
  const start = period === 'weekly'
    ? now - 7 * 24 * 60 * 60 * 1000
    : period === 'monthly'
      ? now - 30 * 24 * 60 * 60 * 1000
      : 0;

  const where = period === 'global' ? '' : 'WHERE e.created_at >= ?';
  const params = period === 'global' ? [] : [start];
  const [rows] = await pool.query(`
    SELECT
      u.id,
      u.name,
      u.avatar,
      COALESCE(SUM(e.amount), 0) AS xp,
      COALESCE(l.lessons, 0) AS lessons,
      p.data AS progress_data
    FROM users u
    JOIN xp_events e ON e.user_id = u.id
    LEFT JOIN (
      SELECT user_id, COUNT(*) AS lessons
      FROM lesson_completions
      GROUP BY user_id
    ) l ON l.user_id = u.id
    LEFT JOIN progress p ON p.user_id = u.id
    ${where}
    GROUP BY u.id, u.name, u.avatar, l.lessons, p.data
    ORDER BY xp DESC, lessons DESC
    LIMIT 50
  `, params);

  const ranking = rows.map((row, index) => {
    let streak = 0;
    try {
      const progress = typeof row.progress_data === 'string' ? JSON.parse(row.progress_data) : row.progress_data;
      streak = progress?.streak?.count || 0;
    } catch { /* ignore */ }
    return {
      id: row.id,
      name: row.name,
      avatar: row.avatar || '🦜',
      xp: Number(row.xp || 0),
      lessons: Number(row.lessons || 0),
      streak,
      rank: index + 1,
    };
  });

  res.json(ranking);
});

// ── Admin HTML ────────────────────────────────────────────────────────────────

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<title>Admin — AraraDev</title><style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Outfit',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#0d1a2e 0%,#091420 40%,#060e18 70%,#04090f 100%);color:#e8f4ff;padding:20px}
.card{background:#1a2d42;border:1px solid #1e3a54;border-radius:18px;padding:40px 36px;width:100%;max-width:380px;box-shadow:0 20px 60px rgba(0,0,0,.4)}
.logo{display:block;width:64px;height:64px;border-radius:50%;border:3px solid #58cc02;object-fit:cover;margin:0 auto 16px;box-shadow:0 0 30px rgba(88,204,2,.25)}
h1{font-size:1.25rem;font-weight:800;text-align:center}
.sub{color:#6b8fa8;font-size:.82rem;text-align:center;margin:4px 0 24px}
label{display:block;font-size:.75rem;font-weight:700;color:#6b8fa8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
.field{margin-bottom:16px}
input{display:block;width:100%;padding:11px 14px;background:rgba(255,255,255,.06);border:2px solid #1e3a54;border-radius:10px;color:#e8f4ff;font-size:.95rem;font-family:inherit;outline:none;transition:border-color .15s}
input:focus{border-color:#58cc02}
button{display:block;width:100%;padding:13px;margin-top:8px;background:#58cc02;color:#06280a;font-weight:800;border:none;border-radius:10px;font-size:.95rem;font-family:inherit;cursor:pointer;transition:background .15s}
button:hover{background:#4ab301}
.err{color:#ff6b6b;font-size:.82rem;margin-top:14px;text-align:center;background:rgba(255,75,75,.08);border:1px solid rgba(255,75,75,.2);border-radius:8px;padding:8px}
</style></head><body><div class="card">
<img class="logo" src="/logoararadev.jpeg" alt="AraraDev">
<h1>AraraDev Admin</h1>
<p class="sub">Painel administrativo</p>
<form method="POST" action="/admin/login">
<div class="field"><label>Usuário</label><input type="text" name="username" autocomplete="off" required></div>
<div class="field"><label>Senha</label><input type="password" name="password" required></div>
<button type="submit">Entrar</button>
</form></div></body></html>`;

const LOGIN_ERROR_HTML = LOGIN_HTML.replace('<button type="submit">Entrar</button>', '<p class="err">Credenciais inválidas.</p><button type="submit">Entrar</button>');

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<title>Admin — AraraDev</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--surface:#15233a;--surface2:#1c2f4a;--border:#1e3a54;--green:#58cc02;--blue:#1cb0f6;--gold:#ffc800;--text:#e8f4ff;--muted:#6b8fa8;--red:#ff5b5b}
html,body{min-height:100%;background:linear-gradient(180deg,#0d1a2e 0%,#091420 40%,#060e18 70%,#04090f 100%);color:var(--text);font-family:'Outfit',-apple-system,system-ui,sans-serif;font-size:15px}
.adm-hdr{position:sticky;top:0;z-index:10;background:rgba(6,14,22,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between}
.adm-brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.1rem;color:var(--green)}
.adm-brand img{width:36px;height:36px;border-radius:50%;border:2px solid var(--green);object-fit:cover}
.adm-out{padding:8px 18px;background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:700;font-family:inherit;transition:border-color .15s,color .15s}
.adm-out:hover{border-color:var(--red);color:var(--red)}
.adm-main{max-width:1200px;margin:0 auto;padding:28px 24px 60px}
.adm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:28px}
.adm-stat{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:20px 22px;display:flex;align-items:center;gap:14px}
.adm-stat-ico{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0}
.adm-stat:nth-child(1) .adm-stat-ico{background:rgba(88,204,2,.12)}
.adm-stat:nth-child(2) .adm-stat-ico{background:rgba(28,176,246,.12)}
.adm-stat:nth-child(3) .adm-stat-ico{background:rgba(255,200,0,.12)}
.adm-stat-info{}
.adm-stat-n{font-size:1.75rem;font-weight:900;line-height:1.1}
.adm-stat:nth-child(1) .adm-stat-n{color:var(--green)}
.adm-stat:nth-child(2) .adm-stat-n{color:var(--blue)}
.adm-stat:nth-child(3) .adm-stat-n{color:var(--gold)}
.adm-stat-l{font-size:.72rem;color:var(--muted);margin-top:3px;text-transform:uppercase;letter-spacing:.06em;font-weight:700}
.adm-sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap}
.adm-sec-ttl{font-size:1rem;font-weight:800}
.adm-search-wrap{position:relative}
.adm-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;font-size:.85rem}
.adm-search{padding:9px 14px 9px 34px;background:var(--surface);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.85rem;font-family:inherit;outline:none;width:240px;transition:border-color .15s}
.adm-search:focus{border-color:var(--green)}
.adm-search::placeholder{color:var(--muted)}
.adm-tbl-wrap{overflow-x:auto;border-radius:16px;border:1px solid var(--border);background:var(--surface)}
table{width:100%;border-collapse:collapse;min-width:640px}
thead th{background:var(--surface2);padding:12px 16px;text-align:left;font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:800;white-space:nowrap;border-bottom:1px solid var(--border)}
tbody td{padding:13px 16px;font-size:.85rem;border-top:1px solid rgba(255,255,255,.04);vertical-align:middle}
tbody tr:hover td{background:rgba(88,204,2,.03)}
.user-cell{display:flex;align-items:center;gap:10px}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#58cc02,#3d9100);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.9rem;color:#06280a;flex-shrink:0;text-transform:uppercase}
.td-name{font-weight:700}
.td-email{color:var(--muted);font-size:.78rem}
.xp-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(28,176,246,.1);color:var(--blue);border:1px solid rgba(28,176,246,.2);border-radius:7px;padding:3px 9px;font-size:.76rem;font-weight:800}
.str-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(255,200,0,.1);color:var(--gold);border:1px solid rgba(255,200,0,.2);border-radius:7px;padding:3px 9px;font-size:.76rem;font-weight:800}
.del-btn{padding:6px 12px;background:transparent;border:1px solid rgba(255,91,91,.25);color:var(--red);border-radius:8px;cursor:pointer;font-size:.76rem;font-weight:700;font-family:inherit;transition:background .12s,border-color .12s}
.del-btn:hover{background:rgba(255,91,91,.1);border-color:var(--red)}
.empty-td{color:var(--muted);text-align:center;padding:52px;font-size:.9rem}
#toast{position:fixed;bottom:24px;right:24px;z-index:99;padding:12px 20px;border-radius:12px;font-size:.85rem;font-weight:700;opacity:0;transform:translateY(12px);transition:opacity .25s,transform .25s;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.3)}
#toast.show{opacity:1;transform:translateY(0)}
#toast.ok{background:#162e1a;color:var(--green);border:1px solid rgba(88,204,2,.3)}
#toast.err{background:#3a1818;color:var(--red);border:1px solid rgba(255,91,91,.3)}
@media(max-width:640px){.adm-main{padding:20px 14px 50px}.adm-search{width:160px}}
</style>
</head>
<body>
<header class="adm-hdr">
  <div class="adm-brand"><img src="/logoararadev.jpeg" alt="AraraDev">AraraDev Admin</div>
  <form method="POST" action="/admin/logout"><button class="adm-out" type="submit">Sair →</button></form>
</header>
<main class="adm-main">
  <div class="adm-stats">
    <div class="adm-stat"><div class="adm-stat-ico">👥</div><div class="adm-stat-info"><div class="adm-stat-n" id="st-u">–</div><div class="adm-stat-l">Usuários</div></div></div>
    <div class="adm-stat"><div class="adm-stat-ico">⚡</div><div class="adm-stat-info"><div class="adm-stat-n" id="st-x">–</div><div class="adm-stat-l">XP Total</div></div></div>
    <div class="adm-stat"><div class="adm-stat-ico">📚</div><div class="adm-stat-info"><div class="adm-stat-n" id="st-l">–</div><div class="adm-stat-l">Lições concluídas</div></div></div>
  </div>
  <div class="adm-sec-hdr">
    <span class="adm-sec-ttl">Usuários cadastrados</span>
    <div class="adm-search-wrap"><span class="adm-search-ico">🔍</span><input class="adm-search" id="search" type="search" placeholder="Buscar nome ou email…" oninput="filter()"></div>
  </div>
  <div class="adm-tbl-wrap">
    <table>
      <thead><tr><th>Nome</th><th>Email</th><th>XP</th><th>Streak</th><th>Lições</th><th>Cadastro</th><th></th></tr></thead>
      <tbody id="tbody"><tr><td colspan="7" class="empty-td">Carregando…</td></tr></tbody>
    </table>
  </div>
</main>
<div id="toast"></div>
<script>
let all=[];
const fmt=ts=>new Date(ts).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'});
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(m,t='ok'){const e=document.getElementById('toast');e.textContent=m;e.className='show '+t;setTimeout(()=>{e.className=''},3000)}
function render(users){
  const tb=document.getElementById('tbody');
  if(!users.length){tb.innerHTML='<tr><td colspan="7" class="empty-td">Nenhum usuário encontrado.</td></tr>';return;}
  tb.innerHTML=users.map(u=>\`<tr id="row-\${u.id}">
    <td><div class="user-cell"><div class="avatar">\${esc(u.name.charAt(0))}</div><span class="td-name">\${esc(u.name)}</span></div></td>
    <td class="td-email">\${esc(u.email)}</td>
    <td><span class="xp-badge">⚡ \${u.xp.toLocaleString('pt-BR')}</span></td>
    <td><span class="str-badge">🔥 \${u.streak}</span></td>
    <td>\${u.lessons}</td>
    <td>\${fmt(u.created_at)}</td>
    <td><button class="del-btn" onclick="del('\${u.id}')">Deletar</button></td>
  </tr>\`).join('');
}
function filter(){const q=document.getElementById('search').value.toLowerCase();render(all.filter(u=>u.name.toLowerCase().includes(q)||u.email.toLowerCase().includes(q)))}
async function del(id){
  if(!confirm('Deletar este usuário e todo o progresso?'))return;
  const r=await fetch('/admin/api/users/'+id,{method:'DELETE'});
  const j=await r.json();
  if(j.ok){all=all.filter(u=>u.id!==id);filter();document.getElementById('st-u').textContent=all.length;toast('Usuário deletado.')}
  else toast('Erro: '+j.error,'err');
}
async function load(){
  try{
    const[stats,users]=await Promise.all([fetch('/admin/api/stats').then(r=>r.json()),fetch('/admin/api/users').then(r=>r.json())]);
    document.getElementById('st-u').textContent=stats.totalUsers;
    document.getElementById('st-x').textContent=stats.totalXp.toLocaleString('pt-BR');
    document.getElementById('st-l').textContent=stats.totalLessons;
    all=users;render(users);
  }catch(e){document.getElementById('tbody').innerHTML='<tr><td colspan="7" class="empty-td">Erro ao carregar.</td></tr>';}
}
load();
</script>
</body></html>`;

// ── Admin routes ──────────────────────────────────────────────────────────────

app.get('/admin', (req, res) => {
  if (req.session?.isAdmin) return res.redirect('/admin/dashboard');
  res.send(LOGIN_HTML);
});

app.post('/admin/login', (req, res) => {
  const { username = '', password = '' } = req.body;
  if (safeCompare(username, process.env.ADMIN_USER) && safeCompare(password, process.env.ADMIN_PASS)) {
    req.session.isAdmin = true;
    return res.redirect('/admin/dashboard');
  }
  res.send(LOGIN_ERROR_HTML);
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin'));
});

app.get('/admin/dashboard', requireAdmin, (req, res) => res.send(DASHBOARD_HTML));

app.get('/admin/api/stats', requireAdmin, async (req, res) => {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
    const [[{ totalXp }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) as totalXp FROM xp_events');
    const [[{ totalLessons }]] = await pool.query('SELECT COUNT(*) as totalLessons FROM lesson_completions');
    res.json({ totalUsers, totalXp, totalLessons });
  } catch (e) {
    res.status(503).json({ error: 'Banco indisponível' });
  }
});

app.get('/admin/api/users', requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.created_at,
        COALESCE(x.xp, 0) AS xp,
        COALESCE(l.lessons, 0) AS lessons
      FROM users u
      LEFT JOIN (
        SELECT user_id, SUM(amount) AS xp
        FROM xp_events
        GROUP BY user_id
      ) x ON x.user_id = u.id
      LEFT JOIN (
        SELECT user_id, COUNT(*) AS lessons
        FROM lesson_completions
        GROUP BY user_id
      ) l ON l.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    const [progress] = await pool.query('SELECT user_id, data FROM progress');
    const progMap = {};
    for (const p of progress) progMap[p.user_id] = typeof p.data === 'string' ? JSON.parse(p.data) : p.data;
    res.json(users.map(u => {
      const p = progMap[u.id] || {};
      return { id: u.id, name: u.name, email: u.email, xp: Number(u.xp || 0), streak: p.streak?.count || 0, lessons: Number(u.lessons || 0), created_at: u.created_at };
    }));
  } catch (e) {
    res.status(503).json({ error: 'Banco indisponível' });
  }
});

app.delete('/admin/api/users/:userId', requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM xp_events WHERE user_id = ?', [req.params.userId]);
    await pool.query('DELETE FROM lesson_completions WHERE user_id = ?', [req.params.userId]);
    await pool.query('DELETE FROM daily_challenges WHERE user_id = ?', [req.params.userId]);
    await pool.query('DELETE FROM progress WHERE user_id = ?', [req.params.userId]);
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.userId]);
    res.json({ ok: true });
  } catch (e) {
    res.status(503).json({ error: 'Banco indisponível' });
  }
});

// ── Static files ──────────────────────────────────────────────────────────────

const WEB_DIR = path.join(__dirname, '..', 'app');
app.use(express.static(WEB_DIR));

// SPA fallback — React Router (BrowserRouter): qualquer GET que não seja
// API/admin devolve o index.html pro roteamento client-side.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/auth') || req.path.startsWith('/admin')) return next();
  res.sendFile(path.join(WEB_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`AraraDev running → http://localhost:${PORT}`));
