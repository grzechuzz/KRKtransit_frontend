import { useId, useState } from 'react';
import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { LineStatsSearch } from '../../hooks/useLineStatsSearch';
import { useI18n } from '../../i18n-core';

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled' | 'type'> & {
  search: LineStatsSearch;
};

export default function LineSearchButton({ search, children, ...props }: Props) {
  const { t } = useI18n();
  const [hint, setHint] = useState<{ left: number; top: number } | null>(null);
  const missingLine = !search.draft.line.trim();
  const hintId = useId();

  const showHint = (x: number, y: number) => {
    if (!missingLine) return;
    setHint({
      left: Math.max(12, Math.min(x + 12, window.innerWidth - 204)),
      top: Math.max(12, Math.min(y + 12, window.innerHeight - 76)),
    });
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!missingLine) return;
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.detail > 0 ? event.clientX : bounds.left + bounds.width / 2;
    const y = event.detail > 0 ? event.clientY : bounds.bottom;
    showHint(x, y);
  };

  return (
    <>
      <button {...props} type="submit" aria-disabled={!search.canSubmit} aria-describedby={missingLine && hint ? hintId : undefined} style={{ ...props.style, ...(missingLine ? { cursor: 'not-allowed', opacity: 0.4 } : {}) }} disabled={!missingLine && !search.canSubmit} onClick={handleClick}
        onPointerEnter={event => showHint(event.clientX, event.clientY)}
        onPointerLeave={() => setHint(null)}
        onFocus={event => { const bounds = event.currentTarget.getBoundingClientRect(); showHint(bounds.left, bounds.bottom); }}
        onBlur={() => setHint(null)}
        onKeyDown={event => { if (event.key === 'Escape') setHint(null); }}
      >{children}</button>
      {hint && missingLine && createPortal(
        <p id={hintId} role="tooltip" style={hint} className="pointer-events-none fixed z-[2000] w-48 max-w-[calc(100vw-24px)] rounded-xl border border-blue-500/30 bg-surface px-4 py-3 text-sm font-semibold text-ink shadow-panel">{t.searchFilters.lineRequired}</p>,
        document.body,
      )}
    </>
  );
}
