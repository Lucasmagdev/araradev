import { LESSONS } from '../data/lessons';

export interface DailyQuestion {
  id: string;
  lessonTitle: string;
  q: string;
  options: string[];
  answer: number;
}

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function seedFromDate(date: string): number {
  return date.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

function seededSort<T extends { id: string }>(items: T[], seed: number): T[] {
  return [...items].sort((a, b) => {
    const av = hash(`${a.id}:${seed}`);
    const bv = hash(`${b.id}:${seed}`);
    return av - bv;
  });
}

function hash(input: string): number {
  let value = 2166136261;
  for (let i = 0; i < input.length; i++) {
    value ^= input.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function getDailyQuestions(date = todayKey(), count = 5): DailyQuestion[] {
  const all = LESSONS.flatMap(lesson =>
    (lesson.quiz || []).map((quiz, index) => ({
      id: `${lesson.id}:${index}`,
      lessonTitle: lesson.title,
      q: quiz.q,
      options: quiz.options,
      answer: quiz.answer,
    })),
  );
  return seededSort(all, seedFromDate(date)).slice(0, count);
}
