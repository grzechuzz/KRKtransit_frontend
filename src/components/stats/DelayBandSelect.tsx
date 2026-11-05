import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { DelayBand } from '../../types/api';
import { useI18n } from '../../i18n-core';

const BANDS: DelayBand[] = ['ALL_DAY', 'MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING_NIGHT', 'WEEKEND'];

export default function DelayBandSelect({ value, onChange }: { value: DelayBand; onChange: (value: DelayBand) => void }) {
  const { locale, t } = useI18n();
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-options`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeaheadRef = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [layout, setLayout] = useState({ above: false, maxHeight: 352 });
  const selectedIndex = BANDS.indexOf(value);

  const openList = (index = selectedIndex) => {
    const bounds = triggerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const viewport = window.visualViewport;
    const top = viewport?.offsetTop ?? 0;
    const bottom = top + (viewport?.height ?? window.innerHeight);
    const below = bottom - bounds.bottom - 12;
    const above = bounds.top - top - 12;
    const showAbove = below < 352 && above > below;
    setLayout({ above: showAbove, maxHeight: Math.max(56, Math.min(352, showAbove ? above : below)) });
    setActiveIndex(index);
    setOpen(true);
  };

  const select = (index: number) => {
    onChange(BANDS[index]);
    setOpen(false);
    typeaheadRef.current.text = '';
  };

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && listRef.current?.contains(event.target)) return;
      setOpen(false);
    };
    const resize = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('scroll', scroll, true);
    window.addEventListener('resize', resize);
    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('scroll', scroll, true);
      window.removeEventListener('resize', resize);
      viewport?.removeEventListener('resize', resize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const list = listRef.current;
    const option = list?.children.item(activeIndex);
    if (!list || !(option instanceof HTMLElement)) return;
    const optionTop = option.getBoundingClientRect().top - list.getBoundingClientRect().top + list.scrollTop;
    const optionBottom = optionTop + option.offsetHeight;
    if (optionTop < list.scrollTop) list.scrollTop = optionTop;
    else if (optionBottom > list.scrollTop + list.clientHeight) list.scrollTop = optionBottom - list.clientHeight;
  }, [open, activeIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        if (!open) openList();
        else setActiveIndex(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + BANDS.length) % BANDS.length);
        return;
      }
      case 'Home':
      case 'End': {
        event.preventDefault();
        const index = event.key === 'Home' ? 0 : BANDS.length - 1;
        if (open) setActiveIndex(index);
        else openList(index);
        return;
      }
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (open) select(activeIndex);
        else openList();
        return;
      case 'Escape':
        if (open) {
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
        }
        return;
      case 'Tab':
        setOpen(false);
        return;
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    event.preventDefault();
    const now = Date.now();
    const key = event.key.toLocaleLowerCase(locale);
    const text = now - typeaheadRef.current.time < 700 ? typeaheadRef.current.text + key : key;
    typeaheadRef.current = { text, time: now };
    const query = [...text].every(character => character === key) ? key : text;
    const start = open ? activeIndex : selectedIndex;
    for (let offset = 1; offset <= BANDS.length; offset++) {
      const index = (start + offset) % BANDS.length;
      if (!t.delayMap.bands[BANDS[index]].toLocaleLowerCase(locale).startsWith(query)) continue;
      if (open) setActiveIndex(index);
      else openList(index);
      break;
    }
  };

  return (
    <div ref={rootRef} className="relative" onBlur={event => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <label id={labelId} htmlFor={id} className="mb-1 block text-xs font-medium uppercase tracking-widest text-subtle">{t.delayMap.timeBand}</label>
      <div className="relative">
      <button ref={triggerRef} id={id} type="button" role="combobox" aria-labelledby={labelId}
        aria-expanded={open} aria-haspopup="listbox" aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${BANDS[activeIndex]}` : undefined} data-value={value}
        onClick={() => { if (open) setOpen(false); else openList(); }} onKeyDown={handleKeyDown}
        className={`flex min-h-11 w-full min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-surface px-3 py-2 text-left text-sm transition-colors motion-reduce:transition-none ${open ? 'border-blue-500/40 ring-1 ring-blue-500/20' : 'border-overlay/10 hover:border-overlay/20 hover:bg-raised'}`}>
        <span className="min-w-0 flex-1 truncate font-semibold text-ink">
          {t.delayMap.bands[value]}
        </span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={`h-4 w-4 shrink-0 text-muted transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`}>
          <path d="m5 7.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <ul ref={listRef} id={listId} role="listbox" aria-labelledby={labelId} onMouseDown={event => event.preventDefault()}
          style={{ maxHeight: layout.maxHeight }} className={`absolute inset-x-0 z-[1000] overflow-y-auto overscroll-contain rounded-xl border border-blue-500/25 bg-surface p-1.5 shadow-panel ring-1 ring-overlay/5 [scrollbar-width:thin] ${layout.above ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
          {BANDS.map((band, index) => (
            <li key={band} id={`${listId}-${band}`} role="option" aria-selected={band === value}
              aria-label={`${t.delayMap.bands[band]}, ${t.delayMap.bandDetails[band]}`} data-value={band}
              onPointerMove={event => { if (event.pointerType === 'mouse') setActiveIndex(index); }} onClick={() => select(index)}
              className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors motion-reduce:transition-none ${band === value ? 'bg-blue-500/10 text-accent' : 'text-body'} ${index === activeIndex ? 'ring-1 ring-inset ring-blue-500/35' : ''} ${index === activeIndex && band !== value ? 'bg-overlay/5' : ''}`}>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{t.delayMap.bands[band]}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-subtle">{t.delayMap.bandDetails[band]}</span>
              </span>
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className={`h-4 w-4 shrink-0 text-accent ${band === value ? '' : 'invisible'}`}>
                <path d="m4 10 4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
