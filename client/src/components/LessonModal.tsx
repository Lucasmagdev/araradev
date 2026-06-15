import { useState } from 'react';
import type { Lesson } from '../types';
import { useProgress } from '../context/ProgressContext';
import { runCodeTests, type TestResult } from '../lib/effects';

interface Props {
  lesson: Lesson;
  onComplete: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function LessonModal({ lesson, onComplete, onClose }: Props) {
  const { progress, saveCode } = useProgress();
  const done = !!progress.completed[lesson.id];

  return (
    <div id="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="close" aria-label="Fechar" onClick={onClose}>×</button>
        <h2 dangerouslySetInnerHTML={{ __html: lesson.title }} />
        {lesson.type === 'code'
          ? <CodeBody lesson={lesson} done={done} onComplete={onComplete} saveCode={saveCode} initial={progress.code[lesson.id]} />
          : <ChecklistBody lesson={lesson} done={done} onComplete={onComplete} />}
      </div>
    </div>
  );
}

function CodeBody({ lesson, done, onComplete, saveCode, initial }: {
  lesson: Lesson; done: boolean; onComplete: (l: Lesson) => void;
  saveCode: (id: string, code: string) => void; initial?: string;
}) {
  const [code, setCode] = useState(initial ?? lesson.starter ?? '');
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState(done ? 'Lição já concluída ✓ (pode continuar testando)' : '');

  function run() {
    saveCode(lesson.id, code);
    const out = runCodeTests(lesson.funcName || '', code, lesson.tests || []);
    if (out.error) { setError(out.error); setResults(null); setMsg(''); return; }
    setError(null);
    setResults(out.results);
    if (out.results.every(r => r.pass)) {
      setMsg('🎉 Todos os testes passaram!');
      if (!done) onComplete(lesson);
    } else {
      setMsg('Quase lá — ajusta o código e roda de novo.');
    }
  }

  return (
    <>
      <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      <textarea id="code-input" rows={8} value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />
      <div className="actions">
        <button onClick={run}>Rodar testes</button>
        <div id="result-msg">{msg}</div>
      </div>
      <div id="test-results">
        {error && <div className="test-row err">{error}</div>}
        {results?.map((r, i) => (
          <div key={i} className={'test-row ' + (r.pass ? 'ok' : 'err')}>
            {r.pass ? '✅' : '❌'} entrada: {r.args.map(a => JSON.stringify(a)).join(', ')} → esperado {JSON.stringify(r.expected)}, obteve {JSON.stringify(r.actual)}
          </div>
        ))}
      </div>
    </>
  );
}

function ChecklistBody({ lesson, done, onComplete }: { lesson: Lesson; done: boolean; onComplete: (l: Lesson) => void }) {
  const [isDone, setIsDone] = useState(done);
  return (
    <>
      <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      <div className="actions">
        <button disabled={isDone} onClick={() => { if (!isDone) { onComplete(lesson); setIsDone(true); } }}>
          {isDone ? 'Concluído ✓' : 'Marquei como feito'}
        </button>
      </div>
    </>
  );
}
