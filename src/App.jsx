import { useRef, useState } from 'react';
import { PlusSignIcon } from '@hugeicons/core-free-icons';

import Icon from './components/Icon';
import Navbar from './components/Navbar';
import PopGame from './components/PopGame';
import TodoItem from './components/TodoItem';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';

const makeId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function App() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [draft, setDraft] = useState('');
  const [playing, setPlaying] = useState(false);
  const inputRef = useRef(null);

  const add = raw => {
    const value = raw.trim();
    if (!value) return;
    setTodos(prev => [{ id: makeId(), text: value, done: false }, ...prev]);
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

  return (
    <div className="app">
      <Navbar onPlay={() => setPlaying(true)} />

      <main className="shell">
        <h1 className="title">Todo</h1>

        <form className="composer" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            className="composer__input"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Add a task"
            aria-label="Add a task"
            autoComplete="off"
          />
          <button className="add" type="submit" disabled={!draft.trim()} aria-label="Add task">
            <Icon icon={PlusSignIcon} size={20} strokeWidth={2} />
          </button>
        </form>

        {todos.length > 0 ? (
          <ul className="list">
            {todos.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggle} onDelete={remove} />
            ))}
          </ul>
        ) : (
          <p className="empty">No tasks</p>
        )}
      </main>

      {playing ? <PopGame onClose={() => setPlaying(false)} /> : null}
    </div>
  );
}
