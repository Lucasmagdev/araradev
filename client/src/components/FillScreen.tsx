import { useMemo, useState } from 'react';
import type { Lesson } from '../types';
import { useProgress } from '../context/ProgressContext';
import { playSound, launchConfetti } from '../lib/effects';
import { IconClose } from './icons';
import Mascote, { type MascoteEstado } from './Mascote';

interface Props {
  lesson: Lesson;
  onComplete: (lesson: Lesson) => void;
  onClose: () => void;
}

// Normaliza pra comparar: ignora espaços e ; no fim. Sensível a maiúsculas (código).
function norm(s: string) {
  return s.replace(/\s+/g, '').replace(/;+$/, '');
}

export default function FillScreen({ lesson, onComplete, onClose }: Props) {
  const { progress, consumeCredit } = useProgress();
  const blanks = lesson.fillBlanks || [];
  // Quebra o código nos marcadores ◻ — entre cada par de pedaços entra um input.
  const parts = useMemo(() => (lesson.fillCode || '').split('◻'), [lesson.fillCode]);

  const [values, setValues] = useState<string[]>(() => blanks.map(() => ''));
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);

  const alreadyDone = !!progress.completed[lesson.id];

  const results = useMemo(
    () => blanks.map((b, i) => b.accept.some(a => norm(a) === norm(values[i] || ''))),
    [blanks, values],
  );
  const allCorrect = results.length > 0 && results.every(Boolean);
  const allFilled = values.every(v => v.trim() !== '');

  function verify() {
    if (answered || !allFilled) return;
    if (!allCorrect && !alreadyDone && !consumeCredit()) return;
    setAnswered(true);
    playSound(allCorrect ? 'correct' : 'wrong');
  }

  function tryAgain() {
    setAnswered(false);
  }

  function finish() {
    setFinished(true);
    if (!alreadyDone) onComplete(lesson);
    playSound('complete');
    launchConfetti();
  }

  let mascoteEstado: MascoteEstado = 'idle';
  let mascoteFala: string | undefined;
  if (finished) { mascoteEstado = 'comemora'; mascoteFala = 'Mandou bem!'; }
  else if (answered) { mascoteEstado = allCorrect ? 'acerta' : 'erra'; mascoteFala = allCorrect ? 'Arrasou!' : 'Quase!'; }

  return (
    <div id="lesson-screen">
      <div className="ls-header">
        <button className="ls-close" onClick={onClose} aria-label="Fechar lição"><IconClose /></button>
        <div className="ls-progress-wrap"><div className="ls-progress-fill" style={{ width: finished ? '100%' : '0%' }} /></div>
        <div className={'ls-credits' + (progress.credits.current === 0 ? ' empty' : '')}>♥ {progress.credits.current}</div>
      </div>

      <div className="ls-body">
        {finished ? (
          <div className="ls-complete">
            <div className="ls-complete-icon">🏆</div>
            <h2 className="ls-complete-title">Lição concluída!</h2>
            <p className="ls-complete-sub">{lesson.title}</p>
            {!alreadyDone && (
              <div className="ls-xp-badge"><span className="ls-xp-badge-num">+{lesson.xp}</span><span className="ls-xp-badge-label">XP ganho</span></div>
            )}
            <button className="ls-complete-btn" onClick={onClose}>CONTINUAR</button>
          </div>
        ) : (
          <div className="ls-question-wrap">
            <div className="ls-mascote-slot">
              <Mascote estado={mascoteEstado} fala={answered ? mascoteFala : undefined} size={84} />
            </div>
            <div className="ls-type-label">Complete o código</div>
            <div className="ls-fill-desc" dangerouslySetInnerHTML={{ __html: lesson.content }} />
            <pre className="ls-fill-code"><code>
              {parts.map((part, i) => (
                <span key={i}>
                  {part}
                  {i < blanks.length && (
                    <input
                      className={'ls-fill-input' + (answered ? (results[i] ? ' ok' : ' err') : '')}
                      value={values[i]}
                      disabled={answered}
                      spellCheck={false}
                      autoCapitalize="off"
                      autoCorrect="off"
                      size={Math.max(3, (values[i] || '').length + 1)}
                      onChange={e => setValues(v => v.map((x, j) => (j === i ? e.target.value : x)))}
                      onKeyDown={e => { if (e.key === 'Enter') verify(); }}
                    />
                  )}
                </span>
              ))}
            </code></pre>
            {lesson.fillHint && !answered && <div className="ls-fill-hint">💡 {lesson.fillHint}</div>}
          </div>
        )}
      </div>

      {!finished && !answered && (
        <div className="ls-footer">
          <button
            className={'ls-verify-btn' + (allFilled && (alreadyDone || progress.credits.current > 0) ? ' ready' : '')}
            disabled={!allFilled || (!alreadyDone && progress.credits.current <= 0)}
            onClick={verify}
          >
            {!alreadyDone && progress.credits.current <= 0 ? 'SEM CRÉDITOS' : 'VERIFICAR'}
          </button>
        </div>
      )}

      {!finished && answered && (
        <div className={'ls-feedback visible ' + (allCorrect ? 'correct' : 'wrong')}>
          <div className="ls-feedback-top">
            <div className="ls-feedback-icon">{allCorrect ? '🎉' : '💡'}</div>
            <div>
              <div className="ls-feedback-title">{allCorrect ? 'Arrasou!' : 'Quase lá!'}</div>
              {!allCorrect && (
                <div className="ls-feedback-hint">
                  Resposta certa: {blanks.map((b, i) => <code key={i} style={{ marginRight: 6 }}>{b.accept[0]}</code>)}
                </div>
              )}
            </div>
          </div>
          {allCorrect
            ? <button className="ls-continue-btn" onClick={finish}>CONTINUAR</button>
            : <button className="ls-continue-btn" onClick={tryAgain}>TENTAR DE NOVO</button>}
        </div>
      )}
    </div>
  );
}
