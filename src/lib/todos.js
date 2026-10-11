/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 * @property {'urgent' | 'day' | 'study'} type
 * @property {string} [subject]
 */

/** Generate a collision-resistant id. @returns {string} */
export const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Sort rank: active before done, then urgent before day before study. @param {Todo} todo */
const TYPE_RANK = { urgent: 0, day: 1, study: 2 };
const rank = todo => (todo.done ? 1 : 0) * 3 + (TYPE_RANK[todo.type] ?? 1);

/**
 * Active tasks first, then urgent before day before study, preserving insertion
 * order within each group. Returns a new array.
 * @param {Todo[]} todos
 * @returns {Todo[]}
 */
export const sortTodos = todos =>
  todos
    .map((todo, position) => ({ todo, position }))
    .sort((a, b) => rank(a.todo) - rank(b.todo) || a.position - b.position)
    .map(entry => entry.todo);
