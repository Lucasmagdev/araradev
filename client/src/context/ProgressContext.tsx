import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Progress } from '../types';
import { LESSONS } from '../data/lessons';
import { bumpStreak, checkBadges, emptyProgress, type Badge } from '../lib/progress';
import { getProgress, saveProgressRemote } from '../lib/api';

const STORAGE_KEY = 'pc_progress_v1';

function loadLocal(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...emptyProgress(), ...JSON.parse(raw) };
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
  saveCode: (lessonId: string, code: string) => void;
  setNome: (nome: string) => void;
  reset: () => void;
  loadRemote: () => Promise<void>;
}

const Ctx = createContext<ProgressCtx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Progress>(loadLocal);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const persist = useCallback((p: Progress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    saveProgressRemote(p);
  }, []);

  const loadRemote = useCallback(async () => {
    try {
      const data = await getProgress();
      if (data) {
        const merged = { ...emptyProgress(), ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        setProgress(merged);
      }
    } catch { /* offline: keep local */ }
  }, []);

  const markComplete = useCallback((lessonId: string, xp: number): MarkResult => {
    const p = progressRef.current;
    if (p.completed[lessonId]) return { newBadges: [], phaseComplete: null };

    const next: Progress = {
      ...p,
      completed: { ...p.completed, [lessonId]: true },
      xp: p.xp + xp,
      streak: { ...p.streak },
      badges: [...p.badges],
    };
    bumpStreak(next);
    const newBadges = checkBadges(next);

    let phaseComplete: string | null = null;
    const lesson = LESSONS.find(l => l.id === lessonId);
    if (lesson) {
      const unitLessons = LESSONS.filter(l => l.unit === lesson.unit);
      if (unitLessons.every(l => next.completed[l.id])) phaseComplete = lesson.unit;
    }

    setProgress(next);
    persist(next);
    return { newBadges, phaseComplete };
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

  useEffect(() => { loadRemote(); }, [loadRemote]);

  return (
    <Ctx.Provider value={{ progress, markComplete, saveCode, setNome, reset, loadRemote }}>
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
