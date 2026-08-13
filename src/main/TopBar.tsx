import type { ReactNode } from 'react';
import './TopBar.css';

type TopBarProps = {
  left?: ReactNode;
  title: string;
  right?: ReactNode;
};

function TopBar({ left, title, right }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="top-bar-slot">{left}</div>
      <h1 className="top-bar-title">{title}</h1>
      <div className="top-bar-slot top-bar-slot-right">{right}</div>
    </header>
  );
}

export default TopBar;
