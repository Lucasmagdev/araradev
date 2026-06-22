import { useEffect, useState } from 'react';
import { useProgress } from '../context/ProgressContext';
import { formatCreditTimer, getLevel } from '../lib/progress';
import { IconFlame, IconHeart, IconStar } from './icons';

export default function Header() {
  const { progress } = useProgress();
  const [now, setNow] = useState(() => Date.now());
  const level = getLevel(progress.xp);
  const pct = level.next ? Math.round(((progress.xp - level.min) / (level.next - level.min)) * 100) : 100;
  const creditTimer = formatCreditTimer(progress.credits.nextRechargeAt, now);

  useEffect(() => {
    if (!progress.credits.nextRechargeAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, [progress.credits.nextRechargeAt]);

  return (
    <header className="topbar">
      <div className="topbar-main">
        <div className="topbar-brand">
          <img src="/logoararadev.jpeg" className="brand-mascote" alt="TrilhaDev" />
          <span className="brand-name">TrilhaDev</span>
        </div>

        <div className="topbar-widgets">
          <div className="streak-card" title="Streak">
            <IconFlame />
            <span>{progress.streak.count}</span>
          </div>

          <div className={'credits-card' + (progress.credits.current === 0 ? ' empty' : '')} title={creditTimer ? `Vidas recarregam em ${creditTimer}` : 'Vidas cheias'}>
            <IconHeart />
            <span>{progress.credits.current}</span>
            {creditTimer && <span className="credits-timer">{creditTimer}</span>}
          </div>

          <div className="xp-card" title={level.next ? `${progress.xp} / ${level.next} XP · ${level.name}` : `${progress.xp} XP · ${level.name}`}>
            <IconStar />
            <span>{progress.xp}</span>
          </div>
        </div>
      </div>
      <div className="topbar-xp-line" aria-hidden="true">
        <div className="topbar-xp-fill" style={{ width: pct + '%' }} />
      </div>
    </header>
  );
}
