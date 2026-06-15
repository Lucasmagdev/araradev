import type { FC } from 'react';
import { IconTrilha, IconTrophy, IconUser, IconGear } from './icons';

export type NavKey = 'trilha' | 'conquistas' | 'perfil' | 'config';

export default function BottomNav({ active, onNav }: { active: NavKey; onNav: (k: NavKey) => void }) {
  const items: [NavKey, string, FC][] = [
    ['trilha', 'Trilha', IconTrilha],
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
