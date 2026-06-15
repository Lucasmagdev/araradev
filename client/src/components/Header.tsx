import { useProgress } from '../context/ProgressContext';
import { getLevel } from '../lib/progress';
import { IconFlame, IconStar } from './icons';

export default function Header() {
  const { progress } = useProgress();
  const level = getLevel(progress.xp);
  const pct = level.next ? Math.round(((progress.xp - level.min) / (level.next - level.min)) * 100) : 100;

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <img src="/logoararadev.jpeg" className="brand-mascote" alt="AraraDev" />
        <span className="brand-name">AraraDev</span>
      </div>

      <div className="topbar-widgets">
        <div className="streak-card">
          <div className="streak-card-value">
            <IconFlame />
            <span>{progress.streak.count}</span>
          </div>
        </div>

        <div className="xp-card">
          <div className="xp-card-top">
            <IconStar />
            <span>{level.next ? `${progress.xp} / ${level.next} XP` : `${progress.xp} XP`}</span>
            <span className="xp-level-label">{level.name}</span>
          </div>
          <div className="xp-bar-wrap">
            <div className="xp-bar-fill" style={{ width: pct + '%' }} />
          </div>
        </div>
      </div>
    </header>
  );
}
