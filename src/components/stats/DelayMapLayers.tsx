import { Fragment, useEffect, useMemo, useState } from 'react';
import { CircleMarker, Pane, useMapEvents } from 'react-leaflet';
import type { LatLng, LeafletMouseEvent } from 'leaflet';
import type { DelayBand, DelayMapDirection } from '../../types/api';
import DelayMapSegment from './DelayMapSegment';
import DelayMapTooltip from './DelayMapTooltip';

interface ActiveItem {
  key: string;
  position: LatLng;
  pinned: boolean;
}

export default function DelayMapLayers({ direction, band }: { direction: DelayMapDirection; band: DelayBand }) {
  const [active, setActive] = useState<ActiveItem | null>(null);
  const stops = useMemo(() => new Map(direction.stops.map(stop => [stop.stop_key, stop])), [direction.stops]);
  useMapEvents({ click: () => setActive(null), zoomstart: () => setActive(null), dragstart: () => setActive(null) });
  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, []);
  const enter = (key: string, event: LeafletMouseEvent) => setActive({ key, position: event.latlng, pinned: false });
  const leave = () => setActive(current => current?.pinned ? current : null);
  const select = (key: string, event: LeafletMouseEvent) => setActive(current =>
    current?.key === key && current.pinned ? null : { key, position: event.latlng, pinned: true });

  return (
    <>
      {direction.segments.map(segment => {
        const key = JSON.stringify([segment.from_stop_key, segment.to_stop_key]);
        return (
          <DelayMapSegment
            key={key}
            segment={segment}
            band={band}
            from={stops.get(segment.from_stop_key)}
            to={stops.get(segment.to_stop_key)}
            position={active?.key === key ? active.position : undefined}
            onEnter={event => enter(key, event)}
            onLeave={leave}
            onSelect={event => select(key, event)}
          />
        );
      })}
      <Pane name="delay-map-stops" style={{ zIndex: 450 }}>
        {direction.stops.map(stop => {
          const key = `stop:${stop.stop_key}`;
          const center: [number, number] = [stop.latitude, stop.longitude];
          return (
            <Fragment key={key}>
              <CircleMarker center={center} radius={5} interactive={false} pathOptions={{ color: 'var(--app-surface)', weight: 2, fillColor: 'var(--app-accent)', fillOpacity: 1 }} />
              <CircleMarker
                center={center}
                radius={18}
                bubblingMouseEvents={false}
                className="delay-map-stop-hit"
                pathOptions={{ opacity: 0, fillOpacity: 0 }}
                eventHandlers={{ mouseover: event => enter(key, event), mouseout: leave, click: event => select(key, event) }}
              >
                {active?.key === key && (
                  <DelayMapTooltip position={active.position}>
                    {stop.stop_name}{stop.stop_desc ? ` (${stop.stop_desc})` : ''}
                  </DelayMapTooltip>
                )}
              </CircleMarker>
            </Fragment>
          );
        })}
      </Pane>
    </>
  );
}
