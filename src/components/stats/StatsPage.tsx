import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPunctuality, fetchMaxDelay, fetchRouteDelay, fetchTrend, getErrorMessage } from '../../api/client';
import PunctualityRing from './PunctualityRing';
import MaxDelayTable from './MaxDelayTable';
import RouteDelayTable from './RouteDelayTable';
import TrendChart from './TrendChart';
import DelayMapPromo from './DelayMapPromo';
import LineStatsSearchFields from './LineStatsSearchFields';
import LineSearchButton from './LineSearchButton';
import SectionHeader from './SectionHeader';
import { useLineStatsSearch } from '../../hooks/useLineStatsSearch';
import { formatDateLabel } from '../../utils/lineStatsSearch';
import { useI18n } from '../../i18n-core';

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
  const search = useLineStatsSearch();
  const { query, lineInvalid } = search;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const scrolledQueryRef = useRef<typeof query>(null);
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
    <div ref={scrollContainerRef} className="h-full overflow-y-auto" onPointerDownCapture={() => {
      // Release the results focus before pointer scrolling so it cannot restore an old scroll position.
      if (document.activeElement === resultsRef.current) resultsRef.current?.blur();
    }}>
      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-8 sm:py-10 sm:pb-10">

        {/* Search stays above the results. */}
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <form onSubmit={search.handleSubmit} className="w-full max-w-lg">
            <div className="rounded-2xl border border-overlay/5 bg-gradient-to-b from-overlay/[0.04] to-transparent p-6 shadow-panel sm:p-10">
              <h1 className="mb-1 text-center text-2xl font-black uppercase tracking-wide text-ink sm:text-4xl">
                {t.stats.title}
              </h1>
              <p className="mb-8 text-center text-xs text-subtle">
                {t.stats.nightLinesNote}
              </p>

              <LineStatsSearchFields search={search} />

              <LineSearchButton
                search={search}
                aria-busy={isInitialLoading}
                className="group relative mt-4 block w-full -skew-x-12 cursor-pointer overflow-hidden rounded-sm bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none"
              >
                <span className="relative z-10 inline-block skew-x-12">{t.stats.search}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-overlay/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              </LineSearchButton>
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
        {query && <DelayMapPromo query={query} />}
      </div>
    </div>
  );
}
