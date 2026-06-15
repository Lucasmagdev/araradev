import { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { BADGES, getLevel, LEVELS } from '../lib/progress';
import { getMe, getRanking } from '../lib/api';
import { getDailyQuestions, todayKey } from '../lib/daily';
import type { RankingEntry, User } from '../types';

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div id="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">{children}</div>
    </div>
  );
}

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { progress } = useProgress();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { getMe().then(setUser).catch(() => {}); }, []);
  const level = getLevel(progress.xp);
  const li = LEVELS.indexOf(level);
  const nextName = li < LEVELS.length - 1 ? LEVELS[li + 1].name : null;
  const pct = level.next ? Math.round(((progress.xp - level.min) / (level.next - level.min)) * 100) : 100;
  const totalDone = Object.keys(progress.completed).length;

  return (
    <Overlay onClose={onClose}>
      <button className="close" onClick={onClose}>×</button>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <img src="/logoararadev.jpeg" className="avatar-display" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--green)' }} alt="AraraDev" />
        <h3 className="profile-name">{user?.name || '...'}</h3>
        <p className="profile-email">{user?.email || ''}</p>
      </div>
      <div className="profile-level">
        <span className="level-name">{level.name}</span>
        <span className="level-xp">{progress.xp} XP</span>
      </div>
      <div className="level-bar-wrap"><div className="level-bar-fill" style={{ width: pct + '%' }} /></div>
      <p className="level-hint">{nextName ? `${level.next! - progress.xp} XP pra ${nextName}` : 'Nível máximo!'}</p>
      <div className="stat-cards">
        <div className="stat-card"><span>{totalDone}</span><small>lições completas</small></div>
        <div className="stat-card"><span>{progress.streak.count}</span><small>dias de streak</small></div>
        <div className="stat-card"><span>{progress.badges.length}</span><small>conquistas</small></div>
      </div>
    </Overlay>
  );
}

export function AchievementsModal({ onClose }: { onClose: () => void }) {
  const { progress } = useProgress();
  return (
    <Overlay onClose={onClose}>
      <button className="close" onClick={onClose}>×</button>
      <h2>Conquistas</h2>
      <p className="level-hint">{progress.badges.length}/{BADGES.length} desbloqueadas</p>
      <div className="badge-grid">
        {BADGES.map(b => {
          const unlocked = progress.badges.includes(b.id);
          return (
            <div key={b.id} className={'badge-item ' + (unlocked ? 'unlocked' : 'locked')}>
              <span className="badge-icon">{b.icon}</span>
              <span>{b.name}</span>
            </div>
          );
        })}
      </div>
    </Overlay>
  );
}

