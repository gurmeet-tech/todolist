import { useMemo, useRef, useState } from 'react';
import {
  ListViewIcon,
  PlusSignIcon,
  Search01Icon,
  Tick02Icon
} from '@hugeicons/core-free-icons';

import Icon from './components/Icon';
import TodoItem from './components/TodoItem';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Done' }
];

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function App() {
  const [todos, setTodos] = useLocalStorage('geist-todos', []);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const add = raw => {
    const value = raw.trim();
    if (!value) return;
    setTodos(prev => [
      { id: makeId(), text: value, done: false, createdAt: Date.now() },
      ...prev
    ]);
  };

  const handleSubmit = event => {
    event.preventDefault();
    add(draft);
    setDraft('');
    inputRef.current?.focus();
  };

  const toggle = (id, done) =>
    setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, done } : todo)));

  const remove = id => setTodos(prev => prev.filter(todo => todo.id !== id));

  const update = (id, text) =>
    setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, text } : todo)));

  const clearCompleted = () => setTodos(prev => prev.filter(todo => !todo.done));

  const activeCount = todos.filter(todo => !todo.done).length;
  const doneCount = todos.length - activeCount;
  const allDone = todos.length > 0 && activeCount === 0;

  const toggleAll = () =>
    setTodos(prev => prev.map(todo => ({ ...todo, done: !allDone })));

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return todos.filter(todo => {
      if (filter === 'active' && todo.done) return false;
      if (filter === 'completed' && !todo.done) return false;
      if (q && !todo.text.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [todos, filter, query]);

  const emptyCopy =
    todos.length === 0
      ? { title: 'Nothing on the list yet', body: 'Add your first task above to get moving.' }
      : { title: 'No tasks match', body: 'Try another filter or clear the search.' };

  return (
    <div className="app">
      <main className="shell">
        <header className="masthead">
          <span className="eyebrow">List / Tasks</span>
          <h1 className="display">Todo</h1>
          <p className="lede">
            A quiet, keyboard-friendly place to keep track of what ships next. Everything is saved
            locally in your browser.
          </p>
        </header>

        <form className="composer" onSubmit={handleSubmit}>
          <span className="composer__icon" aria-hidden="true">
            <Icon icon={PlusSignIcon} size={18} />
          </span>
          <input
            ref={inputRef}
            className="composer__input"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="What needs doing?"
            aria-label="New task"
            autoComplete="off"
          />
          <button className="btn-primary-sm" type="submit" disabled={!draft.trim()}>
            Add
          </button>
        </form>

        <section className="toolbar" aria-label="Task controls">
          <label className="search">
            <Icon icon={Search01Icon} size={16} />
            <input
              className="search__input"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search tasks"
              aria-label="Search tasks"
              type="search"
            />
          </label>
          <div className="filters" role="tablist" aria-label="Filter tasks">
            {FILTERS.map(item => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filter === item.id}
                className={`pill${filter === item.id ? ' is-active' : ''}`}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <div className="meta">
          <button
            type="button"
            className="meta__all"
            onClick={toggleAll}
            disabled={todos.length === 0}
          >
            <span className={`meta__all-box${allDone ? ' is-on' : ''}`} aria-hidden="true">
              {allDone ? <Icon icon={Tick02Icon} size={14} /> : null}
            </span>
            {allDone ? 'Mark all active' : 'Mark all done'}
          </button>
          <span className="eyebrow meta__counts">
            {activeCount} active · {doneCount} done
          </span>
          <button
            type="button"
            className="link-btn"
            onClick={clearCompleted}
            disabled={doneCount === 0}
          >
            Clear completed
          </button>
        </div>

        {visible.length > 0 ? (
          <ul className="list">
            {visible.map(todo => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggle}
                onDelete={remove}
                onUpdate={update}
              />
            ))}
          </ul>
        ) : (
          <div className="empty">
            <span className="empty__icon" aria-hidden="true">
              <Icon icon={ListViewIcon} size={22} />
            </span>
            <p className="empty__title">{emptyCopy.title}</p>
            <p className="empty__body">{emptyCopy.body}</p>
          </div>
        )}

        <footer className="footnote">
          <span className="eyebrow">Geist system · plain canvas</span>
          <span className="eyebrow">{todos.length} total</span>
        </footer>
      </main>
    </div>
  );
}
