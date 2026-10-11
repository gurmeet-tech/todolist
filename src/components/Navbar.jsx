import { ChartLineData01Icon, GameController02Icon, Tick02Icon } from '@hugeicons/core-free-icons';

import Icon from './Icon';
import './Navbar.css';

export default function Navbar({ onPlay, onStudy }) {
  return (
    <header className="nav">
      <nav className="nav__glass" aria-label="Primary">
        <span className="nav__brand">
          <span className="nav__mark" aria-hidden="true">
            <Icon icon={Tick02Icon} size={14} strokeWidth={2.6} />
          </span>
          <span className="nav__name">Todo</span>
        </span>
        <div className="nav__actions">
          <button type="button" className="nav__study" onClick={onStudy}>
            <Icon icon={ChartLineData01Icon} size={16} strokeWidth={2} />
            <span>Study</span>
          </button>
          <button type="button" className="nav__play" onClick={onPlay}>
            <Icon icon={GameController02Icon} size={16} strokeWidth={2} />
            <span>Play</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
