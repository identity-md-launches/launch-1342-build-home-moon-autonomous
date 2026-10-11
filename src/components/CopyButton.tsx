import { useEffect, useState } from 'react';
import { Icon } from './Icon';
import { strings } from '../content/site';

interface Props {
  value: string;
  label?: string;
}

/** Copies `value` to the clipboard; shows a check and announces "Copied" for 1.5s. */
export function CopyButton({ value, label = strings.footer.copy }: Props) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const id = window.setTimeout(() => setDone(false), 1500);
    return () => window.clearTimeout(id);
  }, [done]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setDone(true);
    } catch {
      // Clipboard can be blocked (insecure context). Fall back to a selectable prompt.
      window.prompt(label, value);
    }
  };

  return (
    <>
      <button type="button" className="icon-btn" onClick={copy} aria-label={label}>
        <Icon name={done ? 'check' : 'copy'} size={16} />
      </button>
      <span className="visually-hidden" role="status" aria-live="polite">
        {done ? strings.footer.copied : ''}
      </span>
    </>
  );
}