export function DailyChallengeModal({ onClose, onToast }: { onClose: () => void; onToast: (html: string) => void }) {
  const { progress, awardDailyChallenge } = useProgress();
  const date = todayKey();
  const questions = getDailyQuestions(date, 5);
  const doneToday = progress.dailyChallenge.date === date && progress.dailyChallenge.completed;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(doneToday);
  const q = questions[index];
  const pct = finished ? 100 : Math.round((index / questions.length) * 100);

  function verify() {
    if (selected === null || answered || doneToday) return;
    const ok = selected === q.answer;
    if (ok) setCorrect(c => c + 1);
    setAnswered(true);
  }

  function next() {
    const totalCorrect = correct + (selected === q.answer ? 1 : 0);
    if (index + 1 >= questions.length) {
      const res = awardDailyChallenge(date, totalCorrect, questions.length);
      res.newBadges.forEach(b => onToast(`${b.icon} Conquista desbloqueada: <strong>${b.name}</strong>`));
      setCorrect(totalCorrect);
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
    setAnswered(false);
  }

  return (
    <Overlay onClose={onClose}>
      <button className="close" onClick={onClose}>×</button>
      <h2>Desafio diário</h2>
      <p className="level-hint">5 perguntas rápidas para manter o ritmo.</p>
      <div className="daily-progress"><div className="daily-progress-fill" style={{ width: pct + '%' }} /></div>
      {finished ? (
        <div className="daily-done">
          <div className="daily-trophy">🏆</div>
          <h3>{doneToday ? 'Desafio de hoje concluído' : 'Mandou bem!'}</h3>
          <p>{doneToday ? `${progress.dailyChallenge.correct}/${progress.dailyChallenge.total} acertos hoje.` : `${correct}/${questions.length} acertos. XP adicionado ao perfil.`}</p>
          <button className="daily-primary" onClick={onClose}>Continuar</button>
        </div>
      ) : (
        <div className="daily-question">
          <span className="daily-source">{q.lessonTitle}</span>
          <div className="daily-q" dangerouslySetInnerHTML={{ __html: q.q }} />
          <div className="daily-options">
            {q.options.map((opt, oi) => {
              let cls = 'daily-opt';
              if (answered) {
                if (oi === q.answer) cls += ' correct';
                else if (oi === selected) cls += ' wrong';
              } else if (oi === selected) cls += ' selected';
              return <button key={oi} className={cls} disabled={answered} onClick={() => setSelected(oi)} dangerouslySetInnerHTML={{ __html: opt }} />;
            })}
          </div>
          <button className="daily-primary" disabled={selected === null} onClick={answered ? next : verify}>
            {answered ? (index + 1 >= questions.length ? 'Finalizar' : 'Continuar') : 'Verificar'}
          </button>
        </div>
      )}
    </Overlay>
  );
}

export function RankingModal({ onClose }: { onClose: () => void }) {
  const [period, setPeriod] = useState<'global' | 'weekly' | 'monthly'>('weekly');
  const [rows, setRows] = useState<RankingEntry[] | null>(null);

  useEffect(() => {
    getRanking(period).then(setRows).catch(() => setRows([]));
  }, [period]);

  function selectPeriod(next: 'global' | 'weekly' | 'monthly') {
    setRows(null);
    setPeriod(next);
  }

  return (
    <Overlay onClose={onClose}>
      <button className="close" onClick={onClose}>×</button>
      <h2>Ranking</h2>
      <div className="rank-tabs">
        <button className={period === 'weekly' ? 'active' : ''} onClick={() => selectPeriod('weekly')}>Semanal</button>
        <button className={period === 'monthly' ? 'active' : ''} onClick={() => selectPeriod('monthly')}>Mensal</button>
        <button className={period === 'global' ? 'active' : ''} onClick={() => selectPeriod('global')}>Global</button>
      </div>
      <div className="rank-list">
        {rows === null && <p className="level-hint">Carregando ranking...</p>}
        {rows !== null && rows.length === 0 && <p className="level-hint">Ainda não tem XP nesse período.</p>}
        {rows !== null && rows.map(row => (
          <div className="rank-row" key={row.id}>
            <span className={'rank-pos ' + (row.rank <= 3 ? 'top' : '')}>{row.rank}</span>
            <span className="rank-avatar">{row.avatar || '🦜'}</span>
            <div className="rank-user">
              <strong>{row.name}</strong>
              <small>{row.lessons} lições · {row.streak} streak</small>
            </div>
            <span className="rank-xp">{row.xp} XP</span>
          </div>
        ))}
      </div>
    </Overlay>
  );
}

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const { reset } = useProgress();
  return (
    <Overlay onClose={onClose}>
      <button className="close" onClick={onClose}>×</button>
      <h2>Configurações</h2>
      <div className="settings-list">
        <div className="settings-row">
          <div>
            <strong>Apagar progresso</strong>
            <p className="level-hint">Remove todo o progresso salvo neste dispositivo.</p>
          </div>
          <button className="danger-btn" onClick={() => {
            if (confirm('Apagar todo o progresso salvo?')) { reset(); onClose(); }
          }}>Resetar</button>
        </div>
      </div>
      <p className="app-version">AraraDev v1.0</p>
    </Overlay>
  );
}

export function PhaseCompleteModal({ unit, onClose }: { unit: string; onClose: () => void }) {
  return (
    <Overlay onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: 8 }}>🎉</div>
        <h2 style={{ color: 'var(--green)', margin: '0 0 6px', fontSize: '1.4rem' }}>{unit}</h2>
        <p style={{ color: '#888', margin: '0 0 28px' }}>Fase completa! Bora pra próxima.</p>
        <div className="actions" style={{ alignItems: 'center' }}>
          <button onClick={onClose}>Continuar trilha →</button>
        </div>
      </div>
    </Overlay>
  );
}
