import { Delete02Icon } from '@hugeicons/core-free-icons';

import SpringCheck from './SpringCheck';
import Icon from './Icon';

export default function TodoItem({ todo, onToggle, onDelete }) {
  const type = todo.type === 'urgent' ? 'urgent' : 'day';

  return (
    <li className={`todo${todo.done ? ' is-done' : ''}`}>
      <div className="todo__main">
        <SpringCheck
          label={todo.text}
          checked={todo.done}
          onChange={checked => onToggle(todo.id, checked)}
          color="#111111"
          fillColor="#111111"
          checkColor="#ffffff"
          boxSize={22}
          boxRadius={6}
          fontSize={16}
          bounce={0.25}
          strikeLag={0.14}
          doneOpacity={0.35}
          strike="left"
          className="todo__check"
        />
      </div>

      <span className={`tag tag--${type}`}>
        <span className="tag__dot" aria-hidden="true" />
        {type === 'urgent' ? 'Urgent' : 'Day'}
      </span>
      <button
        type="button"
        className="todo__delete"
        onClick={() => onDelete(todo.id)}
        aria-label="Delete task"
        title="Delete"
      >
        <Icon icon={Delete02Icon} size={16} />
      </button>
    </li>
  );
}
