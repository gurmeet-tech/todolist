import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ListViewIcon, Mic01Icon, PlusSignIcon } from '@hugeicons/core-free-icons';

import Icon from './components/Icon';
import Navbar from './components/Navbar';
import MathGame from './components/MathGame';
import Study from './components/Study';
import TodoItem from './components/TodoItem';
import useLocalStorage from './hooks/useLocalStorage';
import { makeId, sortTodos } from './lib/todos';
import { GAIN, LOSS, extractSubject } from './lib/study';
import './App.css';

export default function App() {
  const [todos, setTodos] = useLocalStorage('todos', []);
  const [studyLog, setStudyLog] = useLocalStorage('study-log', []);
  const [draft, setDraft] = useState('');
  const [asking, setAsking] = useState(false);
  const [listening, setListening] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [studying, setStudying] = useState(false);
  const [undo, setUndo] = useState(null);
  const inputRef = useRef(null);
  const askUrgentRef = useRef(null);
  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');

  const micSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const stopMic = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => () => recognitionRef.current?.stop?.(), []);

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

  const toggleMic = () => {
    if (listening) stopMic();
    else startMic();
  };

  const requestAdd = event => {
    event.preventDefault();
    if (!draft.trim()) return;
    stopMic();
    setAsking(true);
  };

  const confirmAdd = useCallback(
    type => {
      const value = draft.trim();
      if (value) {
        setTodos(prev => [
          {
            id: makeId(),
            text: value,
            done: false,
            type,
            ...(type === 'study' ? { subject: extractSubject(value) } : {})
          },
          ...prev
        ]);
      }
      stopMic();
      setDraft('');
      setAsking(false);
      inputRef.current?.focus();
    },
    [draft, setTodos, stopMic]
  );

  useEffect(() => {
    if (!asking) return undefined;
    askUrgentRef.current?.focus();
    const onKey = event => {
      if (event.key === 'Escape') setAsking(false);
      else if (event.key === '1') confirmAdd('urgent');
      else if (event.key === '2') confirmAdd('day');
      else if (event.key === '3') confirmAdd('study');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [asking, confirmAdd]);

  useEffect(() => {
    if (asking || playing || studying) return undefined;
    const onKey = event => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!typing && (event.key === 'n' || event.key === '/')) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [asking, playing, studying]);

  useEffect(() => {
    if (!undo) return undefined;
    const id = setTimeout(() => setUndo(null), 5000);
    return () => clearTimeout(id);
  }, [undo]);

  const toggle = (id, done) => {
    const todo = todos.find(item => item.id === id);
    if (todo && todo.type === 'study' && todo.done !== done) {
      setStudyLog(log => [
        ...log,
        {
          id: makeId(),
          todoId: todo.id,
          subject: todo.subject || extractSubject(todo.text),
          delta: done ? GAIN : -LOSS,
          at: Date.now()
        }
      ]);
    }
    setTodos(prev => prev.map(item => (item.id === id ? { ...item, done } : item)));
  };

  const remove = id => {
    const todo = todos.find(item => item.id === id);
    if (!todo) return;
    setUndo(prev => ({ items: [...(prev?.items ?? []), todo], label: 'Task deleted' }));
    setTodos(prev => prev.filter(item => item.id !== id));
  };

  const clearCompleted = () => {
    const done = todos.filter(item => item.done);
    if (done.length === 0) return;
    setUndo({ items: done, label: 'Completed cleared' });
    setTodos(prev => prev.filter(item => !item.done));
  };

  const undoRemove = () => {
    if (!undo) return;
    setTodos(prev => [...undo.items, ...prev]);
    setUndo(null);
  };

  const ordered = useMemo(() => sortTodos(todos), [todos]);
  const hasCompleted = todos.some(todo => todo.done);

  return (
    <div className="app">
      <Navbar onPlay={() => setPlaying(true)} onStudy={() => setStudying(true)} />

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
            <button
              ref={askUrgentRef}
              type="button"
              className="ask__option"
              onClick={() => confirmAdd('urgent')}
            >
              <span className="dot dot--urgent" aria-hidden="true" />
              Urgent
            </button>
            <button type="button" className="ask__option" onClick={() => confirmAdd('day')}>
              <span className="dot dot--day" aria-hidden="true" />
              Day
            </button>
            <button type="button" className="ask__option" onClick={() => confirmAdd('study')}>
              <span className="dot dot--study" aria-hidden="true" />
              Study
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
          <>
            <ul className="list">
              <AnimatePresence initial={false}>
                {ordered.map(todo => (
                  <TodoItem key={todo.id} todo={todo} onToggle={toggle} onDelete={remove} />
                ))}
              </AnimatePresence>
            </ul>
            {hasCompleted ? (
              <div className="listfoot">
                <button type="button" className="clear" onClick={clearCompleted}>
                  Clear completed
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="empty">
            <span className="empty__icon" aria-hidden="true">
              <Icon icon={ListViewIcon} size={20} />
            </span>
            <p className="empty__title">No tasks yet</p>
            <p className="empty__hint">Add one above to get started</p>
          </div>
        )}
      </main>

      {playing ? <MathGame onClose={() => setPlaying(false)} /> : null}

      {studying ? (
        <Study todos={todos} events={studyLog} onClose={() => setStudying(false)} />
      ) : null}

      <AnimatePresence>
        {undo ? (
          <motion.div
            className="toastwrap"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="toast" role="status" aria-live="polite">
              <span className="toast__text">{undo.label}</span>
              <button type="button" className="toast__undo" onClick={undoRemove}>
                Undo
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
