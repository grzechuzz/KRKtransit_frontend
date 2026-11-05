import { useEffect, useId, useRef, useState } from 'react';
import { useI18n } from '../../i18n-core';
import { DELAY_MAP_SCALE, NO_MEASUREMENTS_COLOR } from './delayMapColors';
import { useMapStopColors } from '../../hooks/useMapStopColors';

export default function DelayMapLegend() {
  const { t } = useI18n();
  const stopColors = useMapStopColors();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="pointer-events-none absolute top-3 left-3 z-[1000] flex max-h-[calc(100%_-_1.5rem)] w-64 max-w-[calc(100%_-_4.5rem)] flex-col items-start sm:w-72">
      <button type="button" aria-expanded={open} aria-controls={open ? panelId : undefined} onClick={() => setOpen(current => !current)}
        className={`pointer-events-auto flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-surface/90 px-3 py-2 text-sm font-medium text-ink shadow-lg backdrop-blur-sm transition-colors hover:bg-raised/90 motion-reduce:transition-none ${open ? 'ring-1 ring-blue-500/30' : ''}`}>
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 7.5v4M8 4.5v.5" strokeLinecap="round" />
        </svg>
        {t.lineFilter.legend}
      </button>
      {open && (
        <div id={panelId} role="region" aria-label={t.lineFilter.legend} className="pointer-events-auto mt-2 min-h-0 w-full overflow-y-auto overscroll-contain rounded-xl border border-overlay/10 bg-surface/95 p-4 shadow-panel backdrop-blur-sm [scrollbar-width:thin]">
          <p className="mb-3 text-[10px] font-black uppercase tracking-widest text-subtle">{t.delayMap.legendTitle}</p>
          <ul className="space-y-2.5 text-xs text-body">
            {[...DELAY_MAP_SCALE, { key: 'missing' as const, color: NO_MEASUREMENTS_COLOR }].map(item => (
              <li key={item.key} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="h-2.5 w-8 shrink-0 rounded-full ring-1 ring-inset ring-black/10" style={{
                  backgroundColor: item.color,
                  backgroundImage: `linear-gradient(105deg, color-mix(in srgb, ${item.color} 75%, white), ${item.color} 55%, color-mix(in srgb, ${item.color} 85%, black))`,
                }} />
                <span className="font-medium tabular-nums">{t.delayMap.colors[item.key]}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center gap-2.5 border-t border-overlay/10 pt-3 text-xs text-body">
            <span aria-hidden="true" className="mx-2.5 h-3 w-3 shrink-0 rounded-full border-2" style={{ borderColor: stopColors.color, backgroundColor: stopColors.fillColor }} />
            {t.delayMap.stop}
          </div>
        </div>
      )}
    </div>
  );
}
