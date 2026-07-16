import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Progress } from '../types';
import { ALL_LESSONS, lessonById } from '../data/tracks';
import { bumpStreak, checkBadges, consumeCredit as consumeProgressCredit, emptyProgress, mergeProgress, normalizeProgress, rechargeCredits, type Badge } from '../lib/progress';
import { flushPending, getProgress, recordDailyChallenge, recordLessonCompletion, saveProgressRemote } from '../lib/api';

const STORAGE_KEY = 'pc_progress_v1';

function loadLocal(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalizeProgress(JSON.parse(raw));
  } catch { /* ignore */ }
  return emptyProgress();
}

interface MarkResult {
  newBadges: Badge[];
  phaseComplete: string | null;
}

interface ProgressCtx {
  progress: Progress;
  markComplete: (lessonId: string, xp: number) => MarkResult;
  recordCorrectAnswer: () => void;
  awardDailyChallenge: (date: string, correct: number, total: number) => MarkResult;
  consumeCredit: () => boolean;
  saveCode: (lessonId: string, code: string) => void;
  setNome: (nome: string) => void;
  reset: () => void;
  loadRemote: () => Promise<void>;
}

const Ctx = createContext<ProgressCtx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(loadLocal);
  const progressRef = useRef(progress);

  const persist = useCallback((p: Progress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    saveProgressRemote(p);
  }, []);

  const loadRemote = useCallback(async () => {
    try {
      const data = await getProgress();
      if (data) {
        // merge em vez de sobrescrever: lição completada offline não some
        // quando o remoto (desatualizado) chega
        const remote = normalizeProgress(data);
        const merged = mergeProgress(progressRef.current, remote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        setProgress(merged);
        // local tinha coisa que o remoto não tinha → sobe o merge
        if (JSON.stringify(merged) !== JSON.stringify(remote)) saveProgressRemote(merged);
      }
      void flushPending();
    } catch { /* offline: keep local */ }
  }, []);

  const markComplete = useCallback((lessonId: string, xp: number): MarkResult => {
    const p = progressRef.current;
    if (p.completed[lessonId]) return { newBadges: [], phaseComplete: null };

    const next: Progress = {
      ...p,
      completed: { ...p.completed, [lessonId]: true },
      xp: p.xp + xp,
      xpEvents: [...p.xpEvents, { amount: xp, source: `lesson:${lessonId}`, at: Date.now() }],
      streak: { ...p.streak },
      badges: [...p.badges],
    };
    bumpStreak(next);
    const newBadges = checkBadges(next);

    let phaseComplete: string | null = null;
    const lesson = lessonById(lessonId);
    if (lesson) {
      // fase completa = todas as lições da MESMA trilha e MESMA unidade concluídas
      const unitLessons = ALL_LESSONS.filter(l => l.track === lesson.track && l.unit === lesson.unit);
      if (unitLessons.every(l => next.completed[l.id])) phaseComplete = lesson.unit;
    }

    setProgress(next);
    persist(next);
    recordLessonCompletion(lessonId, xp);
    return { newBadges, phaseComplete };
  }, [persist]);

  const recordCorrectAnswer = useCallback(() => {
    const p = progressRef.current;
    const next: Progress = {
      ...p,
      stats: { ...p.stats, correctAnswers: p.stats.correctAnswers + 1 },
      badges: [...p.badges],
    };
    checkBadges(next);
    setProgress(next);
    persist(next);
  }, [persist]);

  const awardDailyChallenge = useCallback((date: string, correct: number, total: number): MarkResult => {
    const p = progressRef.current;
    if (p.dailyChallenge.date === date && p.dailyChallenge.completed) return { newBadges: [], phaseComplete: null };

    const xp = 15 + correct * 5;
    const currentCredits = correct === total ? Math.min(p.credits.max, p.credits.current + 1) : p.credits.current;
    const next: Progress = {
      ...p,
      xp: p.xp + xp,
      xpEvents: [...p.xpEvents, { amount: xp, source: 'daily', at: Date.now() }],
      stats: { ...p.stats, correctAnswers: p.stats.correctAnswers + correct },
      streak: { ...p.streak },
      badges: [...p.badges],
      credits: {
        ...p.credits,
        current: currentCredits,
        nextRechargeAt: currentCredits >= p.credits.max ? null : p.credits.nextRechargeAt,
      },
      dailyChallenge: { date, completed: true, correct, total },
    };
    bumpStreak(next);
    const newBadges = checkBadges(next);
    setProgress(next);
    persist(next);
    recordDailyChallenge(date, correct, total, xp);
    return { newBadges, phaseComplete: null };
  }, [persist]);

  const consumeCredit = useCallback((): boolean => {
    const next = consumeProgressCredit(progressRef.current);
    if (!next) return false;
    setProgress(next);
    persist(next);
    return true;
  }, [persist]);

  const saveCode = useCallback((lessonId: string, code: string) => {
    const next = { ...progressRef.current, code: { ...progressRef.current.code, [lessonId]: code } };
    setProgress(next);
    persist(next);
  }, [persist]);

  const setNome = useCallback((nome: string) => {
    const next = { ...progressRef.current, nome };
    setProgress(next);
    persist(next);
  }, [persist]);

  const reset = useCallback(() => {
    const fresh = emptyProgress();
    localStorage.removeItem(STORAGE_KEY);
    setProgress(fresh);
    persist(fresh);
  }, [persist]);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const id = window.setTimeout(() => { void loadRemote(); }, 0);
    return () => window.clearTimeout(id);
  }, [loadRemote]);

  // reenvia escritas pendentes quando a rede volta ou o app volta pro foreground
  useEffect(() => {
    const flush = () => { void flushPending(); };
    const onVisible = () => { if (document.visibilityState === 'visible') flush(); };
    window.addEventListener('online', flush);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('online', flush);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = rechargeCredits(progressRef.current);
      if (next !== progressRef.current) {
        setProgress(next);
        persist(next);
      }
    }, 60000);
    return () => window.clearInterval(id);
  }, [persist]);

  return (
    <Ctx.Provider value={{ progress, markComplete, recordCorrectAnswer, awardDailyChallenge, consumeCredit, saveCode, setNome, reset, loadRemote }}>
      {children}
    </Ctx.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProgress() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
