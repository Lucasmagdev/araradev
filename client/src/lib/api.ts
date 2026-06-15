import { Capacitor } from '@capacitor/core';
import type { Progress, User } from '../types';

export const API_BASE = Capacitor.isNativePlatform()
  ? 'http://80.241.218.217:3008'
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

export function getMe() {
  return req<User>('/api/me');
}

export function getProgress() {
  return req<Progress | null>('/api/progress');
}

export function saveProgressRemote(progress: Progress) {
  return req<{ ok: boolean }>('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress),
  }).catch(() => {});
}
