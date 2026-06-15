import { useEffect, useRef, useState } from 'react';
import { LESSONS } from '../data/lessons';
import { useProgress } from '../context/ProgressContext';
import { isUnlocked } from '../lib/progress';
import { IconBook, IconCode, IconCheck, IconLock, IconList } from './icons';
import type { LessonType } from '../types';

const WAVE_OFFSETS_BASE = [0, 70, 100, 70, 0, -70, -100, -70];

function waveOffsets(w: number): number[] {
  const scale = w < 380 ? 0.35 : w < 480 ? 0.45 : w < 640 ? 0.7 : 1;
  return WAVE_OFFSETS_BASE.map(o => Math.round(o * scale));
}

// Tela estreita: offsets negativos saem do viewport e somem. Inverte pra dentro.
function decoPos(v: string | undefined, narrow: boolean): string | undefined {
  if (!v || !narrow) return v;
  return v.startsWith('-') ? v.slice(1) : v;
}

interface Deco { t: string; big?: boolean; l?: string; r?: string; top: string; }

const FASE_DECOS: Deco[][] = [
  [{ t: '{ }', big: true, l: '-12%', top: '8%' }, { t: 'if', r: '-10%', top: '22%' }, { t: 'let x', l: '-8%', top: '45%' }, { t: '=>', big: true, r: '-8%', top: '62%' }, { t: 'true', l: '-10%', top: '80%' }],
  [{ t: '[ ]', big: true, l: '-12%', top: '10%' }, { t: 'Map', r: '-10%', top: '28%' }, { t: '{}', big: true, l: '-8%', top: '50%' }, { t: '.push()', r: '-8%', top: '68%' }, { t: 'Set', l: '-10%', top: '85%' }],
  [{ t: 'fn(fn)', l: '-12%', top: '10%' }, { t: '↩', big: true, r: '-10%', top: '30%' }, { t: 'base', l: '-8%', top: '52%' }, { t: '∞', big: true, r: '-8%', top: '70%' }, { t: 'return', l: '-10%', top: '86%' }],
  [{ t: 'O(n)', l: '-12%', top: '8%' }, { t: 'sort()', r: '-10%', top: '26%' }, { t: 'O(n²)', l: '-8%', top: '48%' }, { t: 'O(log n)', r: '-8%', top: '66%' }, { t: 'O(1)', l: '-10%', top: '82%' }],
  [{ t: 'SELECT', l: '-12%', top: '10%' }, { t: 'JOIN', r: '-10%', top: '28%' }, { t: 'WHERE', l: '-8%', top: '50%' }, { t: 'INDEX', r: '-8%', top: '68%' }, { t: 'GROUP BY', l: '-10%', top: '84%' }],
  [{ t: 'null?', l: '-12%', top: '8%' }, { t: 'console.log', r: '-10%', top: '26%' }, { t: 'fix', l: '-8%', top: '50%' }, { t: 'stack trace', r: '-8%', top: '68%' }, { t: 'diff', l: '-10%', top: '84%' }],
  [{ t: 'test()', l: '-12%', top: '10%' }, { t: 'assert', r: '-10%', top: '28%' }, { t: 'mock()', l: '-8%', top: '50%' }, { t: 'coverage', r: '-8%', top: '68%' }, { t: 'expect()', l: '-10%', top: '84%' }],
  [{ t: 'API', l: '-12%', top: '8%' }, { t: '.env', r: '-10%', top: '26%' }, { t: 'MVC', l: '-8%', top: '48%' }, { t: 'middleware', r: '-8%', top: '66%' }, { t: 'auth()', l: '-10%', top: '82%' }],
  [{ t: 'GET /', l: '-12%', top: '10%' }, { t: 'POST', r: '-10%', top: '28%' }, { t: 'JSON', l: '-8%', top: '50%' }, { t: '200 OK', r: '-8%', top: '68%' }, { t: 'fetch()', l: '-10%', top: '84%' }],
  [{ t: 'commit', l: '-12%', top: '8%' }, { t: 'push', r: '-10%', top: '26%' }, { t: 'branch', l: '-8%', top: '48%' }, { t: 'rebase', r: '-8%', top: '66%' }, { t: 'merge', l: '-10%', top: '82%' }],
  [{ t: 'await', l: '-12%', top: '10%' }, { t: '.then()', r: '-10%', top: '28%' }, { t: 'Promise', big: true, l: '-8%', top: '50%' }, { t: 'fetch()', r: '-8%', top: '68%' }, { t: 'async', l: '-10%', top: '84%' }],
  [{ t: '<JSX>', big: true, l: '-12%', top: '10%' }, { t: 'props', r: '-10%', top: '28%' }, { t: 'useState', l: '-8%', top: '50%' }, { t: '.map()', r: '-8%', top: '68%' }, { t: 'key', l: '-10%', top: '84%' }],
];

