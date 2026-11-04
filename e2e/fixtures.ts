import { test as base, expect } from '@playwright/test';
import type { Vehicle, UpcomingStopsResponse, MaxDelayEntry, RouteDelayEntry } from '../src/types/api';
import { makeDelayMap } from '../tests/fixtures/delayMap';

const vehicles: Vehicle[] = [
  { trip_id: 'trip-304', license_plate: 'TEST304', line_number: '304', headsign: 'Wieliczka Kampus', shape_id: 'shape-304', latitude: 50.0647, longitude: 19.945, bearing: 90, timestamp: '' },
  { trip_id: 'trip-139', license_plate: 'TEST139', line_number: '139', headsign: 'Pradnik Czerwony', shape_id: null, latitude: 50.075, longitude: 19.925, bearing: null, timestamp: '' },
];

const stops: UpcomingStopsResponse['stops'] = [
  { stop_id: 's1', stop_name: 'Prokocim Szpitale Uniwersyteckie', stop_desc: '05', sequence: 2, scheduled_arrival: '2026-11-04T00:10:00Z', predicted_arrival: '2026-11-04T00:12:00Z' },
  { stop_id: 's2', stop_name: 'Jerzmanowskiego', stop_desc: '01', sequence: 3, scheduled_arrival: '2026-11-04T00:15:00Z', predicted_arrival: null },
];

export const segment: MaxDelayEntry = {
  trip_id: 'night-trip', line_number: '304', vehicle_number: 'TEST304',
  from_stop: 'Pędzichów', to_stop: 'Nowy Kleparz', from_sequence: 2, to_sequence: 3,
  from_planned_time: '2026-11-03T23:02:00Z', to_planned_time: '2026-11-03T23:04:00Z',
  from_event_time: '2026-11-03T23:05:00Z', to_event_time: '2026-11-03T23:09:00Z',
  delay_generated_seconds: 149, headsign: 'Kliny', service_date: '2026-11-03', is_estimated: false,
};

const route: RouteDelayEntry = {
  trip_id: segment.trip_id, line_number: '304', vehicle_number: 'TEST304',
  first_stop: segment.from_stop, last_stop: segment.to_stop,
  first_planned_time: segment.from_planned_time, first_event_time: segment.from_event_time,
  last_planned_time: segment.to_planned_time, last_event_time: segment.to_event_time,
  start_delay_seconds: 180, end_delay_seconds: 329, delay_generated_seconds: 149,
  headsign: 'Kliny', service_date: segment.service_date, is_estimated: false,
};

export const test = base.extend<{ apiRequests: string[] }>({
  apiRequests: [async ({ page }, provide) => {
    const requests: string[] = [];
    const pageErrors: string[] = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.route('https://tile.openstreetmap.org/**', r => r.abort());
    await page.route('**/v1/**', async r => {
      const url = new URL(r.request().url());
      requests.push(url.pathname + url.search);
      let body: unknown;
      let status = 200;
      if (url.pathname.endsWith('/vehicles/positions')) {
        body = { count: vehicles.length, vehicles: vehicles.map(v => ({ ...v, timestamp: new Date().toISOString() })) };
      } else if (url.pathname.includes('/shapes/')) {
        body = { shape_id: 'shape-304', points: [{ latitude: 50.0647, longitude: 19.945, sequence: 1 }, { latitude: 50.07, longitude: 19.95, sequence: 2 }] };
      } else if (url.pathname.endsWith('/upcoming-stops')) {
        body = { trip_id: url.pathname.split('/')[3], status: 'IN_PROGRESS', observed_at: new Date().toISOString(), stops };
      } else if (url.pathname.endsWith('/stops')) {
        body = { trip_id: url.pathname.split('/')[3], stops: stops.map(s => ({ ...s, latitude: 50.07, longitude: 19.95 })) };
      } else if (url.pathname.includes('/lines/999/')) {
        status = 404;
        body = { error_code: 'RESOURCE_NOT_FOUND', message: "Line '999' not found" };
      } else if (url.pathname.includes('/stats/')) {
        const common = { line_number: '304', start_date: url.searchParams.get('start_date'), end_date: url.searchParams.get('end_date') };
        if (url.pathname.endsWith('/punctuality')) body = { ...common, total_stops: 100, on_time_count: 60, on_time_percent: 60, slightly_delayed_count: 25, slightly_delayed_percent: 25, delayed_count: 15, delayed_percent: 15 };
        else if (url.pathname.endsWith('/max-delay')) body = { ...common, max_delay: [segment], trips_analyzed: 10 };
        else if (url.pathname.endsWith('/route-delay')) body = { ...common, max_route_delay: [route], trips_analyzed: 10 };
        else if (url.pathname.endsWith('/trend')) body = { ...common, days: [{ date: '2026-11-02', avg_delay_seconds: 149, trips_count: 6 }, { date: '2026-11-03', avg_delay_seconds: 210, trips_count: 4 }] };
        else if (url.pathname.endsWith('/delay-map')) body = { ...makeDelayMap(), ...common };
      }
      if (body === undefined) throw new Error(`Unexpected API request: ${url.pathname}`);
      await r.fulfill({ status, json: body, headers: { 'access-control-allow-origin': '*' } });
    });
    await provide(requests);
    expect(pageErrors).toEqual([]);
  }, { auto: true }],
});

export { expect };
