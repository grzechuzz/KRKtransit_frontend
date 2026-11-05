import type { ReactNode } from 'react';
import type { LineStatsSearch } from '../../hooks/useLineStatsSearch';
import { useI18n } from '../../i18n-core';
import { MAX_LINE_LENGTH, MIN_STATS_DATE } from '../../utils/lineStatsSearch';
import LocalizedDateInput from './LocalizedDateInput';

export default function LineStatsSearchFields({ search, compact = false, action }: { search: LineStatsSearch; compact?: boolean; action?: ReactNode }) {
  const { t } = useI18n();
  const { draft, lineInvalid } = search;
  const prefix = compact ? 'delay' : 'hero';
  const labelClassName = compact
    ? 'mb-1 block text-[11px] font-medium uppercase tracking-widest text-subtle'
    : 'mb-1.5 block text-xs font-medium uppercase tracking-widest text-subtle';
  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className={compact ? 'grid items-end gap-3 sm:grid-cols-[minmax(100px,1fr)_minmax(0,2fr)]' : 'space-y-4'}>
        <div>
          <label htmlFor={`line-${prefix}`} className={labelClassName}>{t.stats.lineNumber}</label>
          <input id={`line-${prefix}`} type="text" value={draft.line} onChange={event => search.setLine(event.target.value)} aria-invalid={lineInvalid} aria-describedby={lineInvalid ? `line-error-${prefix}` : undefined} placeholder="304" maxLength={MAX_LINE_LENGTH} autoComplete="off" className={`${compact ? 'h-11 px-3 text-sm' : 'h-14 px-5 text-2xl sm:text-3xl'} w-full appearance-none rounded-lg border border-overlay/10 bg-field font-black text-ink shadow-none outline-none transition placeholder:text-subtle/60 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`} />
        </div>
        <fieldset className="min-w-0">
          <legend className={compact ? 'sr-only' : 'mb-1.5 text-xs font-medium uppercase tracking-widest text-subtle'}>{t.stats.dateRange}</legend>
          <div className={compact ? 'grid grid-cols-2 gap-3' : 'flex items-center gap-2'}>
            <div className="min-w-0 flex-1">
              {compact && <label htmlFor={`start-${prefix}`} className={labelClassName}>{t.searchFilters.from}</label>}
              <LocalizedDateInput id={`start-${prefix}`} label={t.searchFilters.from} value={draft.start} min={MIN_STATS_DATE} max={search.maxDate} onChange={search.setStart} className="h-11 w-full" />
            </div>
            {!compact && <span aria-hidden="true" className="shrink-0 text-xs text-subtle">—</span>}
            <div className="min-w-0 flex-1">
              {compact && <label htmlFor={`end-${prefix}`} className={labelClassName}>{t.searchFilters.to}</label>}
              <LocalizedDateInput id={`end-${prefix}`} label={t.searchFilters.to} value={draft.end} min={draft.start || MIN_STATS_DATE} max={search.maxDate} onChange={search.setEnd} className="h-11 w-full" />
            </div>
          </div>
        </fieldset>
      </div>
      <div className={compact ? 'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6' : undefined}>
        <div className={compact ? 'min-w-0 sm:flex-1' : 'min-w-0'}>
          <p className={compact ? `${labelClassName} sm:hidden` : labelClassName}>{t.stats.estimations}</p>
          <button type="button" role="switch" aria-checked={draft.estimated} aria-label={t.stats.includeEstimations} aria-describedby={`estimated-help-${prefix}`} onClick={() => search.setEstimated(!draft.estimated)} className={compact
            ? `flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border bg-overlay/5 px-3 py-3 text-left transition-colors hover:bg-overlay/10 sm:rounded-md sm:border-0 sm:bg-transparent sm:px-0 sm:py-1 sm:hover:bg-transparent motion-reduce:transition-none ${draft.estimated ? 'border-blue-500/40' : 'border-overlay/10'}`
            : `flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg border bg-overlay/5 px-4 py-3 text-left transition ${draft.estimated ? 'border-blue-500/40' : 'border-overlay/10'}`}>
            <span aria-hidden="true" className={`relative h-5 w-9 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${draft.estimated ? 'bg-blue-500' : 'bg-control'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${draft.estimated ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
            <span className="min-w-0">
              <span className={`block font-semibold ${compact ? 'text-xs sm:text-sm' : 'text-sm'} ${draft.estimated ? 'text-accent' : 'text-ink'}`}>{t.stats.includeEstimations}</span>
              <span id={`estimated-help-${prefix}`} className={compact ? 'mt-0.5 block text-[11px] leading-relaxed text-subtle' : 'block min-h-[2lh] text-[11px] text-subtle'}>
                {compact ? <>
                  <span className="sm:hidden">{t.stats.estimationsHelp}</span>
                  <span className="hidden sm:inline">{t.stats.estimationsHelpShort}</span>
                </> : t.stats.estimationsHelp}
              </span>
            </span>
          </button>
        </div>
        {action && <div className={compact ? 'w-full sm:w-auto sm:shrink-0' : undefined}>{action}</div>}
      </div>
      {lineInvalid && <p id={`line-error-${prefix}`} role="alert" className="text-sm text-negative">{t.api.linePattern}</p>}
      {draft.start && draft.end && draft.start > draft.end && <p role="alert" className="text-sm text-negative">{t.searchFilters.invalidRange}</p>}
    </div>
  );
}
