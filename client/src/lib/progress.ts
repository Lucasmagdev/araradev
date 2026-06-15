import type { Progress } from '../types';
import { LESSONS } from '../data/lessons';

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
  { id: 'all-lessons',    icon: '🦜', name: 'AraraDev Master',   check: (p) => Object.keys(p.completed).length >= LESSONS.length },
  { id: 'streak-3',       icon: '🔥', name: 'Streak 3 dias',     check: (p) => p.streak.count >= 3 },
  { id: 'streak-7',       icon: '⚡', name: 'Streak 7 dias',     check: (p) => p.streak.count >= 7 },
  { id: 'xp-50',          icon: '⭐', name: '50 XP',             check: (p) => p.xp >= 50 },
  { id: 'xp-200',         icon: '💎', name: '200 XP',            check: (p) => p.xp >= 200 },
  { id: 'xp-500',         icon: '🚀', name: '500 XP',            check: (p) => p.xp >= 500 },
  { id: 'coder',          icon: '💻', name: 'Programador',       check: (p) => LESSONS.filter(l => l.type === 'code' && p.completed[l.id]).length >= 5 },
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
  return { completed: {}, code: {}, xp: 0, streak: { count: 0, lastDate: null }, badges: [], nome: '', avatar: '🦜' };
}

export function isUnlocked(progress: Progress, index: number): boolean {
  if (index === 0) return true;
  return !!progress.completed[LESSONS[index - 1].id];
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
