import { GameController02Icon, Tick02Icon } from '@hugeicons/core-free-icons';

import Icon from './Icon';
import './Navbar.css';

export default function Navbar({ onPlay }) {
  return (
    <header className="nav">
      <nav className="nav__glass" aria-label="Primary">
        <span className="nav__brand">
          <span className="nav__mark" aria-hidden="true">
            <Icon icon={Tick02Icon} size={14} strokeWidth={2.6} />
          </span>
          <span className="nav__name">Todo</span>
        </span>
        <button type="button" className="nav__play" onClick={onPlay}>
          <Icon icon={GameController02Icon} size={16} strokeWidth={2} />
          <span>Play</span>
        </button>
      </nav>
    </header>
  );
}
