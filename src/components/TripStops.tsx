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
          <span key={`${stop.stop_id}-${stop.sequence}`}>
            {/* Invisible larger hit area for easier tapping */}
            <CircleMarker
              center={[stop.latitude, stop.longitude]}
              radius={18}
              pathOptions={{
                fillOpacity: 0,
                opacity: 0,
                weight: 0,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]}>
                <span className="text-sm font-medium">{stop.stop_name}</span>
              </Tooltip>
            </CircleMarker>
            {/* Visible dot */}
            <CircleMarker
              center={[stop.latitude, stop.longitude]}
              radius={6}
              interactive={false}
              pathOptions={{
                color: '#ffffff',
                weight: 2,
                fillColor: '#3b82f6',
                fillOpacity: 1,
              }}
            />
          </span>
        );
      })}
    </>
  );
}
