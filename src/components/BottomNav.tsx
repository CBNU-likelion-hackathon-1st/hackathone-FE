import type { ReactNode } from 'react';
import './BottomNav.css';

export type BottomNavItem = {
  key: string;
  label: string;
  icon: ReactNode;
};

type BottomNavProps = {
  items: BottomNavItem[];
  activeKey: string;
};

function BottomNav({ items, activeKey }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`bottom-nav-item${item.key === activeKey ? ' active' : ''}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
