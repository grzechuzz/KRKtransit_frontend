import { CircleMarker, Pane, Tooltip } from 'react-leaflet';
import { useTripStops } from '../hooks/useTripStops';
import MapStopDot from './MapStopDot';

interface TripStopsProps {
  tripId: string;
}

export default function TripStops({ tripId }: TripStopsProps) {
  const { data } = useTripStops(tripId);

  if (!data?.stops.length) return null;

  return (
    <Pane name="trip-stops" style={{ zIndex: 450 }}>
      {data.stops.map((stop) => {
        if (stop.latitude == null || stop.longitude == null) return null;
        const stopNumber = stop.stop_desc?.trim();

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
              <Tooltip pane="tooltipPane" direction="top" offset={[0, -10]}>
                <span className="text-sm font-medium">{stop.stop_name}{stopNumber ? ` ${stopNumber}` : ''}</span>
              </Tooltip>
            </CircleMarker>
            {/* Visible dot */}
            <MapStopDot center={[stop.latitude, stop.longitude]} />
          </span>
        );
      })}
    </Pane>
  );
}
