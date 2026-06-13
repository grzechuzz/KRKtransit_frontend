import { useState } from 'react';
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

function clampStatsDate(value: string): string {
  if (!value) return value;
  return value < MIN_STATS_DATE ? MIN_STATS_DATE : value;
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
        className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-gray-500 ring-1 ring-white/10 transition hover:bg-white/20 hover:text-gray-300"
      >
        i
      </button>
      {open && (
        <span className="absolute bottom-full right-0 mb-2 w-56 rounded-lg bg-gray-800 px-3 py-2 text-[11px] leading-relaxed text-gray-200 shadow-xl ring-1 ring-white/10 sm:left-1/2 sm:right-auto sm:w-64 sm:-translate-x-1/2">
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
        <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
        {badge && (
          <span className="-skew-x-12 shrink-0 whitespace-nowrap rounded bg-blue-600 px-2.5 py-1 text-sm font-black tracking-widest text-white shadow-lg shadow-blue-600/30 sm:px-2.5 sm:py-0.5 sm:text-xs">
            <span className="inline-block skew-x-12">{badge}</span>
          </span>
        )}
        <h2 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">
          {title}
        </h2>
        {tooltip && <TooltipIcon text={tooltip} />}
      </div>
      <p className="mt-2 text-xs text-gray-500 sm:text-sm">{subtitle}</p>
      <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
    </div>
  );
}

function SectionLoading() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-36 items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] text-sm text-gray-500">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />
      <span>{t.stats.loading}</span>
    </div>
  );
}

