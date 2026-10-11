import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Trap focus inside the returned ref while mounted, close on Escape, and
 * restore focus to the previously active element on unmount.
 */
export default function useFocusTrap(onClose) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    const previous = document.activeElement;
    if (node) {
      const first = node.querySelector(FOCUSABLE);
      (first || node).focus();
    }

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }
      if (event.key !== 'Tab' || !node) return;

      const items = Array.from(node.querySelectorAll(FOCUSABLE));
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [onClose]);

  return ref;
}
