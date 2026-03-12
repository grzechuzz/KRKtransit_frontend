import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPunctuality, fetchMaxDelay, fetchRouteDelay, fetchTrend } from '../../api/client';
import PunctualityRing from './PunctualityRing';
import MaxDelayTable from './MaxDelayTable';
import RouteDelayTable from './RouteDelayTable';
import TrendChart from './TrendChart';

function getDefaultDates() {
  const today = new Date().toISOString().slice(0, 10);
  return { start: today, end: today };
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
        <span className="absolute bottom-full left-0 mb-2 w-56 rounded-lg bg-gray-800 px-3 py-2 text-[11px] leading-relaxed text-gray-200 shadow-xl ring-1 ring-white/10 sm:left-1/2 sm:w-64 sm:-translate-x-1/2">
          {text}
        </span>
      )}
    </span>
  );
}

/* ── Section Header ───────────────────────────────────── */

function SectionHeader({ title, subtitle, tooltip, badge }: { title: string; subtitle: string; tooltip?: string; badge?: string }) {
  return (
    <div className="mb-8">
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

/* ── Page ─────────────────────────────────────────────── */

export default function StatsPage() {
  const defaults = getDefaultDates();
  const [lineInput, setLineInput] = useState('');
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [query, setQuery] = useState<{
    line: string;
    start: string;
    end: string;
  } | null>(null);

  const canSubmit = lineInput.trim().length > 0 && startDate && endDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setQuery({ line: lineInput.trim(), start: startDate, end: endDate });
  };

  const punctuality = useQuery({
    queryKey: ['punctuality', query?.line, query?.start, query?.end],
    queryFn: () => fetchPunctuality(query!.line, query!.start, query!.end),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const maxDelay = useQuery({
    queryKey: ['maxDelay', query?.line, query?.start, query?.end],
    queryFn: () => fetchMaxDelay(query!.line, query!.start, query!.end),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const routeDelay = useQuery({
    queryKey: ['routeDelay', query?.line, query?.start, query?.end],
    queryFn: () => fetchRouteDelay(query!.line, query!.start, query!.end),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const trend = useQuery({
    queryKey: ['trend', query?.line, query?.start, query?.end],
    queryFn: () => fetchTrend(query!.line, query!.start, query!.end),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isLoading = punctuality.isLoading || maxDelay.isLoading || routeDelay.isLoading || trend.isLoading;
  const hasError = punctuality.error || maxDelay.error || routeDelay.error || trend.error;
  const hasData = punctuality.data && maxDelay.data && routeDelay.data && trend.data;
  const hasResults = hasData || hasError || isLoading;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-10">

        {/* Hero search — shown when no results yet */}
        {!hasResults && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-lg">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-6 shadow-2xl sm:p-10">
                <h1 className="mb-1 text-center text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
                  Statystyki
                </h1>
                <p className="mb-8 text-center text-xs text-gray-500 sm:text-sm">
                  Punktualność i opóźnienia dla wybranej linii
                  <br />
                  <span className="text-gray-600">
                    Linie nocne zaliczają się do poprzedniego dnia serwisowego
                  </span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="line-hero" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                      Numer linii
                    </label>
                    <input
                      id="line-hero"
                      type="text"
                      value={lineInput}
                      onChange={(e) => setLineInput(e.target.value)}
                      placeholder="304"
                      maxLength={5}
                      className="h-14 w-full rounded-lg border border-white/10 bg-white/5 px-5 text-2xl font-black text-white placeholder-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:text-3xl"
                    />
                  </div>

                  <div>
                    <label htmlFor="start-hero" className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                      Zakres dat
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="start-hero"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                      />
                      <span className="shrink-0 text-xs text-gray-600">—</span>
                      <input
                        id="end-hero"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-11 min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative mt-6 block w-full -skew-x-12 cursor-pointer overflow-hidden rounded-sm bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none"
                >
                  <span className="relative z-10 inline-block skew-x-12">Szukaj</span>
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
              <div className="flex-shrink-0">
                <label htmlFor="line" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                  Linia
                </label>
                <input
                  id="line"
                  type="text"
                  value={lineInput}
                  onChange={(e) => setLineInput(e.target.value)}
                  placeholder="304"
                  maxLength={5}
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-lg font-bold text-white placeholder-gray-600 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:w-28"
                />
              </div>

              <div className="flex flex-1 gap-3">
                <div className="flex-1">
                  <label htmlFor="start" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                    Od
                  </label>
                  <input
                    id="start"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="end" className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">
                    Do
                  </label>
                  <input
                    id="end"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-11 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="-skew-x-12 cursor-pointer rounded-sm bg-blue-600 px-6 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 disabled:opacity-40 disabled:shadow-none"
              >
                <span className="inline-block skew-x-12">Szukaj</span>
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-gray-600">
              Linie nocne zaliczają się do poprzedniego dnia serwisowego
            </p>
          </form>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-700 border-t-blue-500" />
          </div>
        )}

        {/* Error */}
        {hasError && !isLoading && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400">
            {(punctuality.error || maxDelay.error || routeDelay.error || trend.error) instanceof Error
              ? (punctuality.error || maxDelay.error || routeDelay.error || trend.error)!.message
              : 'Nie udało się pobrać danych.'}
          </div>
        )}

        {/* Results */}
        {hasData && !isLoading && (
          <div className="space-y-12 sm:space-y-16">
            <section>
              <SectionHeader title="Jak to działa?" subtitle="Metodologia analizy danych" />
              <dl className="space-y-3 text-sm">
                {[
                  {
                    title: 'Analizujemy trasę od 2. do przedostatniego przystanku',
                    text: 'Celowo pomijamy pętle początkowe i końcowe. Odczyty z pierwszych i ostatnich przystanków są często niemiarodajne (np. pojazd stoi na przerwie, a system już liczy opóźnienie), więc wyrzucamy je z analizy.',
                  },
                  {
                    title: 'Wymagamy twardego potwierdzenia (status STOPPED_AT)',
                    text: 'Pod uwagę bierzemy wyłącznie te odczyty z danych GTFS Realtime, które posiadają jawny status STOPPED_AT. Mówiąc prościej: liczymy tylko te sytuacje, w których komputer w autobusie ze 100% pewnością zameldował: „potwierdzam, fizycznie zatrzymałem się na tym przystanku".',
                  },
                  {
                    title: 'Nie zgadujemy, dlatego odrzucamy niepewne pomiary',
                    text: 'Jeśli pojazd przejechał przez przystanek, ale nie wysłał twardego sygnału o zatrzymaniu, odrzucamy ten pomiar. Z tego powodu nasze statystyki mogą nie obejmować dużej części zrealizowanych kursów. Minusem jest również utrata danych z omijanych przystanków na żądanie. Mimo to wolimy pokazać mniejszą próbkę danych, niż opierać się na niepewnych założeniach.',
                  },
                  {
                    title: 'Pracujemy nad własnymi estymacjami',
                    text: 'Zależy nam na tym, aby docelowo uwzględniać w statystykach wszystkie odbyte kursy. Rozwijamy algorytmy, które pozwolą uzupełniać braki w danych, jednak na ten moment ich skuteczność nie spełnia naszych rygorystycznych oczekiwań. Nie chcemy fałszować rzeczywistości ani wprowadzać pasażerów w błąd, dlatego dopóki estymacje nie będą idealne, opieramy się wyłącznie na sprawdzonych faktach.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-500 shadow-sm shadow-blue-500/40" />
                    <div>
                      <dt className="text-base font-bold text-white sm:text-lg">{item.title}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-gray-400">{item.text}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <SectionHeader
                title="Punktualność"
                subtitle={`Linia ${punctuality.data.line_number} \u00b7 ${punctuality.data.start_date} — ${punctuality.data.end_date}`}
                tooltip="Jeden pomiar = pojedynczy odjazd z przystanku na trasie (bez przystanków początkowych i końcowych)"
              />
              <PunctualityRing data={punctuality.data} />
            </section>

            <section>
              <SectionHeader
                badge="TOP 10"
                title="Opóźnienia między przystankami"
                subtitle="Największy przyrost opóźnienia między dwoma kolejnymi przystankami"
              />
              <MaxDelayTable data={maxDelay.data} />
            </section>

            <section>
              <SectionHeader
                badge="TOP 10"
                title="Opóźnienia na całej trasie"
                subtitle="Największy przyrost opóźnienia na całej trasie (od 2. do przedostatniego przystanku)"
              />
              <RouteDelayTable data={routeDelay.data} />
            </section>

            {trend.data.days.length >= 5 && (
              <section>
                <SectionHeader
                  title="Trend opóźnień"
                  subtitle="Średnie opóźnienie w minutach dla poszczególnych dni"
                />
                <TrendChart data={trend.data} />
              </section>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
