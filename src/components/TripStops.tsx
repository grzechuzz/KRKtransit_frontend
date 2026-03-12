import { CircleMarker, Tooltip } from 'react-leaflet';
import { useTripStops } from '../hooks/useTripStops';

interface TripStopsProps {
  tripId: string;
}

export default function TripStops({ tripId }: TripStopsProps) {
  const { data } = useTripStops(tripId);

  if (!data?.stops.length) return null;

  return (
    <>
      {data.stops.map((stop) => {
        if (stop.latitude == null || stop.longitude == null) return null;

        return (
          <CircleMarker
            key={`${stop.stop_id}-${stop.sequence}`}
            center={[stop.latitude, stop.longitude]}
            radius={6}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: '#3b82f6',
              fillOpacity: 1,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              <span className="text-sm font-medium">{stop.stop_name}</span>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
