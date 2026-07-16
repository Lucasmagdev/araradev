import type { Lesson } from '../types';

export function findNextPractice(lessons: Lesson[], index: number): Lesson | null {
  for (let i = index + 1; i < lessons.length; i++) {
    if (lessons[i].type !== 'theory') return lessons[i];
  }
  return null;
}

export function findPreviousTheory(lessons: Lesson[], index: number): Lesson | null {
  const unit = lessons[index]?.unit;
  for (let i = index - 1; i >= 0; i--) {
    if (lessons[i].unit !== unit) break;
    if (lessons[i].type === 'theory') return lessons[i];
  }
  return null;
}

export function lessonKindLabel(lesson: Lesson): string {
  if (lesson.type === 'code') return 'prática de código';
  if (lesson.type === 'fill') return 'complete o código';
  if (lesson.type === 'checklist') return 'atividade prática';
  return 'quiz teórico';
}
