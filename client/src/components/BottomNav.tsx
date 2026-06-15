import type { FC } from 'react';
import { IconCalendar, IconGear, IconMedal, IconTrilha, IconTrophy, IconUser } from './icons';

export type NavKey = 'trilha' | 'diario' | 'ranking' | 'conquistas' | 'perfil' | 'config';

export default function BottomNav({ active, onNav }: { active: NavKey; onNav: (k: NavKey) => void }) {
  const items: [NavKey, string, FC][] = [
    ['trilha', 'Trilha', IconTrilha],
    ['diario', 'Diário', IconCalendar],
    ['ranking', 'Ranking', IconMedal],
    ['conquistas', 'Conquistas', IconTrophy],
    ['perfil', 'Perfil', IconUser],
    ['config', 'Config', IconGear],
  ];
  return (
    <nav className="bottombar">
      {items.map(([key, label, Icon]) => (
        <button key={key} className={active === key ? 'active' : ''} onClick={() => onNav(key)}>
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
