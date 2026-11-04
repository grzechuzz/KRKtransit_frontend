import type { DelayMapResponse } from '../../src/types/api';

export function makeDelayMap(): DelayMapResponse {
  const stops = [
    { stop_key: 'a|01', stop_name: 'Przystanek A', stop_desc: '01', latitude: 50.03, longitude: 19.96 },
    { stop_key: 'b|02', stop_name: 'Przystanek B', stop_desc: '02', latitude: 50.04, longitude: 19.98 },
    { stop_key: 'c|', stop_name: 'Przystanek C', stop_desc: '', latitude: 50.05, longitude: 19.96 },
    { stop_key: 'd|04', stop_name: 'Przystanek D', stop_desc: '04', latitude: 50.06, longitude: 19.98 },
  ];
  return {
    line_number: '304', start_date: '2026-10-27', end_date: '2026-11-02',
    directions: [
      {
        headsign: 'Przystanek D', trips_count: 42, stops,
        segments: [
          { from_stop_key: 'a|01', to_stop_key: 'b|02', points: [[50.03, 19.96], [50.035, 19.97], [50.04, 19.98]], delays: [
            { band: 'ALL_DAY', samples: 10, mean_seconds: -10.5, median_seconds: -11, p90_seconds: 1.2 },
            { band: 'MORNING', samples: 10, mean_seconds: -10.5, median_seconds: -11, p90_seconds: 1.2 },
          ] },
          { from_stop_key: 'b|02', to_stop_key: 'c|', points: [[50.04, 19.98], [50.045, 19.97], [50.05, 19.96]], delays: [
            { band: 'ALL_DAY', samples: 5, mean_seconds: 20, median_seconds: 20, p90_seconds: 36 },
            { band: 'AFTERNOON', samples: 1, mean_seconds: 20, median_seconds: 20, p90_seconds: 20 },
            { band: 'EVENING_NIGHT', samples: 1, mean_seconds: 30, median_seconds: 30, p90_seconds: 30 },
            { band: 'MIDDAY', samples: 1, mean_seconds: 10, median_seconds: 10, p90_seconds: 10 },
            { band: 'MORNING', samples: 1, mean_seconds: 0, median_seconds: 0, p90_seconds: 0 },
            { band: 'WEEKEND', samples: 1, mean_seconds: 40, median_seconds: 40, p90_seconds: 40 },
          ] },
          { from_stop_key: 'c|', to_stop_key: 'd|04', points: [[50.05, 19.96], [50.055, 19.97], [50.06, 19.98]], delays: [] },
        ],
      },
      {
        headsign: 'Przystanek D', trips_count: 20, stops: [...stops].reverse(),
        segments: [{ from_stop_key: 'd|04', to_stop_key: 'c|', points: [[50.06, 19.98], [50.07, 20.01], [50.05, 19.96]], delays: [] }],
      },
      {
        headsign: '', trips_count: 1, stops: [stops[0]],
        segments: [{ from_stop_key: 'a|01', to_stop_key: 'a|01', points: [[50.03, 19.96], [50.03, 19.96]], delays: [] }],
      },
    ],
  };
}
