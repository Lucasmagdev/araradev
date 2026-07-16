import type { Lesson, Progress } from '../types';
import { LESSONS } from '../data/lessons';
import { ALL_LESSONS } from '../data/tracks';

export const MAX_CREDITS = 4;
export const CREDIT_RECHARGE_MS = 48 * 60 * 60 * 1000;

export interface Badge {
  id: string;
  icon: string;
  name: string;
  check: (p: Progress) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'first-lesson',   icon: '🌱', name: 'Primeira lição',   check: (p) => Object.keys(p.completed).length >= 1 },
  { id: 'ten-lessons',    icon: '📚', name: '10 lições',         check: (p) => Object.keys(p.completed).length >= 10 },
  { id: 'thirty-lessons', icon: '🎯', name: '30 lições',         check: (p) => Object.keys(p.completed).length >= 30 },
  { id: 'fifty-lessons',  icon: '🏆', name: '50 lições',         check: (p) => Object.keys(p.completed).length >= 50 },
  { id: 'all-lessons',    icon: '🦜', name: 'TrilhaDev Master',   check: (p) => Object.keys(p.completed).length >= ALL_LESSONS.length },
  { id: 'streak-3',       icon: '🔥', name: 'Streak 3 dias',     check: (p) => p.streak.count >= 3 },
  { id: 'streak-7',       icon: '⚡', name: 'Streak 7 dias',     check: (p) => p.streak.count >= 7 },
  { id: 'correct-25',      icon: '✅', name: '25 acertos',          check: (p) => p.stats.correctAnswers >= 25 },
  { id: 'correct-100',     icon: '🎯', name: '100 acertos',         check: (p) => p.stats.correctAnswers >= 100 },
  { id: 'daily-first',     icon: '📅', name: 'Primeiro diário',     check: (p) => !!p.dailyChallenge.completed },
  { id: 'xp-50',          icon: '⭐', name: '50 XP',             check: (p) => p.xp >= 50 },
  { id: 'xp-200',         icon: '💎', name: '200 XP',            check: (p) => p.xp >= 200 },
  { id: 'xp-500',         icon: '🚀', name: '500 XP',            check: (p) => p.xp >= 500 },
  { id: 'xp-1000',        icon: '🏅', name: '1000 XP',           check: (p) => p.xp >= 1000 },
  { id: 'coder',          icon: '💻', name: 'Programador',       check: (p) => ALL_LESSONS.filter(l => l.type === 'code' && p.completed[l.id]).length >= 5 },
  { id: 'async-dev',      icon: '⏳', name: 'Async Dev',         check: (p) => ALL_LESSONS.filter(l => l.id.startsWith('async-') && p.completed[l.id]).length >= 6 },
  { id: 'react-dev',      icon: '⚛️', name: 'React Dev',          check: (p) => ALL_LESSONS.filter(l => l.id.startsWith('react-') && p.completed[l.id]).length >= 6 },
  { id: 'phase-1',         icon: '🏁', name: 'Fase 1 completa',     check: (p) => isUnitComplete(p, 'Fase 1') },
  { id: 'phase-4',         icon: '🧠', name: 'Algoritmos',          check: (p) => isUnitComplete(p, 'Fase 4') },
];

export interface Level {
  min: number;
  max: number;
  name: string;
  next: number | null;
}

export const LEVELS: Level[] = [
  { min: 0,    max: 99,        name: 'Iniciante',     next: 100 },
  { min: 100,  max: 249,       name: 'Aprendiz',      next: 250 },
  { min: 250,  max: 499,       name: 'Desenvolvedor', next: 500 },
  { min: 500,  max: 999,       name: 'Programador',   next: 1000 },
  { min: 1000, max: Infinity,  name: 'Mestre',        next: null },
];

export function getLevel(xp: number): Level {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) || LEVELS[0];
}

export function emptyProgress(): Progress {
  return {
    completed: {},
    code: {},
    xp: 0,
    streak: { count: 0, lastDate: null },
    badges: [],
    nome: '',
    avatar: '🦜',
    credits: { current: MAX_CREDITS, max: MAX_CREDITS, nextRechargeAt: null },
    xpEvents: [],
    stats: { correctAnswers: 0, codeExercisesPassed: 0 },
    dailyChallenge: { date: null, completed: false, correct: 0, total: 0 },
  };
}

export function rechargeCredits(progress: Progress, now = Date.now()): Progress {
  if (!progress.credits.nextRechargeAt || now < progress.credits.nextRechargeAt) return progress;
  return {
    ...progress,
    credits: {
      ...progress.credits,
      current: progress.credits.max,
      nextRechargeAt: null,
    },
  };
}

