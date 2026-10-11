import { useMemo, useState } from 'react';
import { Cancel01Icon } from '@hugeicons/core-free-icons';

import Icon from './Icon';
import RatingChart from './RatingChart';
import useFocusTrap from '../hooks/useFocusTrap';
import { buildStudyStats } from '../lib/study';
import './Study.css';

const SUBJECT_COLORS = ['#7928ca', '#0070f3', '#0a7d5a', '#e0700a', '#eb367f', '#5b6470'];

export default function Study({ todos, events, onClose }) {
  const trapRef = useFocusTrap(onClose);
  const stats = useMemo(() => buildStudyStats(todos, events), [todos, events]);
  const [selected, setSelected] = useState(null);

  const subject = selected ? stats.subjects.find(item => item.name === selected) : null;
  const points = subject ? subject.series : stats.overall;
  const rating = subject ? subject.rating : stats.currentRating;
  const colorIndex = subject ? stats.subjects.findIndex(item => item.name === subject.name) : -1;
  const accent = colorIndex >= 0 ? SUBJECT_COLORS[colorIndex % SUBJECT_COLORS.length] : '#7928ca';

  const change =
    points && points.length > 1
      ? points[points.length - 1].rating - points[points.length - 2].rating
      : 0;

  return (
    <div
      className="study"
      role="dialog"
      aria-modal="true"
      aria-label="Study progress"
      onClick={onClose}
    >
      <div
        className="study__panel"
        ref={trapRef}
        tabIndex={-1}
        onClick={event => event.stopPropagation()}
      >
        <header className="study__head">
          <span className="study__title">Study</span>
          <button type="button" className="study__close" onClick={onClose} aria-label="Close study">
            <Icon icon={Cancel01Icon} size={16} strokeWidth={2} />
          </button>
        </header>

        {stats.totalStudy === 0 ? (
          <div className="study__empty">
            <p className="study__empty-title">No study tasks yet</p>
            <p className="study__empty-hint">
              Add a task and choose <strong>Study</strong>. Put the subject in the title, like
              “Math: chapter 5”, to track it separately.
            </p>
          </div>
        ) : (
          <>
            <div className="study__hero">
              <span className="study__rating-value">{rating}</span>
              <span
                className={`study__change${change < 0 ? ' is-down' : ''}${change === 0 ? ' is-flat' : ''}`}
              >
                {change === 0 ? '—' : `${change > 0 ? '▲' : '▼'} ${Math.abs(change)}`}
              </span>
              <span className="study__rating-label">
                {subject ? subject.name : 'Overall rating'}
              </span>
            </div>

            <RatingChart
              points={points}
              accent={accent}
              label={subject ? subject.name : 'Overall rating'}
            />

            <div className="study__chips" role="tablist" aria-label="Subjects">
              <button
                type="button"
                role="tab"
                aria-selected={selected === null}
                className={`chip${selected === null ? ' is-active' : ''}`}
                onClick={() => setSelected(null)}
              >
                Overall
              </button>
              {stats.subjects.map(item => (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  aria-selected={selected === item.name}
                  className={`chip${selected === item.name ? ' is-active' : ''}`}
                  onClick={() => setSelected(item.name)}
                >
                  {item.name}
                </button>
              ))}
            </div>

            <div className="study__stats">
              <div className="stat">
                <span className="stat__value">
                  {stats.doneStudy}
                  <small>/{stats.totalStudy}</small>
                </span>
                <span className="stat__label">Done</span>
              </div>
              <div className="stat">
                <span className="stat__value">{Math.round(stats.completion * 100)}%</span>
                <span className="stat__label">Completion</span>
              </div>
              <div className="stat">
                <span className="stat__value">{stats.streak}</span>
                <span className="stat__label">Streak</span>
              </div>
              <div className="stat">
                <span className="stat__value">{stats.bestRating}</span>
                <span className="stat__label">Best</span>
              </div>
              <div className="stat">
                <span className="stat__value">{stats.last7}</span>
                <span className="stat__label">This week</span>
              </div>
              <div className="stat">
                <span className="stat__value">{stats.activeDays}</span>
                <span className="stat__label">Active days</span>
              </div>
            </div>

            <div className="study__subjects">
              <span className="study__section">Subjects</span>
              {stats.subjects.length === 0 ? (
                <p className="study__none">No subjects yet</p>
              ) : (
                stats.subjects.map(item => (
                  <button
                    key={item.name}
                    type="button"
                    className="subject"
                    onClick={() => setSelected(item.name)}
                  >
                    <span className="subject__name">{item.name}</span>
                    <span className="subject__bar" aria-hidden="true">
                      <span style={{ width: `${Math.round(item.progress * 100)}%` }} />
                    </span>
                    <span className="subject__meta">
                      {item.done}/{item.total}
                    </span>
                    <span className="subject__rating">{item.rating}</span>
                  </button>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
