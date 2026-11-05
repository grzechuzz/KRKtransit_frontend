import { useMemo, useState } from 'react';
import type { TrendResponse, TrendDay } from '../../types/api';
import { formatCompactDelay, formatSignedDelay } from './delayFormat';
import { useI18n } from '../../i18n-core';

interface TrendChartProps {
  data: TrendResponse;
}

interface Bar {
  label: string;
  sublabel: string;
  value: number;
  trips: number;
  daysCount: number;
}

function getWeekdayIndex(dateStr: string): number {
  const d = new Date(dateStr);
  // JS getDay(): 0=Sunday, we want 0=Monday
  return (d.getDay() + 6) % 7;
}

function formatYLabel(seconds: number): string {
  return (seconds < 0 ? '\u2212' : '') + formatCompactDelay(seconds);
}

function aggregateByWeekday(days: TrendDay[], weekdayLabels: string[]): Bar[] {
  const buckets = new Map<number, TrendDay[]>();

  for (const day of days) {
    const idx = getWeekdayIndex(day.date);
    const existing = buckets.get(idx);
    if (existing) {
      existing.push(day);
    } else {
      buckets.set(idx, [day]);
    }
  }

  // Build bars ordered Mon→Sun, only for weekdays present in data
  const bars: Bar[] = [];
  for (let i = 0; i < 7; i++) {
    const chunk = buckets.get(i);
    if (!chunk) continue;

    const totalTrips = chunk.reduce((s, d) => s + d.trips_count, 0);
    const weightedAvg =
      totalTrips > 0
        ? chunk.reduce((s, d) => s + d.avg_delay_seconds * d.trips_count, 0) / totalTrips
        : 0;

    bars.push({
      label: weekdayLabels[i],
      sublabel: chunk.length > 1 ? `×${chunk.length}` : '',
      value: weightedAvg,
      trips: totalTrips,
      daysCount: chunk.length,
    });
  }

  return bars;
}

const GRID_LINES = 4;
const CHART_HEIGHT = 220;

export default function TrendChart({ data }: TrendChartProps) {
  const { language, t, locale } = useI18n();
  const bars = useMemo(() => aggregateByWeekday(data.days, t.trend.weekdays), [data.days, t.trend.weekdays]);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  if (!bars.length) {
    return (
      <p className="py-8 text-center text-sm text-subtle">
        {t.trend.noData}
      </p>
    );
  }

  const maxValue = Math.max(...bars.map((b) => b.value), 0);
  const minValue = Math.min(...bars.map((b) => b.value), 0);
  const stepSeconds = Math.max(60, Math.ceil(((maxValue - minValue) * 1.3) / (GRID_LINES * 60)) * 60);
  const floorSeconds = Math.floor(minValue / stepSeconds) * stepSeconds;
  const ceilingSeconds = Math.max(floorSeconds + stepSeconds, Math.ceil(maxValue / stepSeconds) * stepSeconds);
  const rangeSeconds = ceilingSeconds - floorSeconds;
  const zeroPct = (ceilingSeconds / rangeSeconds) * 100;
  const ticks = Array.from({ length: Math.round(rangeSeconds / stepSeconds) + 1 }, (_, i) => ceilingSeconds - i * stepSeconds);
  const highlightedBar = activeBar === null ? undefined : bars[activeBar];

  return (
    <div translate="no">
      <div className="relative rounded-lg border border-overlay/10 bg-surface p-3 sm:p-5">
        {highlightedBar && (
          <p className="pointer-events-none absolute top-2 left-1/2 z-10 max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-lg bg-raised px-3 py-1 text-center text-xs shadow-sm ring-1 ring-overlay/10">
            <span className="font-bold text-ink">{formatSignedDelay(highlightedBar.value, language)}</span>
            <span className="mx-1.5 text-subtle">|</span>
            <span className="text-muted">{t.trend.trips(highlightedBar.trips.toLocaleString(locale))}</span>
          </p>
        )}
        {/* Chart grid + bars */}
        <div className="flex gap-2 sm:gap-3">

          {/* Y-axis */}
          <div className="flex shrink-0 flex-col justify-between" style={{ height: CHART_HEIGHT }}>
            {ticks.map((val) => (
                <span key={val} className="text-right text-[9px] tabular-nums leading-none text-subtle sm:text-[11px]">
                  {formatYLabel(val)}
                </span>
            ))}
          </div>

          {/* Bars area */}
          <div className="relative flex-1" style={{ height: CHART_HEIGHT }}>
            {/* Grid lines */}
            {ticks.map((val) => (
              <div
                key={val}
                className={`absolute left-0 right-0 h-px ${val === 0 ? 'bg-overlay/25' : 'bg-overlay/5'}`}
                style={{ top: `${((ceilingSeconds - val) / rangeSeconds) * 100}%` }}
              />
            ))}

            {/* Bars */}
            <div className="relative flex h-full items-end gap-0.5 sm:gap-1">
              {bars.map((bar, i) => {
                const heightPct = (Math.abs(bar.value) / rangeSeconds) * 100;
                return (
                  <div
                    key={i}
                    className="relative min-w-0 flex-1"
                    style={{ height: '100%' }}
                    onMouseEnter={() => setActiveBar(i)}
                    onMouseLeave={() => setActiveBar(null)}
                    onTouchStart={() => setActiveBar(i)}
                  >
                    <div
                      className={`absolute w-full transition-colors ${bar.value < 0 ? 'rounded-b' : 'rounded-t'} ${activeBar === i ? 'bg-blue-400' : 'bg-blue-500'}`}
                      style={{
                        height: `${heightPct}%`,
                        minHeight: bar.value === 0 ? 0 : 2,
                        top: bar.value < 0 ? `${zeroPct}%` : undefined,
                        bottom: bar.value >= 0 ? `${100 - zeroPct}%` : undefined,
                      }}
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
              <div
                key={i}
                className="min-w-0 flex-1 text-center leading-tight"
              >
                <span className="block truncate text-[9px] text-subtle sm:text-[11px]">
                  {bar.label}
                </span>
                {bar.sublabel && (
                  <span className="block text-[7px] text-subtle sm:text-[9px]">
                    {bar.sublabel}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-subtle sm:text-xs">
        {t.trend.footer(data.days.length)}
      </p>
    </div>
  );
}