export function normalizeProgress(progress: Partial<Progress> | null | undefined): Progress {
  const base = emptyProgress();
  const merged = { ...base, ...(progress || {}) };
  const credits = { ...base.credits, ...(progress?.credits || {}) };
  const stats = { ...base.stats, ...(progress?.stats || {}) };
  const dailyChallenge = { ...base.dailyChallenge, ...(progress?.dailyChallenge || {}) };
  // max sempre = MAX_CREDITS (constante global). Migra quem salvou max antigo (ex: 5 -> 4).
  merged.credits = {
    current: Math.max(0, Math.min(credits.current, MAX_CREDITS)),
    max: MAX_CREDITS,
    nextRechargeAt: credits.nextRechargeAt || null,
  };
  merged.stats = stats;
  merged.dailyChallenge = dailyChallenge;
  merged.xpEvents = Array.isArray(progress?.xpEvents) ? progress.xpEvents : [];
  return rechargeCredits(merged);
}

// Merge local × remoto sem perder progresso feito offline: união do que foi
// concluído, máximo de XP/stats, streak mais recente. Créditos: o menor valor
// vence (conservador — evita "farmar" vida trocando de dispositivo).
export function mergeProgress(local: Progress, remote: Progress): Progress {
  const completed = { ...remote.completed, ...local.completed };
  const badges = Array.from(new Set([...remote.badges, ...local.badges]));

  const lt = local.streak.lastDate ? new Date(local.streak.lastDate).getTime() : 0;
  const rt = remote.streak.lastDate ? new Date(remote.streak.lastDate).getTime() : 0;
  const streak = lt === rt
    ? { count: Math.max(local.streak.count, remote.streak.count), lastDate: local.streak.lastDate }
    : lt > rt ? { ...local.streak } : { ...remote.streak };

  const seen = new Set(remote.xpEvents.map(e => `${e.source}@${e.at}`));
  const xpEvents = [
    ...remote.xpEvents,
    ...local.xpEvents.filter(e => !seen.has(`${e.source}@${e.at}`)),
  ].sort((a, b) => a.at - b.at);

  const dl = local.dailyChallenge;
  const dr = remote.dailyChallenge;
  // datas em ISO (yyyy-mm-dd): comparação de string funciona
  const dailyChallenge = (dl.date || '') === (dr.date || '')
    ? { date: dl.date, completed: dl.completed || dr.completed, correct: Math.max(dl.correct, dr.correct), total: dl.total || dr.total }
    : (dl.date || '') > (dr.date || '') ? { ...dl } : { ...dr };

  return normalizeProgress({
    completed,
    code: { ...remote.code, ...local.code },
    xp: Math.max(local.xp, remote.xp),
    streak,
    badges,
    nome: local.nome || remote.nome,
    avatar: local.avatar || remote.avatar,
    credits: local.credits.current <= remote.credits.current ? { ...local.credits } : { ...remote.credits },
    xpEvents,
    stats: {
      correctAnswers: Math.max(local.stats.correctAnswers, remote.stats.correctAnswers),
      codeExercisesPassed: Math.max(local.stats.codeExercisesPassed, remote.stats.codeExercisesPassed),
    },
    dailyChallenge,
  });
}

export function consumeCredit(progress: Progress, now = Date.now()): Progress | null {
  const recharged = rechargeCredits(progress, now);
  if (recharged.credits.current <= 0) return null;
  const current = recharged.credits.current - 1;
  return {
    ...recharged,
    credits: {
      ...recharged.credits,
      current,
      nextRechargeAt: current < recharged.credits.max
        ? recharged.credits.nextRechargeAt || now + CREDIT_RECHARGE_MS
        : null,
    },
  };
}

export function formatCreditTimer(nextRechargeAt: number | null, now = Date.now()): string {
  if (!nextRechargeAt) return '';
  const remaining = Math.max(0, nextRechargeAt - now);
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.ceil((remaining % 3600000) / 60000);
  if (hours <= 0) return `${minutes}min`;
  return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
}

// Desbloqueio é por trilha: a lição N abre quando a N-1 da MESMA trilha foi concluída.
export function isUnlocked(progress: Progress, lessons: Lesson[], index: number): boolean {
  if (index === 0) return true;
  return !!progress.completed[lessons[index - 1].id];
}

export function isUnitComplete(progress: Progress, unitPrefix: string): boolean {
  const lessons = LESSONS.filter(l => l.unit.startsWith(unitPrefix));
  return lessons.length > 0 && lessons.every(l => progress.completed[l.id]);
}

/** Mutates streak in place, returns same object. */
export function bumpStreak(progress: Progress): Progress {
  const today = new Date().toDateString();
  if (progress.streak.lastDate === today) return progress;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  progress.streak.count = progress.streak.lastDate === yesterday ? progress.streak.count + 1 : 1;
  progress.streak.lastDate = today;
  return progress;
}

/** Adds any newly-earned badges to progress.badges, returns the new badges. */
export function checkBadges(progress: Progress): Badge[] {
  const earned: Badge[] = [];
  BADGES.forEach(b => {
    if (!progress.badges.includes(b.id) && b.check(progress)) {
      progress.badges.push(b.id);
      earned.push(b);
    }
  });
  return earned;
}
