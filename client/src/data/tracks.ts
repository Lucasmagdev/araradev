import type { Lesson, Track, Progress } from '../types';
import { LESSONS } from './lessons';
import { FRONTEND_LESSONS } from './lessons-frontend';
import { SQL_LESSONS } from './lessons-sql';
import { LOGIC_LESSONS } from './lessons-logica';

export const DEFAULT_TRACK = 'fund';

export const TRACKS: Track[] = [
  {
    id: 'fund', name: 'Fundamentos de Programação', short: 'Fundamentos',
    icon: '{ }', color: '#58cc02',
    desc: 'Lógica, estruturas, algoritmos e base pra virar dev.',
    lessons: LESSONS.map(l => ({ ...l, track: 'fund' })),
  },
  {
    id: 'frontend', name: 'Front-end (HTML, CSS, JS)', short: 'Front-end',
    icon: '&lt;/&gt;', color: '#1cb0f6',
    desc: 'Construir páginas: HTML, CSS e JavaScript no navegador.',
    lessons: FRONTEND_LESSONS,
  },
  {
    id: 'sql', name: 'SQL e Banco de Dados', short: 'SQL',
    icon: 'SQL', color: '#ff9600',
    desc: 'SELECT, WHERE, JOIN, modelagem e queries na prática.',
    lessons: SQL_LESSONS,
  },
  {
    id: 'logica', name: 'Entrevistas e Lógica', short: 'Entrevistas',
    icon: 'O(n)', color: '#ce82ff',
    desc: 'Desafios de lógica e algoritmos estilo entrevista técnica.',
    lessons: LOGIC_LESSONS,
  },
];

export function getTrack(id: string | null | undefined): Track {
  return TRACKS.find(t => t.id === id) || TRACKS[0];
}

// Todas as lições de todas as trilhas (badges globais, XP total, lookup por id).
export const ALL_LESSONS: Lesson[] = TRACKS.flatMap(t => t.lessons);

export function lessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find(l => l.id === id);
}

// XP acumulado numa trilha = soma do xp das lições concluídas daquela trilha.
export function trackXp(progress: Progress, trackId: string): number {
  return getTrack(trackId).lessons.reduce(
    (sum, l) => sum + (progress.completed[l.id] ? l.xp : 0), 0
  );
}

export function trackDone(progress: Progress, trackId: string): number {
  return getTrack(trackId).lessons.filter(l => progress.completed[l.id]).length;
}
