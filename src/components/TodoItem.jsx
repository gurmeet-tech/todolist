import { useEffect, useRef, useState } from 'react';
import { Delete02Icon, PencilEdit02Icon } from '@hugeicons/core-free-icons';

import SpringCheck from './SpringCheck';
import Icon from './Icon';

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) return;
    setDraft(todo.text);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => cancelAnimationFrame(frame);
  }, [editing, todo.text]);

  const commit = () => {
    const value = draft.trim();
    if (value && value !== todo.text) onUpdate(todo.id, value);
    setEditing(false);
  };

  const cancel = () => setEditing(false);

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancel();
    }
  };

  return (
    <li className={`todo${todo.done ? ' is-done' : ''}${editing ? ' is-editing' : ''}`}>
      <div className="todo__main">
        {editing ? (
          <input
            ref={inputRef}
            className="todo__edit"
            value={draft}
            onChange={event => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            aria-label="Edit task"
          />
        ) : (
          <SpringCheck
            label={todo.text}
            checked={todo.done}
            onChange={checked => onToggle(todo.id, checked)}
            color="#171717"
            fillColor="#171717"
            checkColor="#ffffff"
            boxSize={22}
            boxRadius={6}
            fontSize={15}
            bounce={0.25}
            strikeLag={0.14}
            doneOpacity={0.4}
            strike="left"
            className="todo__check"
          />
        )}
      </div>
      <div className="todo__actions">
        {!editing ? (
          <button
            type="button"
            className="icon-btn"
            onClick={() => setEditing(true)}
            aria-label="Edit task"
            title="Edit"
          >
            <Icon icon={PencilEdit02Icon} size={16} />
          </button>
        ) : null}
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
          title="Delete"
        >
          <Icon icon={Delete02Icon} size={16} />
        </button>
      </div>
    </li>
  );
}