function SectionError({ error }: { error: unknown }) {
  const { language } = useI18n();

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
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
          <div className="w-1.5 self-stretch -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
          <h2 className="text-lg font-black uppercase tracking-wide text-white sm:text-xl">
            {t.stats.methodologyTitle}
          </h2>
          <svg
            className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {!open && (
          <p className="mt-2.5 animate-blinker text-xs font-semibold tracking-wide text-blue-400 sm:text-sm">
            {t.stats.expandMethodology}
          </p>
        )}

        {open && (
          <p className="mt-2 text-xs text-gray-500 sm:text-sm">
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
  const { language, t } = useI18n();
  const defaults = getDefaultDates();
  const [lineInput, setLineInput] = useState('');
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [estimated, setEstimated] = useState(false);
  const [query, setQuery] = useState<{
    line: string;
    start: string;
    end: string;
    estimated: boolean;
  } | null>(null);

  const handleStartDateChange = (value: string) => {
    setStartDate(clampStatsDate(value));
  };

  const handleEndDateChange = (value: string) => {
    setEndDate(clampStatsDate(value));
  };

  const canSubmit = lineInput.trim().length > 0 && startDate && endDate;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    if (!canSubmit) return;
    setQuery({
      line: lineInput.trim(),
      start: clampStatsDate(startDate),
      end: clampStatsDate(endDate),
      estimated,
    });
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
  const hasResults = hasAnyData || hasError || isLoading;
  const statsSubtitle = query ? t.stats.lineRange(query.line, query.start, query.end) : t.stats.selectedRange;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-8 sm:py-10 sm:pb-10">

        {/* Hero search — shown when no results yet */}
        {!hasResults && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-lg">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-6 shadow-2xl sm:p-10">
                <h1 className="mb-1 text-center text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
                  {t.stats.title}
                </h1>
                <p className="mb-8 text-center text-xs text-gray-600">
                  {t.stats.nightLinesNote}
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="line-hero" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                      {t.stats.lineNumber}
                    </label>
                    <input
                      id="line-hero"
                      type="text"
                      value={lineInput}
                      onChange={(e) => setLineInput(e.target.value)}
                      placeholder="304"
                      maxLength={5}
                      autoComplete="off"
                      className="h-14 w-full rounded-lg border border-white/10 bg-white/5 px-5 text-2xl font-black text-white placeholder-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-3xl"
                    />
                  </div>

                  <div>
                    <label htmlFor="start-hero" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                      {t.stats.dateRange}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="start-hero"
                        type="date"
                        value={startDate}
                        min={MIN_STATS_DATE}
                        onChange={(e) => handleStartDateChange(e.target.value)}
                        className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                      />
                      <span className="shrink-0 text-xs text-gray-600">—</span>
                      <input
                        id="end-hero"
                        type="date"
                        value={endDate}
                        min={MIN_STATS_DATE}
                        onChange={(e) => handleEndDateChange(e.target.value)}
                        className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                    {t.stats.estimations}
                  </label>
                <button
                  type="button"
                  onClick={() => setEstimated((v) => !v)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                    estimated
                      ? 'border-blue-500/40 bg-white/5'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                      estimated ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        estimated ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                  <div>
                    <span className={`text-sm font-semibold ${estimated ? 'text-blue-400' : 'text-gray-400'}`}>
                      {t.stats.includeEstimations}
                    </span>
                    <p className="text-[11px] text-gray-600">
                      {t.stats.estimationsHelp}
                    </p>
                  </div>
                </button>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative mt-4 block w-full -skew-x-12 cursor-pointer overflow-hidden rounded-sm bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none"
                >
                  <span className="relative z-10 inline-block skew-x-12">{t.stats.search}</span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Compact search bar — shown when results are loaded */}
        {hasResults && (
          <form onSubmit={handleSubmit} className="mb-8 sm:mb-12">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex-shrink-0 sm:flex-shrink-0">
                <label htmlFor="line" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.stats.line}
                </label>
                <input
                  id="line"
                  type="text"
                  value={lineInput}
                  onChange={(e) => setLineInput(e.target.value)}
                  placeholder="304"
                  maxLength={5}
                  autoComplete="off"
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-lg font-bold text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-28"
                />
              </div>

              <div className="sm:hidden">
                <label htmlFor="start-mobile" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.stats.from}
                </label>
                <input
                  id="start-mobile"
                  type="date"
                  value={startDate}
                  min={MIN_STATS_DATE}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="h-11 w-full min-w-0 max-w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition [-webkit-appearance:none] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />
              </div>
              <div className="sm:hidden">
                <label htmlFor="end-mobile" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.stats.to}
                </label>
                <input
                  id="end-mobile"
                  type="date"
                  value={endDate}
                  min={MIN_STATS_DATE}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="h-11 w-full min-w-0 max-w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition [-webkit-appearance:none] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                />
              </div>
              <div className="sm:hidden">
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t.stats.estimations}
                </p>
                <label htmlFor="estimated-mobile" className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 select-none transition hover:bg-white/10">
                  <div
                    className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
                      estimated ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
                        estimated ? 'translate-x-[14px]' : 'translate-x-[2px]'
                      }`}
                    />
                  </div>
                  <span className={`whitespace-nowrap text-xs font-medium ${estimated ? 'text-blue-400' : 'text-gray-500'}`}>
                    {t.stats.includeEstimations}
                  </span>
                  <input
                    id="estimated-mobile"
                    type="checkbox"
                    checked={estimated}
                    onChange={() => setEstimated((v) => !v)}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="hidden flex-1 grid-cols-2 gap-3 sm:grid">
                <div>
                  <label htmlFor="start" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t.stats.from}
                  </label>
                  <input
                    id="start"
                    type="date"
                    value={startDate}
                    min={MIN_STATS_DATE}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label htmlFor="end" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                    {t.stats.to}
                  </label>
                  <input
                    id="end"
                    type="date"
                    value={endDate}
                    min={MIN_STATS_DATE}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Estimation toggle — desktop only (mobile version is in the grid above) */}
              <label className="hidden h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 select-none transition hover:bg-white/10 sm:flex sm:shrink-0">
                <div
                  className={`relative h-4 w-8 shrink-0 rounded-full transition-colors ${
                    estimated ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${
                      estimated ? 'translate-x-[14px]' : 'translate-x-[2px]'
                    }`}
                  />
                </div>
                <span className={`whitespace-nowrap text-xs font-medium ${estimated ? 'text-blue-400' : 'text-gray-500'}`}>
                  {t.stats.estimations}
                </span>
                <input
                  type="checkbox"
                  checked={estimated}
                  onChange={() => setEstimated((v) => !v)}
                  className="sr-only"
                />
              </label>

              <button
                type="submit"
                disabled={!canSubmit}
                className="h-11 -skew-x-12 cursor-pointer rounded-sm bg-blue-600 px-6 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-40 disabled:shadow-none"
              >
                <span className="inline-block skew-x-12">{t.stats.search}</span>
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-600">
              {t.stats.nightLinesNote}
            </p>
          </form>
        )}

        {/* Loading */}
        {isInitialLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />
          </div>
        )}

        {/* Error */}
        {hasError && !hasAnyData && !isLoading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
            {getErrorMessage(firstError, language)}
          </div>
        )}

        {/* Results */}
        {hasAnyData && (
          <div className="space-y-8 sm:space-y-10">
            <MethodologyAccordion>
              <dl className="space-y-3 text-sm">
                {t.stats.methodologyItems.map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
                    <div>
                      <dt className="text-base font-bold text-white sm:text-lg">{item.title}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-gray-400">{item.text}</dd>
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
                    ? t.stats.lineRange(punctuality.data.line_number, punctuality.data.start_date, punctuality.data.end_date)
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
                  <p className="py-8 text-center text-sm text-gray-500">
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
        )}
      </div>

    </div>
  );
}
