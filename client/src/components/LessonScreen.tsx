import { useState } from 'react';
import type { Lesson } from '../types';
import { useProgress } from '../context/ProgressContext';
import { playSound, launchConfetti } from '../lib/effects';
import { IconClose } from './icons';

interface Props {
  lesson: Lesson;
  onComplete: (lesson: Lesson) => void;
  onClose: () => void;
}

export default function LessonScreen({ lesson, onComplete, onClose }: Props) {
  const { progress } = useProgress();
  const quiz = lesson.quiz || [];
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const alreadyDone = !!progress.completed[lesson.id];
  const q = quiz[qi];
  const total = quiz.length;

  function verify() {
    if (selected === null || answered) return;
    setAnswered(true);
    const ok = selected === q.answer;
    if (ok) setCorrectCount(c => c + 1);
    playSound(ok ? 'correct' : 'wrong');
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

  return (
    <div id="lesson-screen">
      <div className="ls-header">
        <button className="ls-close" onClick={onClose} aria-label="Fechar lição"><IconClose /></button>
        <div className="ls-progress-wrap"><div className="ls-progress-fill" style={{ width: progressPct + '%' }} /></div>
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
            <div className="ls-type-label">Escolha a resposta correta</div>
            <div className="ls-question" dangerouslySetInnerHTML={{ __html: q.q }} />
            <div className="ls-options">
              {q.options.map((opt, oi) => {
                let cls = 'ls-opt';
                if (answered) {
                  if (oi === q.answer) cls += ' correct';
                  else if (oi === selected) cls += ' wrong';
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
          <button className={'ls-verify-btn' + (selected !== null ? ' ready' : '')} disabled={selected === null} onClick={verify}>VERIFICAR</button>
        </div>
      )}

      {!finished && answered && (
        <div className={'ls-feedback visible ' + (selected === q.answer ? 'correct' : 'wrong')}>
          <div className="ls-feedback-top">
            <div className="ls-feedback-icon">{selected === q.answer ? '🎉' : '💡'}</div>
            <div>
              <div className="ls-feedback-title">{selected === q.answer ? 'Arrasou!' : 'Quase lá!'}</div>
              {selected !== q.answer && (
                <div className="ls-feedback-hint" dangerouslySetInnerHTML={{ __html: 'Resposta certa: ' + q.options[q.answer] }} />
              )}
            </div>
          </div>
          <button className="ls-continue-btn" onClick={next}>CONTINUAR</button>
        </div>
      )}
    </div>
  );
}
