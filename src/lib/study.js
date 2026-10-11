export const BASE_RATING = 1000;
export const GAIN = 24;
export const LOSS = 16;

/**
 * @typedef {Object} StudyEvent
 * @property {string} id
 * @property {string} todoId
 * @property {string} subject
 * @property {number} delta
 * @property {number} at
 */

/**
 * @typedef {Object} RatingPoint
 * @property {number} t
 * @property {number} rating
 */

const SUBJECT_KEYWORDS = [
  ['mathematics', 'Math'],
  ['maths', 'Math'],
  ['math', 'Math'],
  ['physics', 'Physics'],
  ['chemistry', 'Chemistry'],
  ['biology', 'Biology'],
  ['english', 'English'],
  ['hindi', 'Hindi'],
  ['history', 'History'],
  ['geography', 'Geography'],
  ['economics', 'Economics'],
  ['computer', 'Computer'],
  ['science', 'Science'],
  ['french', 'French'],
  ['spanish', 'Spanish'],
  ['accounts', 'Accounts'],
  ['accountancy', 'Accounts'],
  ['business', 'Business'],
  ['statistics', 'Statistics'],
  ['algebra', 'Algebra'],
  ['calculus', 'Calculus'],
  ['geometry', 'Geometry']
];

const titleCase = value =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/**
 * Derive a subject label from a task title. Prefers an explicit "Subject: ..."
 * style prefix, then a recognised subject keyword, then the first word.
 * @param {string} text
 * @returns {string}
 */
export const extractSubject = text => {
  const clean = (text || '').trim();
  if (!clean) return 'General';

  const colon = clean.match(/^([^:]{1,28}):/);
  if (colon) {
    const named = titleCase(colon[1]);
    if (named) return named;
  }

  const lower = clean.toLowerCase();
  for (const [keyword, canonical] of SUBJECT_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`).test(lower)) return canonical;
  }

  const firstWord = clean
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .trim()
    .split(/\s+/)[0];
  return firstWord ? titleCase(firstWord) : 'General';
};

/**
 * Replay study events into a rating series. When `subject` is given only that
 * subject's events are considered, otherwise all events form one overall curve.
 * @param {StudyEvent[]} events
 * @param {string} [subject]
 * @returns {RatingPoint[]}
 */
export const ratingSeries = (events, subject) => {
  const relevant = subject ? events.filter(event => event.subject === subject) : events;
  if (relevant.length === 0) return [];

  const ordered = [...relevant].sort((a, b) => a.at - b.at);
  const points = [{ t: ordered[0].at, rating: BASE_RATING }];
  let rating = BASE_RATING;
  for (const event of ordered) {
    rating += event.delta;
    points.push({ t: event.at, rating });
  }
  return points;
};

/**
 * Aggregate everything the study dashboard needs.
 * @param {import('./todos').Todo[]} todos
 * @param {StudyEvent[]} events
 */
export const buildStudyStats = (todos, events) => {
  const studyTodos = todos.filter(todo => todo.type === 'study');
  const bySubject = new Map();

  for (const todo of studyTodos) {
    const subject = todo.subject || extractSubject(todo.text);
    if (!bySubject.has(subject)) bySubject.set(subject, { name: subject, total: 0, done: 0 });
    const entry = bySubject.get(subject);
    entry.total += 1;
    if (todo.done) entry.done += 1;
  }

  const overall = ratingSeries(events);
  const currentRating = overall.length ? overall[overall.length - 1].rating : BASE_RATING;
  const bestRating = overall.reduce((best, point) => Math.max(best, point.rating), BASE_RATING);

  const ordered = [...events].sort((a, b) => a.at - b.at);
  let streak = 0;
  for (let i = ordered.length - 1; i >= 0; i -= 1) {
    if (ordered[i].delta > 0) streak += 1;
    else break;
  }

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const last7 = ordered.filter(event => event.delta > 0 && event.at >= weekAgo).length;
  const activeDays = new Set(
    ordered.filter(event => event.delta > 0).map(event => new Date(event.at).toDateString())
  ).size;

  const subjects = [...bySubject.values()]
    .map(entry => {
      const series = ratingSeries(events, entry.name);
      const rating = series.length ? series[series.length - 1].rating : BASE_RATING;
      return {
        ...entry,
        rating,
        series,
        progress: entry.total ? entry.done / entry.total : 0
      };
    })
    .sort((a, b) => b.rating - a.rating);

  const totalStudy = studyTodos.length;
  const doneStudy = studyTodos.filter(todo => todo.done).length;

  return {
    overall,
    currentRating,
    bestRating,
    streak,
    last7,
    activeDays,
    subjects,
    totalStudy,
    doneStudy,
    completion: totalStudy ? doneStudy / totalStudy : 0
  };
};
