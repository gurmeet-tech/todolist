import { describe, expect, it } from 'vitest';

import { makeId, sortTodos } from './todos';

describe('makeId', () => {
  it('returns unique strings', () => {
    const a = makeId();
    const b = makeId();
    expect(typeof a).toBe('string');
    expect(a.length).toBeGreaterThan(0);
    expect(a).not.toBe(b);
  });
});

describe('sortTodos', () => {
  it('orders active before done, then urgent before day before study', () => {
    const todos = [
      { id: '1', text: 'a', done: true, type: 'urgent' },
      { id: '2', text: 'b', done: false, type: 'day' },
      { id: '3', text: 'c', done: false, type: 'urgent' },
      { id: '4', text: 'd', done: true, type: 'day' },
      { id: '5', text: 'e', done: false, type: 'study' },
      { id: '6', text: 'f', done: true, type: 'study' }
    ];
    expect(sortTodos(todos).map(todo => todo.id)).toEqual(['3', '2', '5', '1', '4', '6']);
  });

  it('preserves insertion order within a group', () => {
    const todos = [
      { id: '1', text: 'a', done: false, type: 'urgent' },
      { id: '2', text: 'b', done: false, type: 'urgent' },
      { id: '3', text: 'c', done: false, type: 'urgent' }
    ];
    expect(sortTodos(todos).map(todo => todo.id)).toEqual(['1', '2', '3']);
  });

  it('does not mutate its input', () => {
    const todos = [{ id: '1', text: 'a', done: false, type: 'day' }];
    const snapshot = [...todos];
    sortTodos(todos);
    expect(todos).toEqual(snapshot);
  });
});
