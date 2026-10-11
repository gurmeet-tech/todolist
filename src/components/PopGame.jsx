import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

import Icon from './Icon';
import './PopGame.css';

const GRID = 5;
const CELLS = Array.from({ length: GRID * GRID }, (_, index) => index);

let audioContext;

function playPop() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    audioContext = audioContext || new Ctx();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(560, now);
    osc.frequency.exponentialRampToValueAtTime(170, now + 0.1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now);
    osc.stop(now + 0.16);
  } catch {
    /* audio unavailable */
  }
}

export default function PopGame({ onClose }) {
  const [popped, setPopped] = useState(() => new Set());
  const cleared = popped.size === CELLS.length;

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (!cleared) return undefined;
    const id = setTimeout(() => setPopped(new Set()), 900);
    return () => clearTimeout(id);
  }, [cleared]);

  const pop = index => {
    if (popped.has(index)) return;
    playPop();
    setPopped(prev => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  return (
    <div className="game" role="dialog" aria-modal="true" aria-label="Pop game" onClick={onClose}>
      <div className="game__panel" onClick={event => event.stopPropagation()}>
        <header className="game__head">
          <span className="game__title">{cleared ? 'Cleared' : 'Pop'}</span>
          <span className="game__count">
            {popped.size}/{CELLS.length}
          </span>
          <button type="button" className="game__close" onClick={onClose} aria-label="Close game">
            <Icon icon={Cancel01Icon} size={16} strokeWidth={2} />
          </button>
        </header>

        <div className="game__grid">
          {CELLS.map(index => {
            const isPopped = popped.has(index);
            return (
              <motion.button
                key={index}
                type="button"
                className="bubble"
                aria-label={`Bubble ${index + 1}`}
                onClick={() => pop(index)}
                initial={false}
                animate={isPopped ? { scale: 0.66, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                whileTap={isPopped ? { scale: 0.66 } : { scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 480, damping: 18 }}
              />
            );
          })}
        </div>

        <button
          type="button"
          className="game__reset"
          onClick={() => setPopped(new Set())}
          disabled={popped.size === 0}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
