export interface Vehicle {
  trip_id: string;
  license_plate: string;
  line_number: string;
  headsign: string;
  shape_id: string | null;
  latitude: number;
  longitude: number;
  bearing: number | null;
  timestamp: string;
}

export interface LiveVehicleResponse {
  count: number;
  vehicles: Vehicle[];
}

export interface ShapePoint {
  latitude: number;
  longitude: number;
  sequence: number;
}

export interface ShapeResponse {
  shape_id: string;
  points: ShapePoint[];
}

export interface TripStop {
  stop_id: string;
  stop_name: string;
  stop_desc: string | null;
  latitude: number | null;
  longitude: number | null;
  sequence: number;
}

export interface TripStopsResponse {
  trip_id: string;
  stops: TripStop[];
}

export interface PunctualityResponse {
  line_number: string;
  start_date: string;
  end_date: string;
  total_stops: number;
  on_time_count: number;
  on_time_percent: number;
  slightly_delayed_count: number;
  slightly_delayed_percent: number;
  delayed_count: number;
  delayed_percent: number;
}

export interface MaxDelayEntry {
  trip_id: string;
  line_number: string;
  vehicle_number: string;
  from_stop: string;
  to_stop: string;
  from_sequence: number;
  to_sequence: number;
  from_planned_time: string;
  from_event_time: string;
  to_planned_time: string;
  to_event_time: string;
  delay_generated_seconds: number;
  headsign: string;
  service_date: string;
  is_estimated: boolean;
}

export interface MaxDelayResponse {
  line_number: string;
  start_date: string;
  end_date: string;
  max_delay: MaxDelayEntry[];
  trips_analyzed: number;
}

export interface RouteDelayEntry {
  trip_id: string;
  line_number: string;
  vehicle_number: string;
  first_stop: string;
  last_stop: string;
  first_planned_time: string;
  first_event_time: string;
  last_planned_time: string;
  last_event_time: string;
  start_delay_seconds: number;
  end_delay_seconds: number;
  delay_generated_seconds: number;
  headsign: string;
  service_date: string;
  is_estimated: boolean;
}

export interface RouteDelayResponse {
  line_number: string;
  start_date: string;
  end_date: string;
  max_route_delay: RouteDelayEntry[];
  trips_analyzed: number;
}

export interface TrendDay {
  date: string;
  avg_delay_seconds: number;
  trips_count: number;
}

export interface TrendResponse {
  line_number: string;
  start_date: string;
  end_date: string;
  days: TrendDay[];
}
