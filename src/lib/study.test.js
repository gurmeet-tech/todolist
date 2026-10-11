import { describe, expect, it } from 'vitest';

import { BASE_RATING, GAIN, buildStudyStats, extractSubject, ratingSeries } from './study';

describe('extractSubject', () => {
  it('prefers an explicit colon prefix', () => {
    expect(extractSubject('revision: integrals')).toBe('Revision');
  });

  it('recognises a known subject keyword', () => {
    expect(extractSubject('Finish physics homework')).toBe('Physics');
    expect(extractSubject('maths practice set 4')).toBe('Math');
  });

  it('falls back to the first word, title-cased', () => {
    expect(extractSubject('revision for finals')).toBe('Revision');
  });

  it('returns General for empty input', () => {
    expect(extractSubject('   ')).toBe('General');
    expect(extractSubject(undefined)).toBe('General');
  });
});

describe('ratingSeries', () => {
  const events = [
    { id: 'a', todoId: '1', subject: 'Math', delta: GAIN, at: 20 },
    { id: 'b', todoId: '2', subject: 'Physics', delta: -16, at: 30 },
    { id: 'c', todoId: '3', subject: 'Math', delta: -16, at: 40 }
  ];

  it('starts at the base rating and replays events in time order', () => {
    expect(ratingSeries(events)).toEqual([
      { t: 20, rating: BASE_RATING },
      { t: 20, rating: BASE_RATING + GAIN },
      { t: 30, rating: BASE_RATING + GAIN - 16 },
      { t: 40, rating: BASE_RATING + GAIN - 16 - 16 }
    ]);
  });

  it('filters to a single subject', () => {
    expect(ratingSeries(events, 'Physics')).toEqual([
      { t: 30, rating: BASE_RATING },
      { t: 30, rating: BASE_RATING - 16 }
    ]);
  });

  it('returns an empty series when nothing matches', () => {
    expect(ratingSeries([])).toEqual([]);
    expect(ratingSeries(events, 'Chemistry')).toEqual([]);
  });
});

describe('buildStudyStats', () => {
  const todos = [
    { id: '1', text: 'Math: chapter 1', done: true, type: 'study', subject: 'Math' },
    { id: '2', text: 'Physics: chapter 2', done: false, type: 'study', subject: 'Physics' },
    { id: '3', text: 'buy milk', done: false, type: 'day' }
  ];
  const now = Date.now();
  const events = [
    { id: 'a', todoId: '1', subject: 'Math', delta: GAIN, at: now - 1000 },
    { id: 'b', todoId: '1', subject: 'Math', delta: GAIN, at: now }
  ];

  it('aggregates completion, ratings and activity', () => {
    const stats = buildStudyStats(todos, events);
    expect(stats.totalStudy).toBe(2);
    expect(stats.doneStudy).toBe(1);
    expect(stats.completion).toBeCloseTo(0.5);
    expect(stats.subjects.map(item => item.name)).toEqual(['Math', 'Physics']);
    expect(stats.currentRating).toBe(BASE_RATING + 2 * GAIN);
    expect(stats.bestRating).toBe(BASE_RATING + 2 * GAIN);
    expect(stats.streak).toBe(2);
    expect(stats.last7).toBe(2);
    expect(stats.activeDays).toBe(1);
  });

  it('ignores non-study todos', () => {
    const stats = buildStudyStats([todos[2]], []);
    expect(stats.totalStudy).toBe(0);
    expect(stats.currentRating).toBe(BASE_RATING);
    expect(stats.subjects).toEqual([]);
  });
});
