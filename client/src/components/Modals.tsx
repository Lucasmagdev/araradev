import { useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { BADGES, getLevel, LEVELS } from '../lib/progress';

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div id="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">{children}</div>
    </div>
  );
}

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { progress, setNome } = useProgress();
  const [nome, setNomeLocal] = useState(progress.nome);
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
        <input
          className="nome-input" type="text" placeholder="Seu nome" maxLength={30}
          value={nome}
          onChange={(e) => { setNomeLocal(e.target.value); setNome(e.target.value.trim()); }}
        />
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
