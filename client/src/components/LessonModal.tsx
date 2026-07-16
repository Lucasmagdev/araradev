import { useState } from 'react';
import type { Lesson } from '../types';
import { useProgress } from '../context/ProgressContext';
import { runCodeTests, type TestResult } from '../lib/effects';

interface Props {
  lesson: Lesson;
  relatedTheory?: Lesson | null;
  onComplete: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function LessonModal({ lesson, relatedTheory, onComplete, onClose }: Props) {
  const { progress, consumeCredit, saveCode } = useProgress();
  const done = !!progress.completed[lesson.id];

  return (
    <div id="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <button className="close" aria-label="Fechar" onClick={onClose}>×</button>
        <h2 dangerouslySetInnerHTML={{ __html: lesson.title }} />
        {lesson.type === 'code'
          ? <CodeBody lesson={lesson} relatedTheory={relatedTheory} done={done} credits={progress.credits.current} consumeCredit={consumeCredit} onComplete={onComplete} saveCode={saveCode} initial={progress.code[lesson.id]} />
          : <ChecklistBody lesson={lesson} relatedTheory={relatedTheory} done={done} onComplete={onComplete} />}
      </div>
    </div>
  );
}

function CodeBody({ lesson, relatedTheory, done, credits, consumeCredit, onComplete, saveCode, initial }: {
  lesson: Lesson; relatedTheory?: Lesson | null; done: boolean; onComplete: (l: Lesson) => void;
  credits: number; consumeCredit: () => boolean;
  saveCode: (id: string, code: string) => void; initial?: string;
}) {
  const [code, setCode] = useState(initial ?? lesson.starter ?? '');
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState(done ? 'Lição já concluída ✓ (pode continuar testando)' : '');

  function run() {
    if (!done && credits <= 0) {
      setMsg('Sem vidas agora. Volte quando recarregar.');
      return;
    }
    saveCode(lesson.id, code);
    const out = runCodeTests(lesson.funcName || '', code, lesson.tests || []);
    if (out.error) {
      if (!done) consumeCredit();
      setError(out.error);
      setResults(null);
      setMsg('Erro no código. Perdeu 1 vida.');
      return;
    }
    setError(null);
    setResults(out.results);
    if (out.results.every(r => r.pass)) {
      setMsg('🎉 Todos os testes passaram!');
      if (!done) onComplete(lesson);
    } else {
      if (!done) consumeCredit();
      setMsg('Quase lá — perdeu 1 vida. Ajusta o código e roda de novo.');
    }
  }

  return (
    <>
      <PracticeBrief lesson={lesson} relatedTheory={relatedTheory} />
      {!done && <div className={'modal-credits' + (credits === 0 ? ' empty' : '')}>♥ {credits} vidas restantes</div>}
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

function ChecklistBody({ lesson, relatedTheory, done, onComplete }: { lesson: Lesson; relatedTheory?: Lesson | null; done: boolean; onComplete: (l: Lesson) => void }) {
  const [isDone, setIsDone] = useState(done);
  return (
    <>
      <PracticeBrief lesson={lesson} relatedTheory={relatedTheory} />
      <div className="actions">
        <button disabled={isDone} onClick={() => { if (!isDone) { onComplete(lesson); setIsDone(true); } }}>
          {isDone ? 'Concluído ✓' : 'Marquei como feito'}
        </button>
      </div>
    </>
  );
}

function PracticeBrief({ lesson, relatedTheory }: { lesson: Lesson; relatedTheory?: Lesson | null }) {
  return (
    <div className="practice-brief">
      <span>Base para esta atividade</span>
      <div className="lesson-content" dangerouslySetInnerHTML={{ __html: lesson.content }} />
      {relatedTheory && <small>Conceito relacionado: {relatedTheory.title}</small>}
    </div>
  );
}
