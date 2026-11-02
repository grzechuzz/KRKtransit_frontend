import type { RouteDelayResponse } from '../../types/api';
import DelayResults from './DelayResults';

export default function RouteDelayTable({ data }: { data: RouteDelayResponse }) {
  return (
    <DelayResults
      kind="route"
      tripsAnalyzed={data.trips_analyzed}
      rows={data.max_route_delay.map((entry) => ({
        id: entry.trip_id + '-' + entry.service_date,
        fromStop: entry.first_stop,
        toStop: entry.last_stop,
        direction: entry.headsign,
        vehicleNumber: entry.vehicle_number,
        serviceDate: entry.service_date,
        fromPlannedTime: entry.first_planned_time,
        toPlannedTime: entry.last_planned_time,
        fromEventTime: entry.first_event_time,
        toEventTime: entry.last_event_time,
        delaySeconds: entry.delay_generated_seconds,
        estimated: entry.is_estimated,
      }))}
    />
  );
}
