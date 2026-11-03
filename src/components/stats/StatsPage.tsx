import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPunctuality, fetchMaxDelay, fetchRouteDelay, fetchTrend, getErrorMessage } from '../../api/client';
import PunctualityRing from './PunctualityRing';
import MaxDelayTable from './MaxDelayTable';
import RouteDelayTable from './RouteDelayTable';
import TrendChart from './TrendChart';
import { useI18n } from '../../i18n-core';

function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATS_RANGE_DAYS = 7;
const MIN_STATS_DATE = '2026-03-11';
const MAX_LINE_LENGTH = 5;
const LINE_PATTERN = /^[a-zA-Z0-9]{1,5}$/;

function clampStatsDate(value: string, maxDate: string): string {
  if (!value) return value;
  if (value < MIN_STATS_DATE) return MIN_STATS_DATE;
  return value > maxDate ? maxDate : value;
}

function getDefaultDates() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - (DEFAULT_STATS_RANGE_DAYS - 1));
  return {
    start: localDateStr(weekAgo),
    end: localDateStr(today),
  };
}

interface StatsQuery {
  line: string;
  start: string;
  end: string;
  estimated: boolean;
}

function readDateParam(value: string | null, fallback: string, maxDate: string): string {
  const valid = value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
  return valid ? clampStatsDate(value, maxDate) : fallback;
}

function readStatsUrl(maxDate: string): StatsQuery {
  const params = new URLSearchParams(window.location.search);
  const defaults = getDefaultDates();
  return {
    line: (params.get('line') ?? '').trim().slice(0, MAX_LINE_LENGTH),
    start: readDateParam(params.get('from'), defaults.start, maxDate),
    end: readDateParam(params.get('to'), defaults.end, maxDate),
    estimated: params.get('estimated') === '1',
  };
}

function writeStatsUrl({ line, start, end, estimated }: StatsQuery) {
  const params = new URLSearchParams({ line, from: start, to: end });
  if (estimated) params.set('estimated', '1');
  window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
}

function formatDateLabel(value: string, locale: string): string {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date);
}

function LocalizedDateInput({
  id,
  value,
  min,
  max,
  onChange,
  className = '',
}: {
  id: string;
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

/* ── Tooltip Icon (click on mobile, hover on desktop) ── */

function TooltipIcon({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-overlay/10 text-[11px] font-bold text-ink ring-1 ring-overlay/10 transition hover:bg-overlay/20 hover:text-body"
      >
        i
      </button>
      {open && (
        <span className="absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-raised px-3 py-2 text-[11px] leading-relaxed text-strong shadow-xl ring-1 ring-overlay/10 sm:left-1/2 sm:right-auto sm:w-64 sm:-translate-x-1/2">
          {text}
        </span>
      )}
    </span>
  );
}

/* ── Section Header ───────────────────────────────────── */

function SectionHeader({ title, subtitle, tooltip, badge }: { title: string; subtitle: string; tooltip?: string; badge?: string }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-3">
        <div className="h-7 w-1.5 shrink-0 -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
        {badge && (
          <span className="-skew-x-12 shrink-0 whitespace-nowrap rounded bg-blue-600 px-2.5 py-1 text-sm font-black tracking-widest text-white shadow-lg shadow-blue-600/30 sm:px-2.5 sm:py-0.5 sm:text-xs">
            <span className="inline-block skew-x-12">{badge}</span>
          </span>
        )}
        <h2 className="text-lg font-black uppercase tracking-wide text-ink sm:text-xl">
          {title}
        </h2>
        {tooltip && <TooltipIcon text={tooltip} />}
      </div>
      <p className="mt-2 text-xs text-subtle sm:text-sm">{subtitle}</p>
      <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
    </div>
  );
}

function SectionLoading() {
  const { t } = useI18n();

  return (
    <div role="status" className="flex min-h-36 items-center justify-center gap-3 rounded-xl border border-overlay/5 bg-overlay/[0.02] text-sm text-subtle">
      <div aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-control border-t-blue-500 motion-reduce:animate-none" />
      <span>{t.stats.loading}</span>
    </div>
  );
}

function SectionError({ error }: { error: unknown }) {
  const { language } = useI18n();

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-negative">
      {getErrorMessage(error, language)}
    </div>
  );
}

/* ── Collapsible methodology ─────────────────────────── */

function MethodologyAccordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <section>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group mb-6 w-full cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <div className="h-7 w-1.5 shrink-0 -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
          <h2 className="text-lg font-black uppercase tracking-wide text-ink sm:text-xl">
            {t.stats.methodologyTitle}
          </h2>
          <svg
            className={`h-5 w-5 shrink-0 text-subtle transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {!open && (
          <p className="mt-2.5 animate-blinker text-xs font-semibold tracking-wide text-accent sm:text-sm">
            {t.stats.expandMethodology}
          </p>
        )}

        {open && (
          <p className="mt-2 text-xs text-subtle sm:text-sm">
            {t.stats.methodologySubtitle}
          </p>
        )}

        <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

/* ── Page ─────────────────────────────────────────────── */

export default function StatsPage() {
  const { language, t, locale } = useI18n();
  const maxStatsDate = localDateStr(new Date());
  const [initial] = useState(() => readStatsUrl(maxStatsDate));
  const [lineInput, setLineInput] = useState(initial.line);
  const [startDate, setStartDate] = useState(initial.start);
  const [endDate, setEndDate] = useState(initial.end);
  const [estimated, setEstimated] = useState(initial.estimated);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState<StatsQuery | null>(LINE_PATTERN.test(initial.line) ? initial : null);
  const [lineInvalid, setLineInvalid] = useState(initial.line !== '' && !LINE_PATTERN.test(initial.line));

  const scrolledQueryRef = useRef<typeof query>(null);

  const handleStartDateChange = (value: string) => {
    setStartDate(clampStatsDate(value, maxStatsDate));
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(clampStatsDate(value, maxStatsDate));
  };

  const canSubmit = lineInput.trim().length > 0 && startDate && endDate;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    if (!canSubmit) return;
    const line = lineInput.trim();
    if (!LINE_PATTERN.test(line)) {
      setLineInvalid(true);
      return;
    }
    setLineInvalid(false);
    const submitted = {
      line,
      start: clampStatsDate(startDate, maxStatsDate),
      end: clampStatsDate(endDate, maxStatsDate),
      estimated,
    };
    setQuery(submitted);
    writeStatsUrl(submitted);
  };

  const punctuality = useQuery({
    queryKey: ['punctuality', query?.line, query?.start, query?.end, query?.estimated, language],
    queryFn: () => fetchPunctuality(query!.line, query!.start, query!.end, query!.estimated, language),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const maxDelay = useQuery({
    queryKey: ['maxDelay', query?.line, query?.start, query?.end, query?.estimated, language],
    queryFn: () => fetchMaxDelay(query!.line, query!.start, query!.end, query!.estimated, language),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const routeDelay = useQuery({
    queryKey: ['routeDelay', query?.line, query?.start, query?.end, query?.estimated, language],
    queryFn: () => fetchRouteDelay(query!.line, query!.start, query!.end, query!.estimated, language),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const trend = useQuery({
    queryKey: ['trend', query?.line, query?.start, query?.end, query?.estimated, language],
    queryFn: () => fetchTrend(query!.line, query!.start, query!.end, query!.estimated, language),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isLoading = punctuality.isLoading || maxDelay.isLoading || routeDelay.isLoading || trend.isLoading;
  const firstError = punctuality.error || maxDelay.error || routeDelay.error || trend.error;
  const hasError = Boolean(firstError);
  const hasAnyData = Boolean(punctuality.data || maxDelay.data || routeDelay.data || trend.data);
  const isInitialLoading = isLoading && !hasAnyData;

  useEffect(() => {
    // Wait for real data: empty/error responses keep the user at the form.
    if (!query || !hasAnyData || scrolledQueryRef.current === query) return;
    const results = resultsRef.current;
    const container = scrollContainerRef.current;
    if (!results || !container) return;

    scrolledQueryRef.current = query;
    const top = container.scrollTop
      + results.getBoundingClientRect().top
      - container.getBoundingClientRect().top
      - 24;
    results.focus({ preventScroll: true });
    container.scrollTo({
      top: Math.max(0, top),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  }, [query, hasAnyData]);
  const lineRangeSubtitle = (line: string, start: string, end: string) => (
    t.stats.lineRange(line, formatDateLabel(start, locale), formatDateLabel(end, locale))
  );
  const statsSubtitle = query ? lineRangeSubtitle(query.line, query.start, query.end) : t.stats.selectedRange;

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-8 sm:py-10 sm:pb-10">

        {/* Search stays above the results. */}
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <form onSubmit={handleSubmit} className="w-full max-w-lg">
            <div className="rounded-2xl border border-overlay/5 bg-gradient-to-b from-overlay/[0.04] to-transparent p-6 shadow-panel sm:p-10">
              <h1 className="mb-1 text-center text-2xl font-black uppercase tracking-wide text-ink sm:text-4xl">
                {t.stats.title}
              </h1>
              <p className="mb-8 text-center text-xs text-subtle">
                {t.stats.nightLinesNote}
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="line-hero" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-subtle">
                    {t.stats.lineNumber}
                  </label>
                  <input
                    id="line-hero"
                    type="text"
                    value={lineInput}
                    onChange={(e) => {
                      setLineInput(e.target.value);
                      setLineInvalid(false);
                    }}
                    aria-invalid={lineInvalid}
                    placeholder="304"
                    maxLength={MAX_LINE_LENGTH}
                    autoComplete="off"
                    className="h-14 w-full rounded-lg border border-overlay/10 bg-overlay/5 px-5 text-2xl font-black text-ink placeholder-subtle outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-3xl"
                  />
                </div>

                <div>
                  <label htmlFor="start-hero" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-subtle">
                    {t.stats.dateRange}
                  </label>
                  <div className="flex items-center gap-2">
                    <LocalizedDateInput
                      id="start-hero"
                      value={startDate}
                      min={MIN_STATS_DATE}
                      max={maxStatsDate}
                      onChange={handleStartDateChange}
                      className="h-11 min-w-0 flex-1"
                    />
                    <span className="shrink-0 text-xs text-subtle">—</span>
                    <LocalizedDateInput
                      id="end-hero"
                      value={endDate}
                      min={MIN_STATS_DATE}
                      max={maxStatsDate}
                      onChange={handleEndDateChange}
                      className="h-11 min-w-0 flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-subtle">
                  {t.stats.estimations}
                </label>
              <button
                type="button"
                onClick={() => setEstimated((v) => !v)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                  estimated
                    ? 'border-blue-500/40 bg-overlay/5'
                    : 'border-overlay/10 bg-overlay/5'
                }`}
              >
                <div
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    estimated ? 'bg-blue-500' : 'bg-control'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      estimated ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <div>
                  <span className={`text-sm font-semibold ${estimated ? 'text-accent' : 'text-ink'}`}>
                    {t.stats.includeEstimations}
                  </span>
                  <p className="text-[11px] text-subtle">
                    {t.stats.estimationsHelp}
                  </p>
                </div>
              </button>
              </div>

              <button
                type="submit"
                aria-busy={isInitialLoading}
                disabled={!canSubmit}
                className="group relative mt-4 block w-full -skew-x-12 cursor-pointer overflow-hidden rounded-sm bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none"
              >
                <span className="relative z-10 inline-block skew-x-12">{t.stats.search}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-overlay/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </button>
              {lineInvalid && (
                <div role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-negative">
                  {t.api.linePattern}
                </div>
              )}
              {!lineInvalid && hasError && !hasAnyData && !isLoading && (
                <div role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-negative">
                  {getErrorMessage(firstError, language)}
                </div>
              )}
            </div>
          </form>
        </div>

        {hasAnyData && (
          <div
            id="stats-results"
            ref={resultsRef}
            role="region"
            aria-label={statsSubtitle}
            tabIndex={-1}
            className="mt-8 min-h-[calc(100dvh-5rem)] scroll-mt-6 sm:mt-10"
          >
            {/* Results */}
              <div className="space-y-8 sm:space-y-10">
                <MethodologyAccordion>
                  <dl className="space-y-3 text-sm">
                    {t.stats.methodologyItems.map((item) => (
                      <div key={item.title} className="flex gap-3">
                        <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
                        <div>
                          <dt className="text-base font-bold text-ink sm:text-lg">{item.title}</dt>
                          <dd className="mt-1 text-sm leading-relaxed text-muted">{item.text}</dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </MethodologyAccordion>

                <section>
                  <SectionHeader
                    title={t.stats.punctualityTitle}
                    subtitle={
                      punctuality.data
                        ? lineRangeSubtitle(
                            punctuality.data.line_number,
                            punctuality.data.start_date,
                            punctuality.data.end_date,
                          )
                        : statsSubtitle
                    }
                    tooltip={t.stats.punctualityTooltip}
                  />
                  {punctuality.data ? (
                    <PunctualityRing data={punctuality.data} />
                  ) : punctuality.error ? (
                    <SectionError error={punctuality.error} />
                  ) : (
                    <SectionLoading />
                  )}
                </section>

                <section>
                  <SectionHeader
                    badge="TOP 10"
                    title={t.stats.betweenStopsTitle}
                    subtitle={t.stats.betweenStopsSubtitle}
                  />
                  {maxDelay.data ? (
                    <MaxDelayTable data={maxDelay.data} />
                  ) : maxDelay.error ? (
                    <SectionError error={maxDelay.error} />
                  ) : (
                    <SectionLoading />
                  )}
                </section>

                <section>
                  <SectionHeader
                    badge="TOP 10"
                    title={t.stats.routeDelayTitle}
                    subtitle={t.stats.routeDelaySubtitle}
                  />
                  {routeDelay.data ? (
                    <RouteDelayTable data={routeDelay.data} />
                  ) : routeDelay.error ? (
                    <SectionError error={routeDelay.error} />
                  ) : (
                    <SectionLoading />
                  )}
                </section>

                <section>
                  <SectionHeader
                    title={t.stats.trendTitle}
                    subtitle={t.stats.trendSubtitle}
                  />
                  {trend.data ? (
                    trend.data.days.length >= 2 ? (
                      <TrendChart data={trend.data} />
                    ) : (
                      <p className="py-8 text-center text-sm text-subtle">
                        {t.stats.notEnoughTrendData}
                      </p>
                    )
                  ) : trend.error ? (
                    <SectionError error={trend.error} />
                  ) : (
                    <SectionLoading />
                  )}
                </section>
              </div>
          </div>
        )}
      </div>

    </div>
  );
}
