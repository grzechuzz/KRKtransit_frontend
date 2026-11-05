import { Polyline } from 'react-leaflet';
import type { LatLng, LeafletMouseEvent } from 'leaflet';
import type { DelayBand, DelayMapSegment as Segment, DelayMapStop } from '../../types/api';
import { useI18n } from '../../i18n-core';
import { useTheme } from '../../theme-core';
import { delayMapColor } from './delayMapColors';
import { formatMapDelay } from './delayFormat';
import DelayMapTooltip from './DelayMapTooltip';

interface Props {
  segment: Segment;
  band: DelayBand;
  from: DelayMapStop | undefined;
  to: DelayMapStop | undefined;
  position?: LatLng;
  onEnter: (event: LeafletMouseEvent) => void;
  onLeave: () => void;
  onSelect: (event: LeafletMouseEvent) => void;
}

export default function DelayMapSegment({ segment, band, from, to, position, onEnter, onLeave, onSelect }: Props) {
  const { t, locale } = useI18n();
  const { theme } = useTheme();
  const metrics = segment.delays.find(item => item.band === band);
  const color = delayMapColor(metrics?.mean_seconds);
  const format = (value: number) => formatMapDelay(value, locale);
  const stopLabel = (stop: DelayMapStop | undefined) => stop
    ? `${stop.stop_name}${stop.stop_desc ? ` (${stop.stop_desc})` : ''}`
    : t.delayMap.unknownStop;

  return (
    <>
      <Polyline positions={segment.points} interactive={false} className="delay-map-segment-outline" pathOptions={{ color: theme === 'dark' ? '#e2e8f0' : '#0f172a', weight: position ? 10 : 8, opacity: theme === 'dark' ? 0.35 : 0.28 }} />
      <Polyline positions={segment.points} interactive={false} className="delay-map-segment" pathOptions={{ color, weight: position ? 8 : 6, opacity: 1 }} />
      <Polyline
        positions={segment.points}
        bubblingMouseEvents={false}
        className="delay-map-hit"
        pathOptions={{ opacity: 0, weight: 24 }}
        eventHandlers={{ mouseover: onEnter, mouseout: onLeave, click: onSelect }}
      >
        {position && (
          <DelayMapTooltip position={position}>
            <div>
              <header className="border-b border-overlay/10 pb-2 sm:pb-4">
                <p className="text-xs font-bold leading-snug text-ink sm:text-[13px]">{stopLabel(from)} → {stopLabel(to)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[11px] text-subtle sm:mt-2 sm:text-xs">
                  <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.25" className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5">
                    <ellipse cx="8" cy="4" rx="4.5" ry="2" />
                    <path d="M3.5 4v8c0 1.1 2 2 4.5 2s4.5-.9 4.5-2V4M3.5 8c0 1.1 2 2 4.5 2s4.5-.9 4.5-2" />
                  </svg>
                  {t.delayMap.sampleCount(metrics?.samples ?? 0)}
                </p>
              </header>
              {metrics ? (
                <dl className="tabular-nums">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-overlay/10 py-2 sm:gap-3 sm:py-4">
                    <dt className="text-xs leading-snug text-body sm:text-sm">{t.delayMap.mean}</dt>
                    <dd className="whitespace-nowrap text-right text-lg font-bold leading-tight tracking-tight sm:text-xl" style={{ color: theme === 'light' ? `color-mix(in srgb, ${color} 82%, black)` : color }}>{format(metrics.mean_seconds)}</dd>
                  </div>
                  <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:mt-4 sm:gap-3">
                    <dt className="text-[11px] text-subtle sm:text-xs">{t.delayMap.median}</dt>
                    <dd className="whitespace-nowrap text-right text-xs font-semibold text-ink sm:text-sm">{format(metrics.median_seconds)}</dd>
                  </div>
                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:mt-3 sm:gap-3">
                    <dt className="text-[11px] text-subtle sm:text-xs">{t.delayMap.p90}</dt>
                    <dd className="whitespace-nowrap text-right text-xs font-semibold text-ink sm:text-sm">{format(metrics.p90_seconds)}</dd>
                  </div>
                </dl>
              ) : <p className="mt-2 text-[11px] leading-relaxed text-subtle sm:mt-3 sm:text-xs">{t.delayMap.colors.missing}</p>}
            </div>
          </DelayMapTooltip>
        )}
      </Polyline>
    </>
  );
}
