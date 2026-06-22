'use strict';
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const crypto  = require('crypto');
const bcrypt  = require('bcryptjs');
const path    = require('path');
const mysql   = require('mysql2/promise');
const rateLimit = require('express-rate-limit');

// Token de API: guardado no banco como hash sha256 (nunca em texto puro).
// Validade de 90 dias; renova no login.
const TOKEN_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_XP_PER_EVENT = 100; // teto anti-fraude por lição/desafio
const sha256hex = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');

const ALLOWED_ORIGINS = [
  'capacitor://localhost',
  'https://localhost',
  'http://localhost',
  'http://localhost:3008',
];

const PORT = process.env.PORT || 3008;

if (!process.env.ADMIN_USER || !process.env.ADMIN_PASS || !process.env.SESSION_SECRET || !process.env.DB_PASS) {
  console.error('FATAL: ADMIN_USER, ADMIN_PASS, SESSION_SECRET e DB_PASS precisam estar no .env');
  process.exit(1);
}

// ── MySQL pool ────────────────────────────────────────────────────────────────

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'araradev',
  password: process.env.DB_PASS,
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS onboarding_preferences (
      user_id VARCHAR(64) NOT NULL,
      goal VARCHAR(60) NOT NULL,
      confidence VARCHAR(80) NOT NULL,
      time_commitment VARCHAR(60) NOT NULL,
      learning_style VARCHAR(60) NOT NULL,
      interests JSON NOT NULL,
      completed_at BIGINT NOT NULL,
      updated_at BIGINT NOT NULL,
      PRIMARY KEY (user_id),
      KEY idx_onboarding_goal (goal),
      KEY idx_onboarding_completed (completed_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query('ALTER TABLE xp_events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await pool.query('ALTER TABLE lesson_completions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await pool.query('ALTER TABLE daily_challenges CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
  await pool.query('ALTER TABLE onboarding_preferences CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');

  // Migração de segurança dos tokens: passa a guardar hash sha256 (não texto puro)
  // + validade. Roda uma vez (quando a coluna ainda não existe).
  const [tcol] = await pool.query(
    "SELECT COUNT(*) AS c FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'token_expires_at'"
  );
  if (!tcol[0].c) {
    await pool.query('ALTER TABLE users ADD COLUMN token_expires_at BIGINT NULL');
    await pool.query('ALTER TABLE users MODIFY token VARCHAR(64) NULL'); // hash sha256 = 64 chars
    // tokens existentes são UUID em texto puro (36 chars): vira hash + ganha validade
    await pool.query(
      'UPDATE users SET token = SHA2(token, 256), token_expires_at = ? WHERE token IS NOT NULL AND CHAR_LENGTH(token) = 36',
      [Date.now() + TOKEN_TTL_MS]
    );
  }

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
  // Não derruba o boot: sem DB (ex.: dev local sem túnel) o server ainda sobe
  // e serve admin/estáticos. Rotas que tocam o banco retornam erro tratado.
  console.warn('AVISO: schema do banco não preparado (DB indisponível?):', err.code || err.message);
});

// ── Express setup ─────────────────────────────────────────────────────────────

const app = express();

// Atrás do nginx: usa X-Forwarded-For pro IP real (rate-limit por cliente).
app.set('trust proxy', 1);

// Rate-limit anti brute-force. Mensagem genérica, conta por IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,                       // 20 tentativas / 15min / IP em login+registro
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente de novo em alguns minutos.' },
});
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                       // admin é mais sensível: 10 / 15min / IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Muitas tentativas. Tente de novo em alguns minutos.',
});

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
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE token = ? AND (token_expires_at IS NULL OR token_expires_at > ?)',
      [sha256hex(token), Date.now()]
    );
    if (rows.length) { req.session.userId = rows[0].id; return next(); }
  }
  res.status(401).json({ error: 'Não autenticado' });
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post('/auth/register', authLimiter, async (req, res) => {
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
      'INSERT INTO users (id, email, password_hash, name, avatar, token, token_expires_at, created_at) VALUES (?,?,?,?,?,?,?,?)',
      [id, emailKey, hash, name.trim(), '🦜', sha256hex(token), Date.now() + TOKEN_TTL_MS, Date.now()]
    );

    req.session.userId = id;
    res.json({ ok: true, token, user: { id, email: emailKey, name: name.trim(), avatar: '🦜' } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/auth/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Preencha todos os campos' });

  try {
    const emailKey = email.toLowerCase().trim();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailKey]);
    if (!rows.length) return res.status(401).json({ error: 'Email ou senha inválidos' });

    const user  = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Email ou senha inválidos' });

    // Token novo a cada login (guardado como hash; o plaintext só vai pro cliente agora).
    const token = crypto.randomUUID();
    await pool.query('UPDATE users SET token = ?, token_expires_at = ? WHERE id = ?', [sha256hex(token), Date.now() + TOKEN_TTL_MS, user.id]);

    req.session.userId = user.id;
    res.json({ ok: true, token, user: { id: user.id, email: user.email, name: user.name, avatar: user.avatar } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/auth/logout', async (req, res) => {
  try {
    const auth = req.headers['authorization'];
    if (auth && auth.startsWith('Bearer ')) {
      await pool.query('UPDATE users SET token = NULL, token_expires_at = NULL WHERE token = ?', [sha256hex(auth.slice(7))]);
    } else if (req.session?.userId) {
      await pool.query('UPDATE users SET token = NULL, token_expires_at = NULL WHERE id = ?', [req.session.userId]);
    }
  } catch { /* ignore */ }
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
  if (!lessonId || !Number.isInteger(amount) || amount <= 0 || amount > MAX_XP_PER_EVENT) return res.status(400).json({ error: 'Dados inválidos' });

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
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !Number.isInteger(amount) || amount <= 0 || amount > MAX_XP_PER_EVENT || !Number.isInteger(correctCount) || !Number.isInteger(totalCount)) {
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

// ── Onboarding ──────────────────────────────────────────────────────────────────

app.get('/api/onboarding', requireAuth, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      'SELECT goal, confidence, time_commitment, learning_style, interests, completed_at FROM onboarding_preferences WHERE user_id = ?',
      [req.session.userId]
    );
    if (!row) return res.json(null);
    let interests = [];
    try { interests = typeof row.interests === 'string' ? JSON.parse(row.interests) : (row.interests || []); } catch { interests = []; }
    res.json({
      goal: row.goal,
      confidence: row.confidence,
      time: row.time_commitment,
      style: row.learning_style,
      interests,
      completedAt: Number(row.completed_at) || null,
    });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

app.post('/api/onboarding', requireAuth, async (req, res) => {
  const { goal, confidence, time, style, interests } = req.body || {};
  if (!goal || !confidence || !time || !style || !Array.isArray(interests) || !interests.length) {
    return res.status(400).json({ error: 'Preencha todas as etapas' });
  }
  try {
    const now = Date.now();
    const interestsJson = JSON.stringify(interests.map(String).slice(0, 12));
    await pool.query(
      `INSERT INTO onboarding_preferences
         (user_id, goal, confidence, time_commitment, learning_style, interests, completed_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         goal=VALUES(goal), confidence=VALUES(confidence), time_commitment=VALUES(time_commitment),
         learning_style=VALUES(learning_style), interests=VALUES(interests), updated_at=VALUES(updated_at)`,
      [req.session.userId, String(goal).slice(0, 60), String(confidence).slice(0, 80),
       String(time).slice(0, 60), String(style).slice(0, 60), interestsJson, now, now]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro interno' });
  }
});

// ── Admin HTML ────────────────────────────────────────────────────────────────

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&display=swap" rel="stylesheet">
<title>Admin — TrilhaDev</title><style>
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
<img class="logo" src="/logoararadev.jpeg" alt="TrilhaDev">
<h1>TrilhaDev Admin</h1>
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
<title>Admin — TrilhaDev</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--surface:#15233a;--surface2:#1c2f4a;--border:#1e3a54;--green:#58cc02;--blue:#1cb0f6;--gold:#ffc800;--purple:#a974ff;--text:#e8f4ff;--muted:#6b8fa8;--red:#ff5b5b}
html,body{min-height:100%;background:linear-gradient(180deg,#0d1a2e 0%,#091420 40%,#060e18 70%,#04090f 100%);color:var(--text);font-family:'Outfit',-apple-system,system-ui,sans-serif;font-size:15px}
.adm-hdr{position:sticky;top:0;z-index:20;background:rgba(6,14,22,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06);padding:0 24px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.adm-brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:1.1rem;color:var(--green)}
.adm-brand img{width:36px;height:36px;border-radius:50%;border:2px solid var(--green);object-fit:cover}
.adm-actions{display:flex;align-items:center;gap:8px}
.adm-btn{padding:8px 16px;background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:700;font-family:inherit;transition:border-color .15s,color .15s,background .15s;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.adm-btn:hover{border-color:var(--green);color:var(--green)}
.adm-btn.out:hover{border-color:var(--red);color:var(--red)}
.adm-main{max-width:1240px;margin:0 auto;padding:26px 24px 70px}
.adm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(168px,1fr));gap:13px;margin-bottom:18px}
.adm-stat{background:var(--surface);border:1px solid var(--border);border-radius:15px;padding:16px 18px;display:flex;align-items:center;gap:13px}
.adm-stat-ico{width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;flex-shrink:0}
.c-green .adm-stat-ico{background:rgba(88,204,2,.12)} .c-green .adm-stat-n{color:var(--green)}
.c-blue .adm-stat-ico{background:rgba(28,176,246,.12)} .c-blue .adm-stat-n{color:var(--blue)}
.c-gold .adm-stat-ico{background:rgba(255,200,0,.12)} .c-gold .adm-stat-n{color:var(--gold)}
.c-purple .adm-stat-ico{background:rgba(169,116,255,.12)} .c-purple .adm-stat-n{color:var(--purple)}
.adm-stat-n{font-size:1.55rem;font-weight:900;line-height:1.1}
.adm-stat-l{font-size:.68rem;color:var(--muted);margin-top:2px;text-transform:uppercase;letter-spacing:.05em;font-weight:700}
.panel{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px 20px;margin-bottom:18px}
.panel-ttl{font-size:.82rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:16px}
.chart{display:flex;align-items:flex-end;gap:10px;height:120px}
.chart-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end}
.chart-bar{width:100%;max-width:46px;background:linear-gradient(180deg,var(--blue),rgba(28,176,246,.25));border-radius:6px 6px 0 0;min-height:3px;transition:height .4s ease;position:relative}
.chart-bar span{position:absolute;top:-18px;left:50%;transform:translateX(-50%);font-size:.7rem;font-weight:800;color:var(--text)}
.chart-x{font-size:.62rem;color:var(--muted);font-weight:700;white-space:nowrap}
.adm-sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap}
.adm-sec-ttl{font-size:1rem;font-weight:800}.adm-sec-ttl small{color:var(--muted);font-weight:600;font-size:.78rem;margin-left:6px}
.adm-search-wrap{position:relative}
.adm-search-ico{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none;font-size:.85rem}
.adm-search{padding:9px 14px 9px 34px;background:var(--surface);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:.85rem;font-family:inherit;outline:none;width:260px;transition:border-color .15s}
.adm-search:focus{border-color:var(--green)}.adm-search::placeholder{color:var(--muted)}
.adm-tbl-wrap{overflow-x:auto;border-radius:16px;border:1px solid var(--border);background:var(--surface)}
table{width:100%;border-collapse:collapse;min-width:760px}
thead th{background:var(--surface2);padding:12px 16px;text-align:left;font-size:.68rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;font-weight:800;white-space:nowrap;border-bottom:1px solid var(--border);cursor:pointer;user-select:none}
thead th.nosort{cursor:default}
thead th .arr{opacity:.4;font-size:.6rem;margin-left:3px}
thead th.asc .arr,thead th.desc .arr{opacity:1;color:var(--green)}
tbody td{padding:12px 16px;font-size:.85rem;border-top:1px solid rgba(255,255,255,.04);vertical-align:middle;white-space:nowrap}
tbody tr{cursor:pointer}
tbody tr:hover td{background:rgba(88,204,2,.03)}
.user-cell{display:flex;align-items:center;gap:10px}
.avatar{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#58cc02,#3d9100);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:.9rem;color:#06280a;flex-shrink:0;text-transform:uppercase}
.td-name{font-weight:700}.td-email{color:var(--muted);font-size:.78rem}
.xp-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(28,176,246,.1);color:var(--blue);border:1px solid rgba(28,176,246,.2);border-radius:7px;padding:3px 9px;font-size:.76rem;font-weight:800}
.str-badge{display:inline-flex;align-items:center;gap:4px;background:rgba(255,200,0,.1);color:var(--gold);border:1px solid rgba(255,200,0,.2);border-radius:7px;padding:3px 9px;font-size:.76rem;font-weight:800}
.muted{color:var(--muted)}
.act-btns{display:flex;gap:6px}
.icon-btn{width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;background:transparent;border:1px solid var(--border);border-radius:8px;cursor:pointer;font-size:.85rem;transition:all .12s}
.icon-btn:hover{border-color:var(--green)}
.icon-btn.danger:hover{border-color:var(--red);background:rgba(255,91,91,.1)}
.empty-td{color:var(--muted);text-align:center;padding:52px;font-size:.9rem}
#toast{position:fixed;bottom:24px;right:24px;z-index:99;padding:12px 20px;border-radius:12px;font-size:.85rem;font-weight:700;opacity:0;transform:translateY(12px);transition:opacity .25s,transform .25s;pointer-events:none;box-shadow:0 10px 30px rgba(0,0,0,.3)}
#toast.show{opacity:1;transform:translateY(0)}
#toast.ok{background:#162e1a;color:var(--green);border:1px solid rgba(88,204,2,.3)}
#toast.err{background:#3a1818;color:var(--red);border:1px solid rgba(255,91,91,.3)}
.drawer-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:30;opacity:0;pointer-events:none;transition:opacity .2s}
.drawer-bg.open{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;right:0;height:100%;width:420px;max-width:92vw;background:#0e1a2b;border-left:1px solid var(--border);z-index:31;transform:translateX(100%);transition:transform .26s cubic-bezier(.4,0,.2,1);overflow-y:auto;padding:24px}
.drawer.open{transform:translateX(0)}
.drawer-close{position:absolute;top:18px;right:18px;width:32px;height:32px;border:1px solid var(--border);background:transparent;color:var(--muted);border-radius:8px;cursor:pointer;font-size:1rem}
.drawer-close:hover{border-color:var(--red);color:var(--red)}
.d-head{display:flex;align-items:center;gap:14px;margin-bottom:20px}
.d-avatar{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#58cc02,#3d9100);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.5rem;color:#06280a;text-transform:uppercase;flex-shrink:0}
.d-name{font-size:1.2rem;font-weight:800}.d-email{color:var(--muted);font-size:.82rem;word-break:break-all}
.d-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}
.d-stat{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px}
.d-stat-n{font-size:1.3rem;font-weight:900}.d-stat-l{font-size:.66rem;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;font-weight:700;margin-top:2px}
.d-sec{font-size:.74rem;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin:18px 0 10px}
.d-row{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(255,255,255,.05);font-size:.83rem}
.d-row .muted{font-size:.78rem}
.d-badges{display:flex;flex-wrap:wrap;gap:6px}
.d-badge{background:rgba(88,204,2,.1);border:1px solid rgba(88,204,2,.25);color:var(--green);border-radius:7px;padding:3px 9px;font-size:.74rem;font-weight:700}
.d-del{width:100%;margin-top:24px;padding:11px;background:transparent;border:1px solid rgba(255,91,91,.3);color:var(--red);border-radius:10px;cursor:pointer;font-weight:800;font-family:inherit;font-size:.85rem;transition:background .12s}
.d-del:hover{background:rgba(255,91,91,.12)}
@media(max-width:640px){.adm-main{padding:18px 14px 50px}.adm-search{width:100%}.adm-search-wrap{flex:1}}
</style>
</head>
<body>
<header class="adm-hdr">
  <div class="adm-brand"><img src="/logoararadev.jpeg" alt="TrilhaDev">TrilhaDev Admin</div>
  <div class="adm-actions">
    <button class="adm-btn" onclick="load()">↻ Atualizar</button>
    <a class="adm-btn" href="/admin/api/export">⬇ CSV</a>
    <form method="POST" action="/admin/logout" style="display:inline"><button class="adm-btn out" type="submit">Sair →</button></form>
  </div>
</header>
<main class="adm-main">
  <div class="adm-stats">
    <div class="adm-stat c-green"><div class="adm-stat-ico">👥</div><div><div class="adm-stat-n" id="st-u">–</div><div class="adm-stat-l">Usuários</div></div></div>
    <div class="adm-stat c-green"><div class="adm-stat-ico">🟢</div><div><div class="adm-stat-n" id="st-act">–</div><div class="adm-stat-l">Ativos (7d)</div></div></div>
    <div class="adm-stat c-purple"><div class="adm-stat-ico">✨</div><div><div class="adm-stat-n" id="st-new">–</div><div class="adm-stat-l">Novos (7d)</div></div></div>
    <div class="adm-stat c-blue"><div class="adm-stat-ico">⚡</div><div><div class="adm-stat-n" id="st-x">–</div><div class="adm-stat-l">XP Total</div></div></div>
    <div class="adm-stat c-gold"><div class="adm-stat-ico">📚</div><div><div class="adm-stat-n" id="st-l">–</div><div class="adm-stat-l">Lições</div></div></div>
    <div class="adm-stat c-purple"><div class="adm-stat-ico">🎯</div><div><div class="adm-stat-n" id="st-d">–</div><div class="adm-stat-l">Desafios</div></div></div>
  </div>
  <div class="panel">
    <div class="panel-ttl">Cadastros — últimas 8 semanas</div>
    <div class="chart" id="chart"></div>
  </div>
  <div class="adm-sec-hdr">
    <span class="adm-sec-ttl">Usuários <small id="count"></small></span>
    <div class="adm-search-wrap"><span class="adm-search-ico">🔍</span><input class="adm-search" id="search" type="search" placeholder="Buscar nome ou email…" oninput="filter()"></div>
  </div>
  <div class="adm-tbl-wrap">
    <table>
      <thead><tr>
        <th data-k="name">Usuário<span class="arr">▼</span></th>
        <th data-k="xp">XP<span class="arr">▼</span></th>
        <th data-k="streak">Streak<span class="arr">▼</span></th>
        <th data-k="lessons">Lições<span class="arr">▼</span></th>
        <th data-k="lastActive">Último acesso<span class="arr">▼</span></th>
        <th data-k="created_at">Cadastro<span class="arr">▼</span></th>
        <th class="nosort"></th>
      </tr></thead>
      <tbody id="tbody"><tr><td colspan="7" class="empty-td">Carregando…</td></tr></tbody>
    </table>
  </div>
</main>
<div id="toast"></div>
<div class="drawer-bg" id="drawerBg" onclick="closeDrawer()"></div>
<aside class="drawer" id="drawer"><button class="drawer-close" onclick="closeDrawer()">✕</button><div id="drawerBody"></div></aside>
<script>
let all=[], sortKey='created_at', sortDir=-1;
const fmtD=ts=>ts?new Date(Number(ts)).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'2-digit'}):'—';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ago=ts=>{if(!ts)return'nunca';const d=Date.now()-Number(ts);const m=Math.floor(d/60000),h=Math.floor(d/3600000),dy=Math.floor(d/86400000);if(m<1)return'agora';if(m<60)return m+'min';if(h<24)return h+'h';if(dy<30)return dy+'d';return fmtD(ts)};
function toast(m,t='ok'){const e=document.getElementById('toast');e.textContent=m;e.className='show '+t;setTimeout(()=>{e.className=''},3000)}
function drawChart(b){
  const max=Math.max(1,...b);
  document.getElementById('chart').innerHTML=b.map((n,i)=>{
    const wk=b.length-1-i;const lbl=wk===0?'agora':wk+'sem';
    return \`<div class="chart-col"><div class="chart-bar" style="height:\${Math.round(n/max*100)}%">\${n>0?'<span>'+n+'</span>':''}</div><div class="chart-x">\${lbl}</div></div>\`;
  }).join('');
}
function setSort(k){if(sortKey===k)sortDir*=-1;else{sortKey=k;sortDir=k==='name'?1:-1}filter()}
function sortRows(rows){
  return rows.slice().sort((a,b)=>{
    let x=a[sortKey],y=b[sortKey];
    if(sortKey==='name'){x=(x||'').toLowerCase();y=(y||'').toLowerCase();return x<y?-sortDir:x>y?sortDir:0}
    return(Number(x||0)-Number(y||0))*sortDir;
  });
}
function render(rows){
  document.querySelectorAll('thead th[data-k]').forEach(th=>{th.classList.remove('asc','desc');if(th.dataset.k===sortKey)th.classList.add(sortDir>0?'asc':'desc')});
  const tb=document.getElementById('tbody');
  if(!rows.length){tb.innerHTML='<tr><td colspan="7" class="empty-td">Nenhum usuário encontrado.</td></tr>';return}
  tb.innerHTML=sortRows(rows).map(u=>\`<tr onclick="openUser('\${u.id}')">
    <td><div class="user-cell"><div class="avatar">\${esc((u.name||'?').charAt(0))}</div><div><div class="td-name">\${esc(u.name)}</div><div class="td-email">\${esc(u.email)}</div></div></div></td>
    <td><span class="xp-badge">⚡ \${(u.xp||0).toLocaleString('pt-BR')}</span></td>
    <td><span class="str-badge">🔥 \${u.streak||0}</span></td>
    <td>\${u.lessons||0}</td>
    <td class="muted">\${ago(u.lastActive)}</td>
    <td class="muted">\${fmtD(u.created_at)}</td>
    <td><div class="act-btns"><button class="icon-btn" title="Ver" onclick="event.stopPropagation();openUser('\${u.id}')">👁</button><button class="icon-btn danger" title="Deletar" onclick="event.stopPropagation();del('\${u.id}','\${esc(u.name)}')">🗑</button></div></td>
  </tr>\`).join('');
}
function filter(){
  const q=document.getElementById('search').value.toLowerCase();
  const f=all.filter(u=>(u.name||'').toLowerCase().includes(q)||(u.email||'').toLowerCase().includes(q));
  document.getElementById('count').textContent='('+f.length+')';
  render(f);
}
async function openUser(id){
  const bg=document.getElementById('drawerBg'),dr=document.getElementById('drawer');
  bg.classList.add('open');dr.classList.add('open');
  document.getElementById('drawerBody').innerHTML='<p class="muted" style="margin-top:40px">Carregando…</p>';
  try{
    const u=await fetch('/admin/api/users/'+id).then(r=>r.json());
    if(u.error)throw new Error(u.error);
    const badges=(u.badges||[]).length?u.badges.map(b=>'<span class="d-badge">'+esc(b)+'</span>').join(''):'<span class="muted">nenhuma</span>';
    const less=(u.recentLessons||[]).length?u.recentLessons.map(l=>\`<div class="d-row"><span>\${esc(l.id)}</span><span class="muted">\${l.at?fmtD(l.at):''} · +\${l.xp}xp</span></div>\`).join(''):'<p class="muted" style="font-size:.82rem">Nenhuma lição registrada.</p>';
    document.getElementById('drawerBody').innerHTML=\`
      <div class="d-head"><div class="d-avatar">\${esc((u.name||'?').charAt(0))}</div><div><div class="d-name">\${esc(u.name)}</div><div class="d-email">\${esc(u.email)}</div></div></div>
      <div class="d-grid">
        <div class="d-stat"><div class="d-stat-n" style="color:var(--blue)">\${(u.xp||0).toLocaleString('pt-BR')}</div><div class="d-stat-l">XP total</div></div>
        <div class="d-stat"><div class="d-stat-n" style="color:var(--gold)">🔥 \${u.streak||0}</div><div class="d-stat-l">Streak</div></div>
        <div class="d-stat"><div class="d-stat-n" style="color:var(--green)">\${u.totalLessons||0}</div><div class="d-stat-l">Lições</div></div>
        <div class="d-stat"><div class="d-stat-n" style="color:var(--purple)">\${u.dailyChallenges||0}</div><div class="d-stat-l">Desafios</div></div>
      </div>
      <div class="d-row"><span class="muted">Cadastro</span><span>\${fmtD(u.created_at)}</span></div>
      <div class="d-row"><span class="muted">Último acesso</span><span>\${ago(u.lastActive)}</span></div>
      <div class="d-sec">Conquistas</div><div class="d-badges">\${badges}</div>
      <div class="d-sec">Lições recentes</div>\${less}
      <button class="d-del" onclick="del('\${u.id}','\${esc(u.name)}',true)">Deletar usuário</button>\`;
  }catch(e){document.getElementById('drawerBody').innerHTML='<p class="muted" style="margin-top:40px">Erro ao carregar detalhes.</p>'}
}
function closeDrawer(){document.getElementById('drawerBg').classList.remove('open');document.getElementById('drawer').classList.remove('open')}
async function del(id,name,fromDrawer){
  if(!confirm('Deletar "'+name+'" e todo o progresso? Esta ação é permanente.'))return;
  const r=await fetch('/admin/api/users/'+id,{method:'DELETE'});
  const j=await r.json();
  if(j.ok){all=all.filter(u=>u.id!==id);filter();if(fromDrawer)closeDrawer();toast('Usuário deletado.')}
  else toast('Erro: '+(j.error||'falhou'),'err');
}
async function load(){
  try{
    const[stats,users]=await Promise.all([fetch('/admin/api/stats').then(r=>r.json()),fetch('/admin/api/users').then(r=>r.json())]);
    if(stats.error||users.error)throw new Error('api');
    document.getElementById('st-u').textContent=stats.totalUsers;
    document.getElementById('st-act').textContent=stats.activeUsers;
    document.getElementById('st-new').textContent=stats.newUsers;
    document.getElementById('st-x').textContent=(stats.totalXp||0).toLocaleString('pt-BR');
    document.getElementById('st-l').textContent=stats.totalLessons;
    document.getElementById('st-d').textContent=stats.totalDaily;
    drawChart(stats.signups||[]);
    all=users;filter();
  }catch(e){document.getElementById('tbody').innerHTML='<tr><td colspan="7" class="empty-td">Erro ao carregar dados.</td></tr>'}
}
document.querySelectorAll('thead th[data-k]').forEach(th=>th.onclick=()=>setSort(th.dataset.k));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
load();
</script>
</body></html>`;

// ── Admin routes ──────────────────────────────────────────────────────────────

app.get('/admin', (req, res) => {
  if (req.session?.isAdmin) return res.redirect('/admin/dashboard');
  res.send(LOGIN_HTML);
});

app.post('/admin/login', adminLoginLimiter, (req, res) => {
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

// Parse defensivo do JSON de progress (coluna pode vir string ou objeto)
function parseProgress(data) {
  if (!data) return {};
  if (typeof data !== 'string') return data;
  try { return JSON.parse(data); } catch { return {}; }
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

app.get('/admin/api/stats', requireAdmin, async (req, res) => {
  try {
    const weekAgo = Date.now() - WEEK_MS;
    const [[{ totalUsers }]]   = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalXp }]]      = await pool.query('SELECT COALESCE(SUM(amount), 0) AS totalXp FROM xp_events');
    const [[{ totalLessons }]] = await pool.query('SELECT COUNT(*) AS totalLessons FROM lesson_completions');
    const [[{ totalDaily }]]   = await pool.query('SELECT COUNT(*) AS totalDaily FROM daily_challenges');
    const [[{ newUsers }]]     = await pool.query('SELECT COUNT(*) AS newUsers FROM users WHERE created_at >= ?', [weekAgo]);
    const [[{ activeUsers }]]  = await pool.query('SELECT COUNT(*) AS activeUsers FROM progress WHERE updated_at >= ?', [weekAgo]);

    // Cadastros por semana (últimas 8) pro gráfico
    const [signupRows] = await pool.query('SELECT created_at FROM users');
    const weeks = 8, now = Date.now();
    const buckets = Array.from({ length: weeks }, () => 0);
    for (const r of signupRows) {
      const idx = weeks - 1 - Math.floor((now - Number(r.created_at)) / WEEK_MS);
      if (idx >= 0 && idx < weeks) buckets[idx]++;
    }

    res.json({
      totalUsers, totalXp: Number(totalXp), totalLessons,
      totalDaily, newUsers, activeUsers, signups: buckets,
    });
  } catch (e) {
    res.status(503).json({ error: 'Banco indisponível' });
  }
});

// Agrega em JS (evita JOIN entre colunas de collations diferentes)
async function buildUserRows() {
  const [users]    = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
  const [xpRows]   = await pool.query('SELECT user_id, SUM(amount) AS xp FROM xp_events GROUP BY user_id');
  const [lsRows]   = await pool.query('SELECT user_id, COUNT(*) AS lessons FROM lesson_completions GROUP BY user_id');
  const [progRows] = await pool.query('SELECT user_id, data, updated_at FROM progress');
  const xp = {}, ls = {}, pr = {}, act = {};
  for (const r of xpRows) xp[r.user_id] = Number(r.xp || 0);
  for (const r of lsRows) ls[r.user_id] = Number(r.lessons || 0);
  for (const r of progRows) { pr[r.user_id] = parseProgress(r.data); act[r.user_id] = Number(r.updated_at || 0); }
  return users.map(u => {
    const p = pr[u.id] || {};
    return {
      id: u.id, name: u.name, email: u.email,
      xp: xp[u.id] || Number(p.xp) || 0,
      streak: p.streak?.count || 0,
      lessons: ls[u.id] || Object.keys(p.completed || {}).length,
      lastActive: act[u.id] || null,
      created_at: u.created_at,
    };
  });
}

app.get('/admin/api/users', requireAdmin, async (req, res) => {
  try {
    res.json(await buildUserRows());
  } catch (e) {
    res.status(503).json({ error: 'Banco indisponível' });
  }
});

app.get('/admin/api/users/:userId', requireAdmin, async (req, res) => {
  try {
    const [[user]] = await pool.query('SELECT id, name, email, avatar, created_at FROM users WHERE id = ?', [req.params.userId]);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    const [[prog]]   = await pool.query('SELECT data, updated_at FROM progress WHERE user_id = ?', [req.params.userId]);
    const [[{ xp }]] = await pool.query('SELECT COALESCE(SUM(amount), 0) AS xp FROM xp_events WHERE user_id = ?', [req.params.userId]);
    const [[{ daily }]] = await pool.query('SELECT COUNT(*) AS daily FROM daily_challenges WHERE user_id = ?', [req.params.userId]);
    const [lessons] = await pool.query('SELECT lesson_id, xp, completed_at FROM lesson_completions WHERE user_id = ? ORDER BY completed_at DESC LIMIT 25', [req.params.userId]);
    const p = prog ? parseProgress(prog.data) : {};
    res.json({
      id: user.id, name: user.name, email: user.email, avatar: user.avatar, created_at: user.created_at,
      lastActive: prog ? Number(prog.updated_at) : null,
      xp: Number(xp) || Number(p.xp) || 0,
      streak: p.streak?.count || 0,
      badges: p.badges || [],
      totalLessons: lessons.length,
      dailyChallenges: daily,
      recentLessons: lessons.map(l => ({ id: l.lesson_id, xp: l.xp, at: Number(l.completed_at) })),
    });
  } catch (e) {
    res.status(503).json({ error: 'Banco indisponível' });
  }
});

app.get('/admin/api/export', requireAdmin, async (req, res) => {
  try {
    const rows = await buildUserRows();
    const esc = v => {
      let s = String(v ?? '');
      // neutraliza CSV/formula injection (nome tipo "=HYPERLINK(..)" no Excel)
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const out = ['Nome,Email,XP,Streak,Licoes,UltimoAcesso,Cadastro'];
    for (const u of rows) {
      out.push([
        esc(u.name), esc(u.email), u.xp, u.streak, u.lessons,
        esc(u.lastActive ? new Date(u.lastActive).toISOString() : ''),
        esc(new Date(Number(u.created_at)).toISOString()),
      ].join(','));
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="araradev-usuarios.csv"');
    res.send('﻿' + out.join('\r\n'));
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

app.listen(PORT, () => console.log(`TrilhaDev running → http://localhost:${PORT}`));
