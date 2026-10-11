/**
 * @typedef {Object} Todo
 * @property {string} id
 * @property {string} text
 * @property {boolean} done
 * @property {'urgent' | 'day'} type
 */

/** Generate a collision-resistant id. @returns {string} */
export const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Sort rank: active before done, then urgent before day. @param {Todo} todo */
const rank = todo => (todo.done ? 1 : 0) * 2 + (todo.type === 'urgent' ? 0 : 1);

/**
 * Active tasks first, then urgent before day, preserving insertion order within
 * each group. Returns a new array.
 * @param {Todo[]} todos
 * @returns {Todo[]}
 */
export const sortTodos = todos =>
  todos
    .map((todo, position) => ({ todo, position }))
    .sort((a, b) => rank(a.todo) - rank(b.todo) || a.position - b.position)
    .map(entry => entry.todo);
