import { useMemo, useState, useSyncExternalStore } from 'react';
import type { TrendResponse, TrendDay } from '../../types/api';

interface TrendChartProps {
  data: TrendResponse;
}

interface Bar {
  label: string;
  value: number;
  trips: number;
}

function formatDelay(seconds: number): string {
  const totalSec = Math.round(seconds);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec} sek`;
  return `${min} min ${sec} sek`;
}

function formatYLabel(seconds: number): string {
  const totalSec = Math.round(seconds);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min === 0) return `${sec}s`;
  if (sec === 0) return `${min}m`;
  return `${min}m ${sec}s`;
}

function aggregateBars(days: TrendDay[], maxBars: number): Bar[] {
  if (days.length <= maxBars) {
    return days.map((d) => ({
      label: formatDateLabel(d.date),
      value: d.avg_delay_seconds,
      trips: d.trips_count,
    }));
  }

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

    bars.push({ label, value: weightedAvg, trips: totalTrips });
  }

  return bars;
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

const MAX_BARS_DESKTOP = 15;
const MAX_BARS_MOBILE = 10;
const SM_BREAKPOINT = 640;
const GRID_LINES = 4;
const CHART_HEIGHT = 220;

function subscribeResize(cb: () => void) {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
}

function getMaxBars() {
  return window.innerWidth >= SM_BREAKPOINT ? MAX_BARS_DESKTOP : MAX_BARS_MOBILE;
}

export default function TrendChart({ data }: TrendChartProps) {
  const maxBars = useSyncExternalStore(subscribeResize, getMaxBars, () => MAX_BARS_DESKTOP);
  const bars = useMemo(() => aggregateBars(data.days, maxBars), [data.days, maxBars]);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  if (!bars.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Brak danych o trendach dla wybranego zakresu.
      </p>
    );
  }

  const maxValue = Math.max(...bars.map((b) => b.value), 1);
  const rawCeiling = Math.ceil(maxValue / 60) * 60;
  const ceilingSeconds = Math.max(rawCeiling + 60, Math.ceil((maxValue * 1.3) / 60) * 60) || 60;

  return (
    <div>
      {/* Tooltip - fixed above chart */}
      <div className="mb-2 flex h-8 items-center justify-center">
        {activeBar !== null && (
          <p className="rounded-lg bg-gray-800 px-3 py-1 text-xs ring-1 ring-white/10">
            <span className="font-bold text-white">{formatDelay(bars[activeBar].value)}</span>
            <span className="mx-1.5 text-gray-600">|</span>
            <span className="text-gray-400">{bars[activeBar].trips.toLocaleString('pl-PL')} kursów</span>
            <span className="mx-1.5 text-gray-600">|</span>
            <span className="text-gray-500">{bars[activeBar].label}</span>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 sm:p-5">
        {/* Chart grid + bars */}
        <div className="flex gap-2 sm:gap-3">

          {/* Y-axis */}
          <div className="flex shrink-0 flex-col justify-between" style={{ height: CHART_HEIGHT }}>
            {Array.from({ length: GRID_LINES + 1 }).map((_, i) => {
              const val = ceilingSeconds - (i / GRID_LINES) * ceilingSeconds;
              return (
                <span key={i} className="text-right text-[9px] tabular-nums leading-none text-gray-600 sm:text-[11px]">
                  {formatYLabel(val)}
                </span>
              );
            })}
          </div>

          {/* Bars area */}
          <div className="relative flex-1" style={{ height: CHART_HEIGHT }}>
            {/* Grid lines */}
            {Array.from({ length: GRID_LINES + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 h-px bg-white/5"
                style={{ top: `${(i / GRID_LINES) * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div className="relative flex h-full items-end gap-0.5 sm:gap-1">
              {bars.map((bar, i) => {
                const heightPct = Math.max((bar.value / ceilingSeconds) * 100, 1);
                return (
                  <div
                    key={i}
                    className="flex min-w-0 flex-1 items-end justify-center"
                    style={{ height: '100%' }}
                    onMouseEnter={() => setActiveBar(i)}
                    onMouseLeave={() => setActiveBar(null)}
                    onTouchStart={() => setActiveBar(i)}
                  >
                    <div
                      className={`w-full rounded-t transition-colors ${activeBar === i ? 'bg-blue-400' : 'bg-blue-500'}`}
                      style={{ height: `${heightPct}%`, minHeight: 2 }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* X-axis labels */}
        <div className="mt-2 flex gap-2 sm:gap-3">
          {/* Spacer matching Y-axis width */}
          <div className="shrink-0">
            <span className="invisible text-[9px] sm:text-[11px]">00m</span>
          </div>
          <div className="flex flex-1 gap-0.5 sm:gap-1">
            {bars.map((bar, i) => (
              <span
                key={i}
                className="min-w-0 flex-1 truncate text-center text-[8px] leading-tight text-gray-600 sm:text-[10px]"
              >
                {bar.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-gray-600 sm:text-xs">
        Średnie opóźnienie na podstawie {data.days.length} dni
      </p>
    </div>
  );
}
