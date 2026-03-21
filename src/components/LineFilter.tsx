import { useMemo, useState } from 'react';
import type { Vehicle } from '../types/api';

interface LineFilterProps {
  vehicles: Vehicle[];
  activeLines: Set<string>;
  onToggle: (line: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const LEGEND = [
  {
    group: 'Tramwaje',
    items: [
      { range: '1–99', label: 'Tramwaje', color: '#dc2626' },
    ],
  },
  {
    group: 'Autobusy',
    items: [
      { range: '100–199', label: 'Miejskie dzienne', color: '#2563eb' },
      { range: '200–299', label: 'Aglomeracyjne', color: '#16a34a' },
      { range: '300–399', label: 'Aglomeracyjne przyspieszone', color: '#9333ea' },
      { range: '400–499', label: 'Miejskie wspomagające', color: '#ea580c' },
      { range: '500–599', label: 'Miejskie przyspieszone', color: '#0891b2' },
      { range: '600–699', label: 'Miejskie nocne', color: '#4338ca' },
      { range: '700–799', label: 'Zastępcze / tymczasowe', color: '#b45309' },
      { range: '800–899', label: 'Specjalne', color: '#be185d' },
      { range: '900–999', label: 'Aglomeracyjne nocne', color: '#6d28d9' },
    ],
  },
] as const;

export function getLineColor(lineNumber: string): string {
  const num = parseInt(lineNumber, 10);
  if (isNaN(num)) return '#6366f1';
  if (num >= 1 && num <= 99) return '#dc2626';
  if (num >= 100 && num <= 199) return '#2563eb';
  if (num >= 200 && num <= 299) return '#16a34a';
  if (num >= 300 && num <= 399) return '#9333ea';
  if (num >= 400 && num <= 499) return '#ea580c';
  if (num >= 500 && num <= 599) return '#0891b2';
  if (num >= 600 && num <= 699) return '#4338ca';
  if (num >= 700 && num <= 799) return '#b45309';
  if (num >= 800 && num <= 899) return '#be185d';
  if (num >= 900 && num <= 999) return '#6d28d9';
  return '#6366f1';
}

export default function LineFilter({
  vehicles,
  activeLines,
  onToggle,
  onShowAll,
  onHideAll,
  isOpen,
  onToggleOpen,
}: LineFilterProps) {
  const [legendOpen, setLegendOpen] = useState(false);

  const sortedLines = useMemo(() => {
    const lines = new Set(vehicles.map((v) => v.line_number));
    return [...lines].sort((a, b) => {
      const na = parseInt(a, 10);
      const nb = parseInt(b, 10);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.localeCompare(b);
    });
  }, [vehicles]);

  const allActive = activeLines.size === 0;

  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <div className="flex gap-2">
        <button
          onClick={() => {
            setLegendOpen(false);
            onToggleOpen();
          }}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900/90 px-4 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-gray-800/90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 3h14M3 8h10M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Filtr linii
          {!allActive && (
            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs">
              {[...activeLines].filter((l) => l !== '__none__').length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            if (isOpen) onToggleOpen();
            setLegendOpen((p) => !p);
          }}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-gray-900/90 px-3 py-2 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition hover:bg-gray-800/90"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 6.5v4M7 4v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">Legenda</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 max-h-[60vh] w-72 overflow-y-auto rounded-xl bg-gray-900/95 p-3 shadow-2xl backdrop-blur-sm sm:w-80">
          <div className="mb-2 grid grid-cols-2 gap-1.5">
            <button
              onClick={onShowAll}
              className="cursor-pointer rounded-lg bg-white/10 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/20"
            >
              Wszystkie
            </button>
            <button
              onClick={onHideAll}
              className="cursor-pointer rounded-lg bg-white/10 py-1.5 text-xs font-medium text-gray-300 transition hover:bg-white/20"
            >
              Odznacz
            </button>
          </div>

          <div className="mb-2 border-t border-white/10" />

          <div className="grid grid-cols-5 gap-1.5">
            {sortedLines.map((line) => {
              const isActive = allActive || activeLines.has(line);
              const color = getLineColor(line);
              return (
                <button
                  key={line}
                  onClick={() => onToggle(line)}
                  className="cursor-pointer rounded-lg py-1 text-xs font-bold text-white transition"
                  style={{
                    backgroundColor: isActive ? color : 'transparent',
                    border: `2px solid ${color}`,
                    opacity: isActive ? 1 : 0.35,
                  }}
                >
                  {line}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {legendOpen && (
        <div className="mt-2 w-64 rounded-xl bg-gray-900/95 p-4 shadow-2xl backdrop-blur-sm sm:w-72">
          {LEGEND.map((group, gi) => (
            <div key={group.group} className={gi > 0 ? 'mt-3 border-t border-white/5 pt-3' : ''}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                {group.group}
              </p>
              <div className="space-y-1.5">
                {group.items.map((cat) => (
                  <div key={cat.range} className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}66` }}
                    />
                    <span className="text-xs text-gray-300">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
