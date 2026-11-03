import type { MaxDelayResponse } from '../../types/api';
import DelayResults from './DelayResults';

export default function MaxDelayTable({ data }: { data: MaxDelayResponse }) {
  return (
    <DelayResults
      kind="segment"
      tripsAnalyzed={data.trips_analyzed}
      rows={data.max_delay.map((entry) => ({
        id: entry.trip_id + '-' + entry.from_sequence,
        fromStop: entry.from_stop,
        toStop: entry.to_stop,
        direction: entry.headsign,
        vehicleNumber: entry.vehicle_number,
        serviceDate: entry.service_date,
        fromPlannedTime: entry.from_planned_time,
        toPlannedTime: entry.to_planned_time,
        fromEventTime: entry.from_event_time,
        toEventTime: entry.to_event_time,
        delaySeconds: entry.delay_generated_seconds,
        estimated: entry.is_estimated,
      }))}
    />
  );
}
