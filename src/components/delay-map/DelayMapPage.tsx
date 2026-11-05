import type { FormEvent } from 'react';
import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiClientError, fetchDelayMap, getErrorMessage } from '../../api/client';
import { useLineStatsSearch } from '../../hooks/useLineStatsSearch';
import { useI18n } from '../../i18n-core';
import { serializeStatsQuery } from '../../utils/lineStatsSearch';
import DelayMap from '../stats/DelayMap';
import LineStatsSearchFields from '../stats/LineStatsSearchFields';
import LineSearchButton from '../stats/LineSearchButton';
import DelayMapPlaceholder from './DelayMapPlaceholder';
import DelayMapLoading from './DelayMapLoading';

export default function DelayMapPage() {
  const { language, t } = useI18n();
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
    <div ref={scrollContainerRef} className="h-full overflow-y-auto" onPointerDownCapture={() => {
      if (document.activeElement === resultsRef.current) resultsRef.current?.blur();
    }}>
      <div className="mx-auto max-w-7xl px-4 py-6 pb-12 sm:px-8">
        <header className="mb-5">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-8 w-1.5 shrink-0 -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/30" />
            <h1 className="text-2xl font-black uppercase tracking-wide text-ink sm:text-3xl">{t.delayMap.title}</h1>
          </div>
          <p className="mt-2 text-xs text-subtle sm:text-sm">{t.delayMap.description}</p>
          <div aria-hidden="true" className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-500/10 to-transparent" />
        </header>
        <form onSubmit={submit} className="mb-6 rounded-2xl border border-overlay/5 bg-gradient-to-b from-overlay/[0.04] to-transparent p-4 shadow-panel">
          <LineStatsSearchFields search={search} compact action={
            <LineSearchButton search={search} aria-busy={result.isFetching} className="min-h-11 w-full shrink-0 -skew-x-12 cursor-pointer rounded-sm bg-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 transition-[background-color,box-shadow] hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none sm:mr-1 sm:w-auto motion-reduce:transition-none">
              <span className="inline-block skew-x-12">{t.stats.search}</span>
            </LineSearchButton>
          } />
        </form>
        <section ref={resultsRef} tabIndex={-1} aria-label={t.delayMap.title} aria-busy={!!query && result.isFetching}>
          <div aria-hidden="true" className="mb-6 h-px bg-gradient-to-r from-blue-500/25 via-blue-500/10 to-transparent" />
          {!query ? <DelayMapPlaceholder message={t.delayMap.searchPrompt} />
            : result.isFetching && !result.data ? <DelayMapLoading label={t.stats.loading} />
            : result.error ? <p role={empty ? 'status' : 'alert'} className={`rounded-xl border px-5 py-6 text-sm ${empty ? 'border-overlay/10 text-subtle' : 'border-red-500/20 bg-red-500/5 text-negative'}`}>{getErrorMessage(result.error, language)}</p>
            : result.data ? <DelayMap key={JSON.stringify([query, search.version, result.dataUpdatedAt])} data={result.data} /> : null}
        </section>
      </div>
    </div>
  );
}
