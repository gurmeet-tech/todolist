import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

import Icon from './Icon';
import './MathGame.css';

const TIME = 15;
const ROUND = 8;

const BANK = [
  { topic: 'Matrices', q: 'If A is 2×3 and B is 3×4, the order of AB is', options: ['2×4', '3×3', '4×2', '2×3'], answer: '2×4' },
  { topic: 'Matrices', q: 'The determinant of [[3, 1], [2, 4]] is', options: ['10', '14', '8', '2'], answer: '10' },
  { topic: 'Matrices', q: 'A matrix has 8 elements. Which order is impossible?', options: ['3×3', '2×4', '4×2', '1×8'], answer: '3×3' },
  { topic: 'Matrices', q: '(Aᵀ)ᵀ equals', options: ['A', 'Aᵀ', 'A⁻¹', 'I'], answer: 'A' },
  { topic: 'Matrices', q: 'The trace of [[1, 2], [3, 4]] is', options: ['5', '7', '10', '4'], answer: '5' },
  { topic: 'Matrices', q: 'The determinant of [[2, 0], [0, 3]] is', options: ['6', '5', '0', '1'], answer: '6' },
  { topic: 'Differentiation', q: 'd/dx (x⁵) =', options: ['5x⁴', 'x⁴', '5x⁶', '4x⁵'], answer: '5x⁴' },
  { topic: 'Differentiation', q: 'd/dx (sin x) =', options: ['cos x', '−cos x', 'sin x', '−sin x'], answer: 'cos x' },
  { topic: 'Differentiation', q: 'd/dx (e³ˣ) =', options: ['3e³ˣ', 'e³ˣ', '3x·e³ˣ', 'e³'], answer: '3e³ˣ' },
  { topic: 'Differentiation', q: 'd/dx (ln x) =', options: ['1/x', 'x', 'ln x', '−1/x'], answer: '1/x' },
  { topic: 'Differentiation', q: 'd/dx (cos x) =', options: ['−sin x', 'sin x', '−cos x', 'cos x'], answer: '−sin x' },
  { topic: 'Differentiation', q: 'd/dx (tan x) =', options: ['sec²x', '−sec²x', 'sec x·tan x', 'cos²x'], answer: 'sec²x' },
  { topic: 'Differentiation', q: 'd/dx (x² sin x) =', options: ['2x sin x + x² cos x', '2x cos x', 'x² cos x', '2x sin x'], answer: '2x sin x + x² cos x' },
  { topic: 'Differentiation', q: 'd/dx (7) =', options: ['0', '7', '1', '7x'], answer: '0' },
  { topic: 'Relations & Functions', q: 'The domain of f(x) = 1/(x − 2) is', options: ['R − {2}', 'R', 'R − {0}', '(2, ∞)'], answer: 'R − {2}' },
  { topic: 'Relations & Functions', q: 'If f(x) = x², then f(f(x)) =', options: ['x⁴', 'x²', '2x²', 'x⁸'], answer: 'x⁴' },
  { topic: 'Relations & Functions', q: 'The range of f(x) = x² over R is', options: ['[0, ∞)', 'R', '(0, ∞)', '[1, ∞)'], answer: '[0, ∞)' },
  { topic: 'Relations & Functions', q: 'A relation R on a set A is a subset of', options: ['A × A', 'A', 'A ∪ A', '∅ only'], answer: 'A × A' },
  { topic: 'Relations & Functions', q: 'Number of relations from a 2-element set to a 3-element set', options: ['64', '32', '16', '6'], answer: '64' },
  { topic: 'Relations & Functions', q: 'f : R → R, f(x) = 2x + 1 is', options: ['one-one and onto', 'one-one only', 'onto only', 'neither'], answer: 'one-one and onto' },
  { topic: 'Relations & Functions', q: 'The domain of √(x − 3) is', options: ['[3, ∞)', '(3, ∞)', 'R', '(−∞, 3]'], answer: '[3, ∞)' }
];

const shuffle = list => {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const makeRound = () =>
  shuffle(BANK)
    .slice(0, ROUND)
    .map(item => ({ ...item, options: shuffle(item.options) }));

export default function MathGame({ onClose }) {
  const [round, setRound] = useState(makeRound);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(TIME);
  const [done, setDone] = useState(false);

  const question = round[index];
  const locked = selected !== null;

  useEffect(() => {
    const onKey = event => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    if (locked || done) return undefined;
    if (time <= 0) {
      setSelected('__timeout__');
      return undefined;
    }
    const id = setTimeout(() => setTime(value => value - 1), 1000);
    return () => clearTimeout(id);
  }, [time, locked, done]);

  useEffect(() => {
    if (!locked) return undefined;
    const id = setTimeout(() => {
      if (index + 1 >= round.length) {
        setDone(true);
      } else {
        setIndex(value => value + 1);
        setSelected(null);
        setTime(TIME);
      }
    }, 950);
    return () => clearTimeout(id);
  }, [locked, index, round.length]);

  const choose = option => {
    if (locked) return;
    setSelected(option);
    if (option === question.answer) setScore(value => value + 1);
  };

  const restart = () => {
    setRound(makeRound());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setTime(TIME);
    setDone(false);
  };

  const optionClass = option => {
    if (!locked) return 'opt';
    if (option === question.answer) return 'opt opt--correct';
    if (option === selected) return 'opt opt--wrong';
    return 'opt opt--dim';
  };

  return (
    <div
      className="math"
      role="dialog"
      aria-modal="true"
      aria-label="Quick math game"
      onClick={onClose}
    >
      <div className="math__panel" onClick={event => event.stopPropagation()}>
        <header className="math__head">
          <span className="math__topic">{done ? 'Result' : question.topic}</span>
          <span className="math__step">
            {done ? `${score}/${round.length}` : `${index + 1}/${round.length}`}
          </span>
          <button type="button" className="math__close" onClick={onClose} aria-label="Close game">
            <Icon icon={Cancel01Icon} size={16} strokeWidth={2} />
          </button>
        </header>

        {done ? (
          <div className="math__end">
            <p className="math__big">
              {score}
              <span>/{round.length}</span>
            </p>
            <p className="math__verdict">
              {score === round.length
                ? 'Perfect run'
                : score >= round.length / 2
                  ? 'Solid work'
                  : 'Keep practising'}
            </p>
            <button type="button" className="math__again" onClick={restart}>
              Play again
            </button>
          </div>
        ) : (
          <>
            <div className="math__bar">
              <span style={{ width: `${(time / TIME) * 100}%` }} />
            </div>
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            >
              <p className="math__q">{question.q}</p>
              <div className="math__options">
                {question.options.map(option => (
                  <button
                    key={option}
                    type="button"
                    className={optionClass(option)}
                    onClick={() => choose(option)}
                    disabled={locked}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
