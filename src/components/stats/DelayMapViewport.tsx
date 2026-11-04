import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { latLngBounds } from 'leaflet';
import type { DelayMapDirection } from '../../types/api';

export default function DelayMapViewport({ direction }: { direction: DelayMapDirection }) {
  const map = useMap();
  useEffect(() => {
    const bounds = latLngBounds(direction.segments.flatMap(segment => segment.points));
    direction.stops.forEach(stop => bounds.extend([stop.latitude, stop.longitude]));
    const fit = () => {
      map.invalidateSize({ pan: false });
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16, animate: false });
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map, direction]);

  return null;
}
