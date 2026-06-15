export type LessonType = 'theory' | 'code' | 'checklist';

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface CodeTest {
  args: unknown[];
  expected: unknown;
}

export interface Lesson {
  id: string;
  unit: string;
  title: string;
  type: LessonType;
  xp: number;
  content: string;
  // theory
  quiz?: QuizQuestion[];
  // code
  starter?: string;
  funcName?: string;
  tests?: CodeTest[];
}

export interface Streak {
  count: number;
  lastDate: string | null;
}

export interface Credits {
  current: number;
  max: number;
  nextRechargeAt: number | null;
}

export interface XpEvent {
  amount: number;
  source: string;
  at: number;
}

export interface ProgressStats {
  correctAnswers: number;
  codeExercisesPassed: number;
}

export interface DailyChallengeProgress {
  date: string | null;
  completed: boolean;
  correct: number;
  total: number;
}

export interface Progress {
  completed: Record<string, boolean>;
  code: Record<string, string>;
  xp: number;
  streak: Streak;
  badges: string[];
  nome: string;
  avatar: string;
  credits: Credits;
  xpEvents: XpEvent[];
  stats: ProgressStats;
  dailyChallenge: DailyChallengeProgress;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface RankingEntry {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  lessons: number;
  streak: number;
  rank: number;
}
