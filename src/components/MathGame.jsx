import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

import Icon from './Icon';
import useFocusTrap from '../hooks/useFocusTrap';
import useLocalStorage from '../hooks/useLocalStorage';
import { QUESTION_TIME, makeRound } from '../lib/quiz';
import './MathGame.css';

export default function MathGame({ onClose }) {
  const trapRef = useFocusTrap(onClose);
  const [best, setBest] = useLocalStorage('math-best', 0);
  const previousRef = useRef([]);

  const buildRound = () => {
    const next = makeRound(previousRef.current);
    previousRef.current = next.map(item => item.q);
    return next;
  };

  const [round, setRound] = useState(buildRound);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [time, setTime] = useState(QUESTION_TIME);
  const [done, setDone] = useState(false);

  const question = round[index];
  const locked = selected !== null;

  useEffect(() => {
    if (locked || done) return undefined;
    if (time <= 0) {
      setSelected('__timeout__');
      setStreak(0);
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
        setTime(QUESTION_TIME);
      }
    }, 950);
    return () => clearTimeout(id);
  }, [locked, index, round.length]);

  useEffect(() => {
    if (done && score > best) setBest(score);
  }, [done, score, best, setBest]);

  const choose = option => {
    if (locked) return;
    setSelected(option);
    if (option === question.answer) {
      setScore(value => value + 1);
      setStreak(value => {
        const next = value + 1;
        setBestStreak(current => Math.max(current, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const restart = () => {
    setRound(buildRound());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTime(QUESTION_TIME);
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
      <div
        className="math__panel"
        ref={trapRef}
        tabIndex={-1}
        onClick={event => event.stopPropagation()}
      >
        <header className="math__head">
          <span className="math__topic">{done ? 'Result' : question.topic}</span>
          {streak > 1 ? <span className="math__streak">{streak} streak</span> : null}
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
            <div className="math__stats">
              <span>Best score {Math.max(best, score)}</span>
              <span>Best streak {bestStreak}</span>
            </div>
            <button type="button" className="math__again" onClick={restart}>
              Play again
            </button>
          </div>
        ) : (
          <>
            <div className="math__bar">
              <span style={{ width: `${(time / QUESTION_TIME) * 100}%` }} />
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
