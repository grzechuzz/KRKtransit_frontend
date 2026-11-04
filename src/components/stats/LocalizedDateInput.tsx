import { useRef } from 'react';
import { useI18n } from '../../i18n-core';
import { formatDateLabel } from '../../utils/lineStatsSearch';

export default function LocalizedDateInput({
  id,
  value,
  min,
  max,
  onChange,
  label,
  className = '',
}: {
  id: string;
  label: string;
  value: string;
  min: string;
  max: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const { locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
  };

  return (
    <div className={`relative ${className}`} onClick={openPicker}>
      <input
        ref={inputRef}
        id={id}
        aria-label={label}
        required
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0 [color-scheme:inherit]"
      />
      <div
        aria-hidden="true"
        className="flex h-full w-full items-center justify-between gap-2 rounded-lg border border-overlay/10 bg-overlay/5 px-3 text-sm text-ink outline-none transition peer-focus:border-blue-500 peer-focus:ring-1 peer-focus:ring-blue-500"
      >
        <span className="truncate">{formatDateLabel(value, locale)}</span>
        <svg
          className="h-4 w-4 shrink-0 text-subtle"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
        </svg>
      </div>
    </div>
  );
}

