import { useMemo } from 'react';
import type { TrendResponse, TrendDay } from '../../types/api';

interface TrendChartProps {
  data: TrendResponse;
}

interface Bar {
  label: string;
  value: number;
  trips: number;
}

function aggregateBars(days: TrendDay[], maxBars: number): Bar[] {
  if (days.length <= maxBars) {
    return days.map((d) => ({
      label: formatDateLabel(d.date),
      value: d.avg_delay_seconds / 60,
      trips: d.trips_count,
    }));
  }

  // Group days into equal-ish buckets
  const bucketSize = Math.ceil(days.length / maxBars);
  const bars: Bar[] = [];

  for (let i = 0; i < days.length; i += bucketSize) {
    const chunk = days.slice(i, i + bucketSize);
    const totalTrips = chunk.reduce((s, d) => s + d.trips_count, 0);
    const weightedAvg = totalTrips > 0
      ? chunk.reduce((s, d) => s + d.avg_delay_seconds * d.trips_count, 0) / totalTrips
      : 0;

    const first = formatDateLabel(chunk[0].date);
    const last = chunk.length > 1 ? formatDateLabel(chunk[chunk.length - 1].date) : '';
    const label = last ? `${first}\u2013${last}` : first;

    bars.push({ label, value: weightedAvg / 60, trips: totalTrips });
  }

  return bars;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

const MAX_BARS = 15;

export default function TrendChart({ data }: TrendChartProps) {
  const bars = useMemo(() => aggregateBars(data.days, MAX_BARS), [data.days]);

  if (!bars.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Brak danych o trendach dla wybranego zakresu.
      </p>
    );
  }

  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  // Round up to a nice ceiling
  const ceiling = Math.ceil(maxValue / 2) * 2 || 2;
  const gridLines = 4;

  return (
    <div>
      <div className="relative rounded-xl border border-white/5 bg-white/[0.02] p-4 sm:p-6">
        {/* Y-axis grid lines */}
        <div className="absolute inset-x-4 inset-y-4 sm:inset-x-6 sm:inset-y-6">
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const pct = (i / gridLines) * 100;
            const val = ceiling - (i / gridLines) * ceiling;
            return (
              <div
                key={i}
                className="absolute left-0 right-0 flex items-center"
                style={{ top: `${pct}%` }}
              >
                <span className="absolute -left-1 -translate-x-full text-[10px] tabular-nums text-gray-600 sm:text-xs">
                  {val.toFixed(0)}
                </span>
                <div className="ml-6 h-px w-full bg-white/5 sm:ml-8" />
              </div>
            );
          })}
        </div>

        {/* Y-axis label */}
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-wider text-gray-600 sm:left-0 sm:text-xs">
          min
        </div>

        {/* Bars */}
        <div className="relative ml-8 flex items-end gap-1 sm:ml-10 sm:gap-1.5" style={{ height: 200 }}>
          {bars.map((bar, i) => {
            const heightPct = Math.max((bar.value / ceiling) * 100, 1);
            const isHigh = bar.value > ceiling * 0.65;
            return (
              <div
                key={i}
                className="group relative flex min-w-0 flex-1 flex-col items-center justify-end"
                style={{ height: '100%' }}
              >
                {/* Tooltip */}
                <div className="pointer-events-none absolute bottom-full mb-2 hidden rounded-lg bg-gray-800 px-2.5 py-1.5 text-xs shadow-lg group-hover:block">
                  <p className="whitespace-nowrap font-bold text-white">
                    {bar.value.toFixed(1)} min
                  </p>
                  <p className="whitespace-nowrap text-gray-400">
                    {bar.trips.toLocaleString('pl-PL')} kursów
                  </p>
                </div>

                {/* Bar */}
                <div
                  className={`w-full rounded-t transition-all group-hover:opacity-80 ${
                    isHigh
                      ? 'bg-gradient-to-t from-red-500 to-red-400'
                      : 'bg-gradient-to-t from-blue-600 to-blue-400'
                  }`}
                  style={{ height: `${heightPct}%`, minHeight: 2 }}
                />

                {/* X label */}
                <span className="mt-2 w-full truncate text-center text-[9px] leading-tight text-gray-600 sm:text-[10px]">
                  {bar.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-600">
        Średnie opóźnienie w minutach na podstawie {data.days.length} dni
      </p>
    </div>
  );
}
