import { useId, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import type { DelayBand, DelayMapResponse } from '../../types/api';
import { useI18n } from '../../i18n-core';
import DelayMapLayers from './DelayMapLayers';
import DelayMapViewport from './DelayMapViewport';
import DelayMapLegend from './DelayMapLegend';

const BANDS: DelayBand[] = ['ALL_DAY', 'MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING_NIGHT', 'WEEKEND'];

export default function DelayMap({ data }: { data: DelayMapResponse }) {
  const { t } = useI18n();
  const [directionIndex, setDirectionIndex] = useState(0);
  const [band, setBand] = useState<DelayBand>('ALL_DAY');
  const bandId = useId();
  const direction = data.directions[directionIndex] ?? data.directions[0];

  if (!direction) return <p role="status" className="py-8 text-center text-sm text-subtle">{t.delayMap.noRoute}</p>;
  const hasMeasurements = direction.segments.some(segment => segment.delays.some(item => item.band === band));

  return (
    <div>
      <div className="mb-4 flex min-w-0 flex-col gap-4">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">{t.delayMap.direction}</legend>
          <div className="flex flex-wrap gap-2">
            {data.directions.map((item, index) => (
              <button key={index} type="button" aria-pressed={index === directionIndex} onClick={() => setDirectionIndex(index)} className={`min-h-11 max-w-full cursor-pointer break-words rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${index === directionIndex ? 'border-blue-500/40 bg-blue-500/10 text-accent' : 'border-overlay/10 bg-surface text-body hover:bg-raised'}`}>
                {t.delayMap.directionLabel(index + 1, item.headsign)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="min-w-0 sm:max-w-md">
          <label htmlFor={bandId} className="mb-2 block text-xs font-semibold uppercase tracking-wide text-subtle">{t.delayMap.timeBand}</label>
          <select id={bandId} value={band} onChange={event => setBand(event.target.value as DelayBand)} className="min-h-11 w-full min-w-0 rounded-lg border border-overlay/10 bg-surface px-3 py-2 text-sm text-ink">
            {BANDS.map(value => <option key={value} value={value}>{t.delayMap.bands[value]}</option>)}
          </select>
        </div>
      </div>
      {direction.segments.length ? (
        <div className="stats-delay-map relative isolate overflow-hidden rounded-xl border border-overlay/10">
          <MapContainer center={[50.0647, 19.945]} zoom={12} scrollWheelZoom doubleClickZoom={false} zoomControl={false} className="h-80 w-full sm:h-[440px]">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ZoomControl position="topright" />
            <DelayMapViewport direction={direction} />
            <DelayMapLayers key={`${directionIndex}:${band}`} direction={direction} band={band} />
          </MapContainer>
        </div>
      ) : <p role="status" className="py-8 text-center text-sm text-subtle">{t.delayMap.noSegments}</p>}
      {direction.segments.length > 0 && !hasMeasurements && <p role="status" className="mt-3 text-sm text-subtle">{t.delayMap.noBandMeasurements}</p>}
      <DelayMapLegend />
      <p className="mt-4 text-xs leading-relaxed text-subtle">{t.delayMap.note}</p>
    </div>
  );
}
