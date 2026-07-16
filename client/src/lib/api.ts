import { Capacitor } from '@capacitor/core';
import type { OnboardingPreferences, Progress, RankingEntry, User } from '../types';

export const API_BASE = Capacitor.isNativePlatform()
  ? 'https://trilhadev.app.br'
  : (import.meta.env.VITE_API_BASE || '');

const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: 'Bearer ' + token, ...extra } : { ...extra };
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(API_BASE + path, {
    ...opts,
    headers: authHeaders(opts.headers as Record<string, string>),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || 'Erro de conexão');
  return data as T;
}

// ---- Fila offline ----
// Escritas que falham (sem rede, API fora) entram numa fila no localStorage e
// são reenviadas em flushPending() — chamado no evento 'online', quando o app
// volta pro foreground e após o load inicial. Erros 4xx não entram na fila
// (reenviar não resolve); só falha de rede/5xx.
const QUEUE_KEY = 'pc_sync_queue_v1';
const QUEUE_MAX = 200;

interface PendingOp {
  path: string;
  body: unknown;
  at: number;
}

function readQueue(): PendingOp[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fila corrompida: descarta */ }
  return [];
}

function writeQueue(ops: PendingOp[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(ops.slice(-QUEUE_MAX)));
}

function enqueue(path: string, body: unknown) {
  // snapshot de progresso: só o mais recente importa — remove os anteriores
  const base = path === '/api/progress'
    ? readQueue().filter(op => op.path !== '/api/progress')
    : readQueue();
  writeQueue([...base, { path, body, at: Date.now() }]);
}

async function postOrQueue(path: string, body: unknown): Promise<void> {
  try {
    await req(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    // 4xx vem como Error com mensagem do servidor; falha de rede vem como
    // TypeError do fetch. Só enfileira o que tem chance de funcionar depois.
    if (e instanceof TypeError) enqueue(path, body);
  }
}

let flushing = false;
export async function flushPending(): Promise<void> {
  if (flushing) return;
  flushing = true;
  try {
    let ops = readQueue();
    while (ops.length > 0) {
      const op = ops[0];
      try {
        await req(op.path, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(op.body),
        });
      } catch (e) {
        if (e instanceof TypeError) break; // ainda sem rede: para e tenta depois
        // erro do servidor (4xx): descarta a op, não trava a fila
      }
      ops = ops.slice(1);
      writeQueue(ops);
    }
  } finally {
    flushing = false;
  }
}

export interface AuthResponse {
  ok: boolean;
  token: string;
  user: User;
}

export function login(email: string, password: string) {
  return req<AuthResponse>('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

export function register(name: string, email: string, password: string) {
  return req<AuthResponse>('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export function logout() {
  return req<{ ok: boolean }>('/auth/logout', { method: 'POST' }).catch(() => {});
}

export function forgotPassword(email: string) {
  return req<{ ok: boolean }>('/auth/forgot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(email: string, code: string, password: string) {
  return req<{ ok: boolean }>('/auth/reset', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password }),
  });
}

export function getMe() {
  return req<User>('/api/me');
}

export function getProgress() {
  return req<Progress | null>('/api/progress');
}

export function saveProgressRemote(progress: Progress) {
  return postOrQueue('/api/progress', progress);
}

export function recordLessonCompletion(lessonId: string, xp: number) {
  return postOrQueue('/api/lesson-completions', { lessonId, xp });
}

export function recordDailyChallenge(date: string, correct: number, total: number, xp: number) {
  return postOrQueue('/api/daily-challenges', { date, correct, total, xp });
}

export function getRanking(period: 'global' | 'weekly' | 'monthly', track?: string) {
  const q = track ? `?period=${period}&track=${track}` : `?period=${period}`;
  return req<RankingEntry[]>(`/api/ranking${q}`);
}

export function getOnboardingPreferences() {
  return req<OnboardingPreferences | null>('/api/onboarding');
}

export function saveOnboardingPreferences(preferences: OnboardingPreferences) {
  return req<{ ok: boolean }>('/api/onboarding', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  });
}
