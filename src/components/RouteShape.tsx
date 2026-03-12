import { Polyline } from 'react-leaflet';
import { useShape } from '../hooks/useShape';
import type { LatLngExpression } from 'leaflet';

interface RouteShapeProps {
  shapeId: string | null;
}

export default function RouteShape({ shapeId }: RouteShapeProps) {
  const { data } = useShape(shapeId);

  if (!data?.points.length) return null;

  const positions: LatLngExpression[] = data.points
    .sort((a, b) => a.sequence - b.sequence)
    .map((p) => [p.latitude, p.longitude]);

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: '8 4',
      }}
    />
  );
}
