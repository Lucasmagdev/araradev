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

// ── Admin HTML ────────────────────────────────────────────────────────────────

const LOGIN_HTML = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin</title><style>
*{box-sizing:border-box;margin:0;padding:0}body{background:#0a0f0a;color:#e0e0e0;font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:#111;border:1px solid #1e3a1e;border-radius:12px;padding:40px;width:100%;max-width:360px}
h1{color:#58cc02;font-size:1.2rem;margin-bottom:24px;text-align:center}
input{display:block;width:100%;padding:10px 14px;margin-bottom:14px;background:#1a2e1a;border:1px solid #2a4a2a;border-radius:8px;color:#e0e0e0;font-size:1rem;outline:none}
input:focus{border-color:#58cc02}button{display:block;width:100%;padding:12px;background:#58cc02;color:#000;font-weight:700;border:none;border-radius:8px;font-size:1rem;cursor:pointer}
button:hover{background:#4ab301}.err{color:#ff4b4b;font-size:.85rem;margin-top:12px;text-align:center}
</style></head><body><div class="card"><h1>🦜 AraraDev Admin</h1>
<form method="POST" action="/admin/login">
<input type="text" name="username" placeholder="Usuário" autocomplete="off" required>
<input type="password" name="password" placeholder="Senha" required>
<button type="submit">Entrar</button></form></div></body></html>`;

const LOGIN_ERROR_HTML = LOGIN_HTML.replace('<button type="submit">', '<p class="err">Credenciais inválidas.</p><button type="submit">');

const DASHBOARD_HTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin — AraraDev</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#070d0b;--surface:#0d1a14;--surface2:#132118;--border:#1a3326;--green:#58cc02;--text:#d4ede2;--muted:#5e8870;--red:#ff4b4b}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,system-ui,"Segoe UI",sans-serif;font-size:15px}
.adm-hdr{position:sticky;top:0;z-index:10;background:rgba(7,13,11,.92);backdrop-filter:blur(14px);border-bottom:1px solid var(--border);padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between}
.adm-brand{display:flex;align-items:center;gap:9px;font-weight:800;font-size:1.05rem;color:var(--green)}
.adm-out{padding:7px 16px;background:transparent;border:1px solid var(--border);color:var(--muted);border-radius:8px;cursor:pointer;font-size:.82rem;font-family:inherit;transition:border-color .15s,color .15s}
.adm-out:hover{border-color:var(--red);color:var(--red)}
.adm-main{max-width:1200px;margin:0 auto;padding:28px 24px}
.adm-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:28px}
.adm-stat{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:20px 22px;position:relative;overflow:hidden}
.adm-stat::after{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--green),transparent)}
.adm-stat-ico{font-size:1.4rem;margin-bottom:10px;line-height:1}
.adm-stat-n{font-size:1.9rem;font-weight:800;color:var(--green);line-height:1}
.adm-stat-l{font-size:.72rem;color:var(--muted);margin-top:5px;text-transform:uppercase;letter-spacing:.06em}
.adm-sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:12px;flex-wrap:wrap}
.adm-sec-ttl{font-size:.95rem;font-weight:700;color:var(--text)}
.adm-search{padding:8px 14px;background:var(--surface);border:1px solid var(--border);border-radius:8px;color:var(--text);font-size:.82rem;font-family:inherit;outline:none;width:220px;transition:border-color .15s}
.adm-search:focus{border-color:var(--green)}
.adm-search::placeholder{color:var(--muted)}
.adm-tbl-wrap{overflow-x:auto;border-radius:14px;border:1px solid var(--border);background:var(--surface)}
table{width:100%;border-collapse:collapse}
thead th{background:var(--surface2);padding:10px 14px;text-align:left;font-size:.7rem;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:700;white-space:nowrap;border-bottom:1px solid var(--border)}
tbody td{padding:11px 14px;font-size:.83rem;border-top:1px solid rgba(26,51,38,.6);vertical-align:middle}
tbody tr:hover td{background:rgba(88,204,2,.025)}
.td-name{font-weight:600;color:var(--text)}
.td-email{color:var(--muted);font-size:.78rem}
.xp-badge{display:inline-flex;align-items:center;gap:3px;background:rgba(88,204,2,.1);color:var(--green);border:1px solid rgba(88,204,2,.2);border-radius:6px;padding:2px 8px;font-size:.76rem;font-weight:700}
.str-badge{display:inline-flex;align-items:center;gap:3px;background:rgba(255,192,46,.08);color:#ffc02e;border:1px solid rgba(255,192,46,.18);border-radius:6px;padding:2px 8px;font-size:.76rem;font-weight:700}
.del-btn{padding:4px 10px;background:transparent;border:1px solid rgba(255,75,75,.22);color:var(--red);border-radius:6px;cursor:pointer;font-size:.74rem;font-family:inherit;transition:background .12s,border-color .12s}
.del-btn:hover{background:rgba(255,75,75,.1);border-color:var(--red)}
.empty-td{color:var(--muted);text-align:center;padding:44px;font-size:.88rem}
#toast{position:fixed;bottom:24px;right:24px;z-index:99;padding:11px 18px;border-radius:10px;font-size:.82rem;font-weight:600;opacity:0;transform:translateY(8px);transition:opacity .2s,transform .2s;pointer-events:none}
#toast.show{opacity:1;transform:translateY(0)}
#toast.ok{background:#1a3a24;color:var(--green);border:1px solid #2a5a34}
#toast.err{background:#3a1a1a;color:var(--red);border:1px solid #5a2a2a}
</style>
</head>
<body>
<header class="adm-hdr">
  <div class="adm-brand">🦜 AraraDev Admin</div>
  <form method="POST" action="/admin/logout"><button class="adm-out" type="submit">Sair →</button></form>
</header>
<main class="adm-main">
  <div class="adm-stats">
    <div class="adm-stat"><div class="adm-stat-ico">👤</div><div class="adm-stat-n" id="st-u">–</div><div class="adm-stat-l">Usuários</div></div>
    <div class="adm-stat"><div class="adm-stat-ico">⚡</div><div class="adm-stat-n" id="st-x">–</div><div class="adm-stat-l">XP Total</div></div>
    <div class="adm-stat"><div class="adm-stat-ico">📚</div><div class="adm-stat-n" id="st-l">–</div><div class="adm-stat-l">Lições concluídas</div></div>
  </div>
  <div class="adm-sec-hdr">
    <span class="adm-sec-ttl">Usuários cadastrados</span>
    <input class="adm-search" id="search" type="search" placeholder="Buscar nome ou email…" oninput="filter()">
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
    <td class="td-name">\${esc(u.name)}</td>
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
  const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
  const [rows] = await pool.query('SELECT data FROM progress');
  let totalXp = 0, totalLessons = 0;
  for (const row of rows) {
    const d = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
    totalXp      += d?.xp || 0;
    totalLessons += Object.keys(d?.completed || {}).length;
  }
  res.json({ totalUsers, totalXp, totalLessons });
});

app.get('/admin/api/users', requireAdmin, async (req, res) => {
  const [users]    = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY created_at DESC');
  const [progress] = await pool.query('SELECT user_id, data FROM progress');
  const progMap = {};
  for (const p of progress) progMap[p.user_id] = typeof p.data === 'string' ? JSON.parse(p.data) : p.data;
  res.json(users.map(u => {
    const p = progMap[u.id] || {};
    return { id: u.id, name: u.name, email: u.email, xp: p.xp || 0, streak: p.streak?.count || 0, lessons: Object.keys(p.completed || {}).length, created_at: u.created_at };
  }));
});

app.delete('/admin/api/users/:userId', requireAdmin, async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.userId]);
  res.json({ ok: true });
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
