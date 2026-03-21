import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPunctuality, fetchMaxDelay, fetchRouteDelay, fetchTrend } from '../../api/client';
import PunctualityRing from './PunctualityRing';
import MaxDelayTable from './MaxDelayTable';
import RouteDelayTable from './RouteDelayTable';
import TrendChart from './TrendChart';

function getDefaultDates() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  return {
    start: weekAgo.toISOString().slice(0, 10),
    end: today.toISOString().slice(0, 10),
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

/* ── Collapsible "Jak to działa?" ────────────────────── */

function MethodologyAccordion({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

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
            Jak to działa?
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
            Kliknij, aby rozwinąć
          </p>
        )}

        {open && (
          <p className="mt-2 text-xs text-gray-500 sm:text-sm">
            Metodologia analizy danych
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

  const canSubmit = lineInput.trim().length > 0 && startDate && endDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setQuery({ line: lineInput.trim(), start: startDate, end: endDate, estimated });
  };

  const punctuality = useQuery({
    queryKey: ['punctuality', query?.line, query?.start, query?.end, query?.estimated],
    queryFn: () => fetchPunctuality(query!.line, query!.start, query!.end, query!.estimated),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const maxDelay = useQuery({
    queryKey: ['maxDelay', query?.line, query?.start, query?.end, query?.estimated],
    queryFn: () => fetchMaxDelay(query!.line, query!.start, query!.end, query!.estimated),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const routeDelay = useQuery({
    queryKey: ['routeDelay', query?.line, query?.start, query?.end, query?.estimated],
    queryFn: () => fetchRouteDelay(query!.line, query!.start, query!.end, query!.estimated),
    enabled: !!query,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const trend = useQuery({
    queryKey: ['trend', query?.line, query?.start, query?.end, query?.estimated],
    queryFn: () => fetchTrend(query!.line, query!.start, query!.end, query!.estimated),
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
      <div className="mx-auto max-w-7xl px-4 py-6 pb-20 sm:px-8 sm:py-10 sm:pb-10">

        {/* Hero search — shown when no results yet */}
        {!hasResults && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-lg">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.04] to-transparent p-6 shadow-2xl sm:p-10">
                <h1 className="mb-1 text-center text-2xl font-black uppercase tracking-wide text-white sm:text-4xl">
                  Statystyki
                </h1>
                <p className="mb-8 text-center text-xs text-gray-600">
                  Linie nocne zaliczają się do poprzedniego dnia serwisowego
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
                      autoComplete="off"
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

                <div className="mt-4">
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-gray-500">
                    Estymacje
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
                      Uwzględnij estymacje
                    </span>
                    <p className="text-[11px] text-gray-600">
                      Dane estymowane — mogą być mniej dokładne niż potwierdzone odczyty. Dostępne od 19.03.2026.
                    </p>
                  </div>
                </button>
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="group relative mt-4 block w-full -skew-x-12 cursor-pointer overflow-hidden rounded-sm bg-blue-600 py-3.5 text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none"
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
                  autoComplete="off"
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

              {/* Estimation toggle — inline on desktop, own row on mobile */}
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 select-none transition hover:bg-white/10 sm:shrink-0">
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
                  Estymacje
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
          <div className="space-y-8 sm:space-y-10">
            <MethodologyAccordion>
              <dl className="space-y-3 text-sm">
                {[
                  {
                    title: 'Analizujemy trasę od 2. do przedostatniego przystanku',
                    text: 'Odczyty z pierwszych i ostatnich przystanków są często niemiarodajne, więc wyrzucamy je z analizy.',
                  },
                  {
                    title: 'Priorytet dla potwierdzonych danych (status STOPPED_AT)',
                    text: 'W pierwszej kolejności pod uwagę bierzemy odczyty z danych GTFS Realtime, które posiadają jawny status STOPPED_AT. Oznacza to, że w domyślnym widoku statystyk widoczne są tylko te sytuacje, w których system pokładowy pojazdu jednoznacznie potwierdził fizyczny postój na przystanku.',
                  },
                  {
                    title: 'Opcjonalne estymacje',
                    text: 'Przełącznik "Estymacje" pozwala dodatkowo uwzględnić przybliżone czasy oszacowane przez system w sytuacjach, gdy pojazd nie zarejestrował fizycznego zatrzymania. Estymacje przechodzą walidację, ale i tak mogą zawierać większy margines błędu niż dane bezpośrednie. Dane estymowane dostępne są od 19.03.2026.',
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
            </MethodologyAccordion>

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
                  subtitle="Średnie opóźnienie dla poszczególnych dni"
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
