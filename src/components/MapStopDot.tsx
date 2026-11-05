import { CircleMarker } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useMapStopColors } from '../hooks/useMapStopColors';

export default function MapStopDot({ center, className, radius = 6 }: { center: LatLngExpression; className?: string; radius?: number }) {
  const colors = useMapStopColors();

  return (
    <CircleMarker center={center} radius={radius} interactive={false} className={className}
      pathOptions={{ ...colors, weight: 2, fillOpacity: 1 }} />
  );
}