const FASE_COLORS = ['#ff4b4b', '#1cb0f6', '#a560e8', '#ff9600', '#2ec4b6', '#ce82ff', '#58cc02', '#4c6ef5', '#ff6b6b', '#ffd43b', '#f783ac', '#20c997'];
const FASE_ICONS = ['{ }', '[ ]', 'fn()', 'O(n)', 'SQL', 'bug', 'test()', 'arch', 'REST', 'git', 'async', 'JSX'];

function faseIndex(unit: string): number {
  const m = unit.match(/Fase (\d+)/);
  return m ? parseInt(m[1]) - 1 : 0;
}

function nodeIcon(type: LessonType) {
  if (type === 'code') return <IconCode />;
  if (type === 'checklist') return <IconList />;
  return <IconBook />;
}

export default function Path({ onOpenLesson }: { onOpenLesson: (index: number) => void }) {
  const { progress } = useProgress();
  const [width, setWidth] = useState(window.innerWidth);
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(t); t = setTimeout(() => setWidth(window.innerWidth), 200); };
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t); };
  }, []);

  useEffect(() => {
    const id = setTimeout(() => currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120);
    return () => clearTimeout(id);
  }, []);

  const offsets = waveOffsets(width);
  const nextIndex = LESSONS.findIndex((l, i) => isUnlocked(progress, i) && !progress.completed[l.id]);

  // unit stats
  const unitStats: Record<string, { total: number; done: number }> = {};
  LESSONS.forEach(l => {
    if (!unitStats[l.unit]) unitStats[l.unit] = { total: 0, done: 0 };
    unitStats[l.unit].total++;
    if (progress.completed[l.id]) unitStats[l.unit].done++;
  });

  // group lessons by unit, preserving order
  const groups: { unit: string; lessons: { lesson: typeof LESSONS[number]; index: number }[] }[] = [];
  LESSONS.forEach((lesson, index) => {
    let g = groups[groups.length - 1];
    if (!g || g.unit !== lesson.unit) { g = { unit: lesson.unit, lessons: [] }; groups.push(g); }
    g.lessons.push({ lesson, index });
  });

  return (
    <main id="path">
      {groups.map((g) => {
        const fi = faseIndex(g.unit);
        const color = FASE_COLORS[fi % FASE_COLORS.length];
        const icon = FASE_ICONS[fi % FASE_ICONS.length];
        const stats = unitStats[g.unit];
        const pct = Math.round((stats.done / stats.total) * 100);
        const shortTitle = g.unit.replace(/^Fase \d+ — /, '');
        const decos = FASE_DECOS[fi % FASE_DECOS.length];

        return (
          <div key={g.unit}>
            <div className="fase-banner" style={{ background: color }}>
              <div className="fase-banner-text">
                <span className="fase-banner-label">Fase {fi + 1}</span>
                <span className="fase-banner-title">{shortTitle}</span>
                <div className="fase-banner-progress">
                  <span className="fase-banner-count">{stats.done}/{stats.total} lições</span>
                  <div className="fase-banner-bar"><div className="fase-banner-bar-fill" style={{ width: pct + '%' }} /></div>
                </div>
              </div>
              <span className="fase-banner-icon">{icon}</span>
            </div>

            <div className="fase-track">
              {decos.map((d, di) => (
                <div key={di} className={'deco-item ' + (d.big ? 'big' : 'small')}
                  style={{ position: 'absolute', top: d.top, left: decoPos(d.l, width < 480), right: decoPos(d.r, width < 480) }}>{d.t}</div>
              ))}

              {g.lessons.map(({ lesson, index }, gi) => {
                const unlocked = isUnlocked(progress, index);
                const done = !!progress.completed[lesson.id];
                const isCurrent = index === nextIndex;
                const offset = offsets[gi % offsets.length];
                const state = done ? 'done' : unlocked ? 'unlocked' : 'locked';

                return (
                  <div key={lesson.id} className={'lesson-wrap ' + state} style={{ transform: `translateX(${offset}px)` }}>
                    <button
                      ref={isCurrent ? currentRef : undefined}
                      className={'lesson-node ' + state + (isCurrent ? ' current' : '')}
                      disabled={!unlocked}
                      onClick={() => unlocked && onOpenLesson(index)}
                    >
                      {done ? <IconCheck /> : unlocked ? nodeIcon(lesson.type) : <IconLock />}
                    </button>
                    <span className="lesson-label">{lesson.title}</span>
                    {isCurrent && (
                      <div className="start-badge">{done ? 'em andamento' : 'começar'}</div>
                    )}
                  </div>
                );
              })}

              {stats.done === stats.total && (
                <div className="fase-trophy" title={`${shortTitle} — fase completa`}>
                  <span className="fase-trophy-icon">🏆</span>
                  <span className="fase-trophy-label">Fase {fi + 1} completa</span>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {nextIndex !== -1 && (
        <button
          className="continue-fab"
          onClick={() => onOpenLesson(nextIndex)}
        >
          Continuar trilha →
        </button>
      )}
    </main>
  );
}
