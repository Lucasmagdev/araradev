export type LessonType = 'theory' | 'code' | 'checklist' | 'fill';

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
}

export interface CodeTest {
  args: unknown[];
  expected: unknown;
}

// fill: código pronto com lacunas marcadas pelo caractere ◻.
// Cada ◻ vira um campo; fillBlanks[i].accept lista as respostas aceitas
// (comparação ignora espaços, sensível a maiúsculas).
export interface FillBlank {
  accept: string[];
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
  // fill
  fillCode?: string;
  fillBlanks?: FillBlank[];
  fillHint?: string;
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

export interface OnboardingPreferences {
  goal: string;
  confidence: string;
  time: string;
  style: string;
  interests: string[];
  completedAt?: number;
}
