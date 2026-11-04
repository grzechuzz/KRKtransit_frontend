import { Polyline } from 'react-leaflet';
import type { LatLng, LeafletMouseEvent } from 'leaflet';
import type { DelayBand, DelayMapSegment as Segment, DelayMapStop } from '../../types/api';
import { useI18n } from '../../i18n-core';
import { delayMapColor } from './delayMapColors';
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
  const metrics = segment.delays.find(item => item.band === band);
  const format = (value: number) => t.delayMap.seconds(new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1, signDisplay: 'exceptZero',
  }).format(value));
  const stopLabel = (stop: DelayMapStop | undefined) => stop
    ? `${stop.stop_name}${stop.stop_desc ? ` (${stop.stop_desc})` : ''}`
    : t.delayMap.unknownStop;

  return (
    <>
      <Polyline positions={segment.points} interactive={false} className="delay-map-segment" pathOptions={{ color: delayMapColor(metrics?.mean_seconds), weight: 5, opacity: 1 }} />
      <Polyline
        positions={segment.points}
        bubblingMouseEvents={false}
        className="delay-map-hit"
        pathOptions={{ opacity: 0, weight: 24 }}
        eventHandlers={{ mouseover: onEnter, mouseout: onLeave, click: onSelect }}
      >
        {position && (
          <DelayMapTooltip position={position}>
            <div className="space-y-2">
              <p className="font-semibold">{stopLabel(from)} → {stopLabel(to)}</p>
              <p className="text-subtle">{t.delayMap.bands[band]}</p>
              {metrics ? (
                <dl className="grid grid-cols-[1fr_auto] gap-x-5 gap-y-1 tabular-nums">
                  <dt>{t.delayMap.samples}</dt><dd>{metrics.samples.toLocaleString(locale)}</dd>
                  <dt>{t.delayMap.mean}</dt><dd>{format(metrics.mean_seconds)}</dd>
                  <dt>{t.delayMap.median}</dt><dd>{format(metrics.median_seconds)}</dd>
                  <dt>{t.delayMap.p90}</dt><dd>{format(metrics.p90_seconds)}</dd>
                </dl>
              ) : <p>{t.delayMap.noBandMeasurements}</p>}
            </div>
          </DelayMapTooltip>
        )}
      </Polyline>
    </>
  );
}
