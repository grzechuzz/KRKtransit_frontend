import type { LineStatsSearch } from '../../hooks/useLineStatsSearch';
import { useI18n } from '../../i18n-core';
import { MAX_LINE_LENGTH, MIN_STATS_DATE } from '../../utils/lineStatsSearch';
import LocalizedDateInput from './LocalizedDateInput';

export default function LineStatsSearchFields({ search, compact = false }: { search: LineStatsSearch; compact?: boolean }) {
  const { t } = useI18n();
  const { draft, lineInvalid } = search;
  const prefix = compact ? 'delay' : 'hero';
  return (
    <div className="space-y-4">
      <div className={compact ? 'grid items-end gap-4 sm:grid-cols-[minmax(120px,1fr)_minmax(0,2fr)]' : 'space-y-4'}>
        <div>
          <label htmlFor={`line-${prefix}`} className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-subtle">{t.stats.lineNumber}</label>
          <input id={`line-${prefix}`} type="text" value={draft.line} onChange={event => search.setLine(event.target.value)} aria-invalid={lineInvalid} aria-describedby={lineInvalid ? `line-error-${prefix}` : undefined} placeholder="304" maxLength={MAX_LINE_LENGTH} autoComplete="off" className="h-14 w-full rounded-lg border border-overlay/10 bg-overlay/5 px-5 text-2xl font-black text-ink placeholder-subtle outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-3xl" />
        </div>
        <fieldset className="min-w-0">
          <legend className="mb-1.5 text-xs font-medium uppercase tracking-widest text-subtle">{t.stats.dateRange}</legend>
          <div className="flex items-center gap-2">
            <LocalizedDateInput id={`start-${prefix}`} label={t.searchFilters.from} value={draft.start} min={MIN_STATS_DATE} max={search.maxDate} onChange={search.setStart} className={`${compact ? 'h-14' : 'h-11'} min-w-0 flex-1`} />
            <span aria-hidden="true" className="shrink-0 text-xs text-subtle">—</span>
            <LocalizedDateInput id={`end-${prefix}`} label={t.searchFilters.to} value={draft.end} min={draft.start || MIN_STATS_DATE} max={search.maxDate} onChange={search.setEnd} className={`${compact ? 'h-14' : 'h-11'} min-w-0 flex-1`} />
          </div>
        </fieldset>
      </div>
      <div>
        <p className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-subtle">{t.stats.estimations}</p>
        <button type="button" role="switch" aria-checked={draft.estimated} aria-label={t.stats.includeEstimations} aria-describedby={`estimated-help-${prefix}`} onClick={() => search.setEstimated(!draft.estimated)} className={`${compact ? 'min-h-14 py-2' : 'min-h-11 py-3'} flex w-full cursor-pointer items-center gap-3 rounded-lg border bg-overlay/5 px-4 text-left transition ${draft.estimated ? 'border-blue-500/40' : 'border-overlay/10'}`}>
        <span aria-hidden="true" className={`relative h-5 w-9 shrink-0 rounded-full transition-colors motion-reduce:transition-none ${draft.estimated ? 'bg-blue-500' : 'bg-control'}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform motion-reduce:transition-none ${draft.estimated ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </span>
        <span>
          <span className={`block text-sm font-semibold ${draft.estimated ? 'text-accent' : 'text-ink'}`}>{t.stats.includeEstimations}</span>
          <span id={`estimated-help-${prefix}`} className={`block text-subtle ${compact ? 'text-xs' : 'min-h-[2lh] text-[11px]'}`}>{t.stats.estimationsHelp}</span>
        </span>
        </button>
      </div>
      {lineInvalid && <p id={`line-error-${prefix}`} role="alert" className="text-sm text-negative">{t.api.linePattern}</p>}
      {draft.start && draft.end && draft.start > draft.end && <p role="alert" className="text-sm text-negative">{t.searchFilters.invalidRange}</p>}
    </div>
  );
}
