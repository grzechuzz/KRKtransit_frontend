import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiClientError, fetchDelayMap, getErrorMessage } from '../../api/client';
import { useLineStatsSearch } from '../../hooks/useLineStatsSearch';
import { useI18n } from '../../i18n-core';
import { formatDateLabel, serializeStatsQuery } from '../../utils/lineStatsSearch';
import DelayMap from '../stats/DelayMap';
import LineStatsSearchFields from '../stats/LineStatsSearchFields';
import LineSearchButton from '../stats/LineSearchButton';
import DelayMapPlaceholder from './DelayMapPlaceholder';
import DelayMapLoading from './DelayMapLoading';

export default function DelayMapPage() {
  const { language, locale, t } = useI18n();
  const search = useLineStatsSearch();
  const { query } = search;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const scrolledQueryRef = useRef<typeof query>(null);
  const result = useQuery({
    queryKey: ['delayMap', query?.line, query?.start, query?.end, query?.estimated, language],
    queryFn: () => fetchDelayMap(query!.line, query!.start, query!.end, query!.estimated, language),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    search.handleSubmit(event);
    if (result.isError && query && search.canSubmit
      && serializeStatsQuery(query) === serializeStatsQuery({ ...search.draft, line: search.draft.line.trim() })) {
      void result.refetch();
    }
  };
  const empty = result.error instanceof ApiClientError && result.error.status === 404
    && result.error.errorCode === 'RESOURCE_NOT_FOUND';

  useEffect(() => {
    const resetScroll = () => {
      scrolledQueryRef.current = null;
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', resetScroll);
    return () => window.removeEventListener('popstate', resetScroll);
  }, []);

  useEffect(() => {
    if (!query || !result.data || result.error || scrolledQueryRef.current === query) return;
    const frame = window.requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      const results = resultsRef.current;
      if (!container || !results) return;
      scrolledQueryRef.current = query;
      results.focus({ preventScroll: true });
      container.scrollTo({
        top: Math.max(0, container.scrollTop + results.getBoundingClientRect().top - container.getBoundingClientRect().top - 16),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [query, result.data, result.error]);

  return (
    <div ref={scrollContainerRef} className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 pb-12 sm:px-8 sm:py-10">
        <header className="mb-6">
          <h1 className="text-2xl font-black uppercase tracking-wide text-ink sm:text-3xl">{t.delayMap.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{t.delayMap.description}</p>
        </header>
        <form onSubmit={submit} className="mb-6 rounded-2xl border border-overlay/10 bg-surface p-4 sm:p-6">
          <LineStatsSearchFields search={search} compact />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-subtle">{t.stats.nightLinesNote}</p>
            <LineSearchButton search={search} aria-busy={result.isFetching} className="min-h-11 shrink-0 cursor-pointer rounded-lg bg-blue-600 px-8 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 disabled:opacity-40 motion-reduce:transition-none">{t.stats.search}</LineSearchButton>
          </div>
        </form>
        <section ref={resultsRef} tabIndex={-1} aria-label={t.delayMap.title} aria-busy={!!query && result.isFetching}>
          {query && (!result.isFetching || result.data) && <p className="mb-5 text-sm font-semibold text-body">{t.stats.lineRange(query.line, formatDateLabel(query.start, locale), formatDateLabel(query.end, locale))}</p>}
          {!query ? <DelayMapPlaceholder message={t.delayMap.searchPrompt} />
            : result.isFetching && !result.data ? <DelayMapLoading label={t.stats.loading} />
            : result.error ? <p role={empty ? 'status' : 'alert'} className={`rounded-xl border px-5 py-6 text-sm ${empty ? 'border-overlay/10 text-subtle' : 'border-red-500/20 bg-red-500/5 text-negative'}`}>{getErrorMessage(result.error, language)}</p>
            : result.data ? <DelayMap key={JSON.stringify([query, search.version, result.dataUpdatedAt])} data={result.data} /> : null}
        </section>
      </div>
    </div>
  );
}
