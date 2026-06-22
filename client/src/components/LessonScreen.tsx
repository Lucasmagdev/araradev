import { useEffect, useState } from 'react';
import type { Lesson } from '../types';
import { useProgress } from '../context/ProgressContext';
import { formatCreditTimer } from '../lib/progress';
import { playSound, launchConfetti } from '../lib/effects';
import { IconClose } from './icons';
import Mascote, { type MascoteEstado } from './Mascote';

interface Props {
  lesson: Lesson;
  onComplete: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function LessonScreen({ lesson, onComplete, onClose }: Props) {
  const { progress, consumeCredit, recordCorrectAnswer } = useProgress();
  const quiz = lesson.quiz || [];
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const alreadyDone = !!progress.completed[lesson.id];
  const q = quiz[qi];
  const total = quiz.length;
  const creditTimer = formatCreditTimer(progress.credits.nextRechargeAt, now);

  useEffect(() => {
    if (!progress.credits.nextRechargeAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, [progress.credits.nextRechargeAt]);

  function verify() {
    if (selected === null || answered) return;
    const ok = selected === q.answer;
    if (!ok && !alreadyDone && !consumeCredit()) return;
    setAnswered(true);
    if (ok) {
      setCorrectCount(c => c + 1);
      if (!alreadyDone) recordCorrectAnswer();
    }
    playSound(ok ? 'correct' : 'wrong');
  }

  function tryAgain() {
    setSelected(null);
    setAnswered(false);
  }

  function next() {
    if (qi + 1 >= total) {
      setFinished(true);
      if (!alreadyDone) onComplete(lesson);
      playSound('complete');
      launchConfetti();
      return;
    }
    setQi(qi + 1);
    setSelected(null);
    setAnswered(false);
  }

  const progressPct = finished ? 100 : Math.round((qi / total) * 100);

  let mascoteEstado: MascoteEstado = 'idle';
  let mascoteFala: string | undefined;
  if (finished) {
    mascoteEstado = 'comemora';
    mascoteFala = 'Mandou bem!';
  } else if (answered) {
    const ok = selected === q.answer;
    mascoteEstado = ok ? 'acerta' : 'erra';
    mascoteFala = ok ? 'Arrasou!' : 'Quase!';
  }

  return (
    <div id="lesson-screen">
      <div className="ls-header">
        <button className="ls-close" onClick={onClose} aria-label="Fechar lição"><IconClose /></button>
        <div className="ls-progress-wrap"><div className="ls-progress-fill" style={{ width: progressPct + '%' }} /></div>
        <div className={'ls-credits' + (progress.credits.current === 0 ? ' empty' : '')} title={creditTimer ? `Recarrega em ${creditTimer}` : 'Vidas cheias'}>♥ {progress.credits.current}{creditTimer && <span className="ls-credits-timer">{creditTimer}</span>}</div>
      </div>

      <div className="ls-body">
        {finished ? (
          <div className="ls-complete">
            <div className="ls-complete-icon">🏆</div>
            <h2 className="ls-complete-title">Lição concluída!</h2>
            <p className="ls-complete-sub">{lesson.title}</p>
            <div className="ls-score-row">
              <div className="ls-score-card"><span style={{ color: '#58cc02' }}>{correctCount}/{total}</span><small>acertos</small></div>
              <div className="ls-score-card"><span style={{ color: '#1cb0f6' }}>{Math.round((correctCount / total) * 100)}%</span><small>precisão</small></div>
            </div>
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
            <div className="ls-type-label">Escolha a resposta correta</div>
            <div className="ls-question" dangerouslySetInnerHTML={{ __html: q.q }} />
            <div className="ls-options">
              {q.options.map((opt, oi) => {
                let cls = 'ls-opt';
                if (answered) {
                  // Só destaca a opção que a pessoa escolheu (verde se acertou, vermelho se errou).
                  // Nunca revela qual é a certa quando erra.
                  if (oi === selected) cls += selected === q.answer ? ' correct' : ' wrong';
                } else if (oi === selected) cls += ' selected';
                return (
                  <button key={oi} className={cls} disabled={answered}
                    onClick={() => !answered && setSelected(oi)}
                    dangerouslySetInnerHTML={{ __html: opt }} />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!finished && !answered && (
        <div className="ls-footer">
          <button
            className={'ls-verify-btn' + (selected !== null && (alreadyDone || progress.credits.current > 0) ? ' ready' : '')}
            disabled={selected === null || (!alreadyDone && progress.credits.current <= 0)}
            onClick={verify}
          >
            {!alreadyDone && progress.credits.current <= 0 ? (creditTimer ? `SEM VIDAS · VOLTA EM ${creditTimer}` : 'SEM VIDAS') : 'VERIFICAR'}
          </button>
        </div>
      )}

      {!finished && answered && (
        <div className={'ls-feedback visible ' + (selected === q.answer ? 'correct' : 'wrong')}>
          <div className="ls-feedback-top">
            <div className="ls-feedback-icon">{selected === q.answer ? '🎉' : '💡'}</div>
            <div>
              <div className="ls-feedback-title">{selected === q.answer ? 'Arrasou!' : 'Quase lá!'}</div>
              {selected !== q.answer && (
                <div className="ls-feedback-hint">Pensa de novo e escolhe outra.</div>
              )}
            </div>
          </div>
          {selected === q.answer
            ? <button className="ls-continue-btn" onClick={next}>CONTINUAR</button>
            : <button className="ls-continue-btn" onClick={tryAgain}>TENTAR DE NOVO</button>}
        </div>
      )}
    </div>
  );
}
