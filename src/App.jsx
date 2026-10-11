import { useEffect, useMemo, useRef, useState } from 'react';
import { Mic01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';

import Icon from './components/Icon';
import Navbar from './components/Navbar';
import MathGame from './components/MathGame';
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
  const [asking, setAsking] = useState(false);
  const [listening, setListening] = useState(false);
  const [playing, setPlaying] = useState(false);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');

  const micSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const add = (raw, type) => {
    const value = raw.trim();
    if (!value) return;
    setTodos(prev => [{ id: makeId(), text: value, done: false, type }, ...prev]);
  };

  const requestAdd = event => {
    event.preventDefault();
    if (!draft.trim()) return;
    setAsking(true);
  };

  const confirmAdd = type => {
    add(draft, type);
    setDraft('');
    setAsking(false);
    inputRef.current?.focus();
  };

  const startMic = () => {
    if (!micSupported || listening) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    baseTextRef.current = draft.trim() ? `${draft.trim()} ` : '';
    recognition.onresult = event => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      setDraft(baseTextRef.current + transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stopMic = () => recognitionRef.current?.stop();

  const toggleMic = () => {
    if (listening) stopMic();
    else startMic();
  };

  const toggle = (id, done) =>
    setTodos(prev => prev.map(todo => (todo.id === id ? { ...todo, done } : todo)));

  const remove = id => setTodos(prev => prev.filter(todo => todo.id !== id));

  const ordered = useMemo(
    () =>
      todos
        .map((todo, position) => ({ todo, position }))
        .sort((a, b) => {
          const rankA = a.todo.type === 'urgent' ? 0 : 1;
          const rankB = b.todo.type === 'urgent' ? 0 : 1;
          return rankA - rankB || a.position - b.position;
        })
        .map(entry => entry.todo),
    [todos]
  );

  return (
    <div className="app">
      <Navbar onPlay={() => setPlaying(true)} />

      <main className="shell">
        <h1 className="title">Todo</h1>

        <form className="composer" onSubmit={requestAdd}>
          <input
            ref={inputRef}
            className="composer__input"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            placeholder="Add a task"
            aria-label="Add a task"
            autoComplete="off"
          />
          <button
            type="button"
            className={`mic${listening ? ' is-listening' : ''}`}
            onClick={toggleMic}
            disabled={!micSupported}
            aria-label={listening ? 'Stop dictation' : 'Dictate task'}
            aria-pressed={listening}
            title={micSupported ? 'Dictate' : 'Voice input not supported'}
          >
            <Icon icon={Mic01Icon} size={18} strokeWidth={2} />
          </button>
          <button className="add" type="submit" disabled={!draft.trim()} aria-label="Add task">
            <Icon icon={PlusSignIcon} size={20} strokeWidth={2} />
          </button>
        </form>

        {asking ? (
          <div className="ask" role="dialog" aria-label="Choose task type">
            <span className="ask__label">Add to</span>
            <button type="button" className="ask__option" onClick={() => confirmAdd('urgent')}>
              <span className="mode__dot mode__dot--urgent" aria-hidden="true" />
              Urgent
            </button>
            <button type="button" className="ask__option" onClick={() => confirmAdd('day')}>
              <span className="mode__dot mode__dot--day" aria-hidden="true" />
              Day
            </button>
            <button
              type="button"
              className="ask__cancel"
              onClick={() => setAsking(false)}
              aria-label="Cancel"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {todos.length > 0 ? (
          <ul className="list">
            {ordered.map(todo => (
              <TodoItem key={todo.id} todo={todo} onToggle={toggle} onDelete={remove} />
            ))}
          </ul>
        ) : (
          <p className="empty">No tasks</p>
        )}
      </main>

      {playing ? <MathGame onClose={() => setPlaying(false)} /> : null}
    </div>
  );
}
