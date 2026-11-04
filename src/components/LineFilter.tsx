import { useMemo } from 'react';
import type { Vehicle } from '../types/api';
import { getLineColor } from './lineColors';
import { useI18n } from '../i18n-core';

interface LineFilterProps {
  vehicles: Vehicle[];
  activeLines: Set<string>;
  onToggle: (line: string) => void;
  onShowAll: () => void;
  onHideAll: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  legendOpen: boolean;
  onToggleLegend: () => void;
}

export default function LineFilter({
  vehicles,
  activeLines,
  onToggle,
  onShowAll,
  onHideAll,
  isOpen,
  onToggleOpen,
  legendOpen,
  onToggleLegend,
}: LineFilterProps) {
  const { t } = useI18n();

  const legend = [
    {
      group: t.lineFilter.tramGroup,
      items: [
        { range: '1–99', label: t.lineFilter.tram, color: '#dc2626' },
      ],
    },
    {
      group: t.lineFilter.busGroup,
      items: [
        { range: '100–199', label: t.lineFilter.cityDay, color: '#2563eb' },
        { range: '200–299', label: t.lineFilter.suburban, color: '#16a34a' },
        { range: '300–399', label: t.lineFilter.suburbanFast, color: '#9333ea' },
        { range: '400–499', label: t.lineFilter.citySupport, color: '#ea580c' },
        { range: '500–599', label: t.lineFilter.cityFast, color: '#0891b2' },
        { range: '600–699', label: t.lineFilter.cityNight, color: '#4338ca' },
        { range: '700–799', label: t.lineFilter.replacement, color: '#b45309' },
        { range: '800–899', label: t.lineFilter.special, color: '#be185d' },
        { range: '900–999', label: t.lineFilter.suburbanNight, color: '#6d28d9' },
      ],
    },
  ];

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
    <div className="absolute top-4 left-4 z-[1000] flex max-h-[45%] flex-col sm:max-h-none">
      <div className="flex shrink-0 gap-2">
        <button
          onClick={onToggleOpen}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface/90 px-4 py-2 text-sm font-medium text-ink shadow-lg backdrop-blur-sm transition hover:bg-raised/90"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M1 3h14M3 8h10M5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          {t.lineFilter.filter}
          {!allActive && (
            <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white">
              {[...activeLines].filter((l) => l !== '__none__').length}
            </span>
          )}
        </button>

        <button
          onClick={onToggleLegend}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-surface/90 px-3 py-2 text-sm font-medium text-ink shadow-lg backdrop-blur-sm transition hover:bg-raised/90"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 6.5v4M7 4v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="hidden sm:inline">{t.lineFilter.legend}</span>
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 flex min-h-0 w-72 flex-col overflow-hidden rounded-xl bg-surface/95 p-3 shadow-panel backdrop-blur-sm sm:max-h-[60vh] sm:w-80">
          <div className="mb-2 grid shrink-0 grid-cols-2 gap-1.5 border-b border-overlay/10 pb-2">
            <button
              onClick={onShowAll}
              className="cursor-pointer rounded-lg bg-overlay/10 py-1.5 text-xs font-medium text-ink transition hover:bg-overlay/20"
            >
              {t.lineFilter.all}
            </button>
            <button
              onClick={onHideAll}
              className="cursor-pointer rounded-lg bg-overlay/10 py-1.5 text-xs font-medium text-ink transition hover:bg-overlay/20"
            >
              {t.lineFilter.clear}
            </button>
          </div>

          <div className="grid min-h-0 grid-cols-5 gap-1.5 overflow-y-auto overscroll-contain">
            {sortedLines.map((line) => {
              const isActive = allActive || activeLines.has(line);
              const color = getLineColor(line);
              return (
                <button
                  key={line}
                  onClick={() => onToggle(line)}
                  aria-pressed={isActive}
                  className="cursor-pointer rounded-lg py-1 text-xs font-bold text-white transition"
                  style={{
                    backgroundColor: isActive ? color : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--app-body)',
                    border: `2px solid ${color}`,
                    opacity: isActive ? 1 : 0.65,
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
        <div className="mt-2 w-64 rounded-xl bg-surface/95 p-4 shadow-panel backdrop-blur-sm sm:w-72">
          {legend.map((group, gi) => (
            <div key={group.group} className={gi > 0 ? 'mt-3 border-t border-overlay/5 pt-3' : ''}>
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-subtle">
                {group.group}
              </p>
              <div className="space-y-1.5">
                {group.items.map((cat) => (
                  <div key={cat.range} className="flex items-center gap-2.5">
                    <span
                      className="inline-block h-3 w-3 shrink-0 rounded-full shadow-sm"
                      style={{ backgroundColor: cat.color, boxShadow: `0 0 6px ${cat.color}66` }}
                    />
                    <span className="text-xs text-body">{cat.label}</span>
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
