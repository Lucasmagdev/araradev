'use strict';
// Cadastra usuários de teste + progresso simulado no VPS
// Uso: node api/seed.js

const API = 'http://80.241.218.217:3008';

const USERS = [
  { name: 'Lucas Teste',    email: 'lucas.teste@araradev.com',  password: 'teste123' },
  { name: 'Ana Programadora', email: 'ana@araradev.com',        password: 'teste123' },
  { name: 'Pedro Iniciante',  email: 'pedro@araradev.com',      password: 'teste123' },
  { name: 'Maria Silva',      email: 'maria@araradev.com',      password: 'teste123' },
  { name: 'João Dev',         email: 'joao@araradev.com',       password: 'teste123' },
];

// Simula progresso variado pra cada usuário
const PROGRESS = [
  { xp: 480, streak: { count: 7,  lastDate: today() }, completed: lessons(12), badges: ['first','streak3'] },
  { xp: 220, streak: { count: 3,  lastDate: today() }, completed: lessons(6),  badges: ['first'] },
  { xp: 60,  streak: { count: 1,  lastDate: today() }, completed: lessons(2),  badges: [] },
  { xp: 910, streak: { count: 14, lastDate: today() }, completed: lessons(22), badges: ['first','streak3','streak7','lessons5','lessons10','lessons20'] },
  { xp: 140, streak: { count: 0,  lastDate: null },    completed: lessons(4),  badges: ['first'] },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function lessons(n) {
  const ids = ['var1','cond1','loop1','acc1','acc2','func1','str1','arr1','log1','loop2','str2','arr2',
    'arr3','arr4','obj1','obj2','rec1','rec2','rec3','algo1','algo2','algo3'];
  return Object.fromEntries(ids.slice(0, n).map(id => [id, true]));
}

async function register(user) {
  const r = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error);
  return j.token;
}

async function saveProgress(token, progress) {
  const r = await fetch(`${API}/api/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({
      ...progress,
      avatar: '🦜',
      nome: '',
      credits: { current: 5, max: 5, nextRechargeAt: null },
      code: {},
    }),
  });
  if (!r.ok) throw new Error('progress save failed');
}

(async () => {
  for (let i = 0; i < USERS.length; i++) {
    const u = USERS[i];
    try {
      const token = await register(u);
      await saveProgress(token, PROGRESS[i]);
      console.log(`✓ ${u.name} (${u.xp ?? PROGRESS[i].xp} XP)`);
    } catch (e) {
      console.log(`✗ ${u.name}: ${e.message}`);
    }
  }
  console.log('\nDone. Acessa /admin pra ver os dados.');
})();
