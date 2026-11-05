import { useId, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import type { DelayBand, DelayMapResponse } from '../../types/api';
import { useI18n } from '../../i18n-core';
import DelayMapLayers from './DelayMapLayers';
import DelayMapViewport from './DelayMapViewport';
import DelayMapLegend from './DelayMapLegend';
import DelayBandSelect from './DelayBandSelect';

const MAX_BOUNDS = latLngBounds([49.0, 18.5], [51.0, 21.5]);

export default function DelayMap({ data }: { data: DelayMapResponse }) {
  const { t } = useI18n();
  const [directionIndex, setDirectionIndex] = useState(0);
  const [band, setBand] = useState<DelayBand>('ALL_DAY');
  const interpretationId = useId();
  const direction = data.directions[directionIndex] ?? data.directions[0];

  if (!direction) return <p role="status" className="py-8 text-center text-sm text-subtle">{t.delayMap.noRoute}</p>;
  const hasMeasurements = direction.segments.some(segment => segment.delays.some(item => item.band === band));

  return (
    <div>
      <div className="mb-4 flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start">
        <fieldset className="min-w-0 flex-1">
          <legend className="mb-1 text-xs font-medium uppercase tracking-widest text-subtle">{t.delayMap.direction}</legend>
          <div className="flex flex-wrap gap-2">
            {data.directions.map((item, index) => (
              <button key={index} type="button" aria-pressed={index === directionIndex} onClick={() => setDirectionIndex(index)} className={`min-h-11 max-w-full cursor-pointer break-words rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${index === directionIndex ? 'border-blue-500/40 bg-blue-500/10 text-accent' : 'border-overlay/10 bg-surface text-body hover:bg-raised'}`}>
                {t.delayMap.directionLabel(index + 1, item.headsign)}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="min-w-0 sm:max-w-md lg:w-72 lg:shrink-0">
          <DelayBandSelect value={band} onChange={setBand} />
        </div>
      </div>
      {direction.segments.length ? (
        <div className="stats-delay-map relative isolate overflow-hidden rounded-xl border border-overlay/10">
          <MapContainer center={[50.0647, 19.945]} zoom={12} minZoom={8} maxBounds={MAX_BOUNDS} maxBoundsViscosity={1.0} scrollWheelZoom doubleClickZoom={false} zoomControl={false} className="h-[clamp(360px,55dvh,480px)] w-full lg:h-[clamp(480px,65dvh,760px)]">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ZoomControl position="topright" />
            <DelayMapViewport direction={direction} />
            <DelayMapLayers key={`${directionIndex}:${band}`} direction={direction} band={band} />
          </MapContainer>
          <DelayMapLegend />
        </div>
      ) : <p role="status" className="py-8 text-center text-sm text-subtle">{t.delayMap.noSegments}</p>}
      {direction.segments.length > 0 && !hasMeasurements && <p role="status" className="mt-3 text-sm text-subtle">{t.delayMap.noBandMeasurements}</p>}
      <section aria-labelledby={interpretationId} className="mt-4 max-w-4xl space-y-2 text-xs leading-relaxed text-muted sm:text-sm">
        <h2 id={interpretationId} className="text-sm font-semibold text-ink">{t.delayMap.interpretation.title}</h2>
        <p>{t.delayMap.interpretation.description}</p>
        <p className="font-semibold text-body">{t.delayMap.interpretation.formula}</p>
        <p>{t.delayMap.interpretation.meaning}</p>
      </section>
    </div>
  );
}
