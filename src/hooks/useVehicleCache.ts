import { useRef, useMemo } from 'react';
import { useVehicles } from './useVehicles';
import type { Vehicle } from '../types/api';

const STALE_THRESHOLD_MS = 5 * 60 * 1000;

export function useVehicleCache() {
  const { data, isLoading, error } = useVehicles();
  const cacheRef = useRef<Map<string, Vehicle>>(new Map());

  const vehicles = useMemo(() => {
    const now = Date.now();
    const cache = cacheRef.current;

    if (data?.vehicles) {
      for (const vehicle of data.vehicles) {
        cache.set(vehicle.trip_id, vehicle);
      }
    }

    const result: Vehicle[] = [];
    for (const [tripId, vehicle] of cache) {
      const age = now - new Date(vehicle.timestamp).getTime();
      if (age > STALE_THRESHOLD_MS) {
        cache.delete(tripId);
      } else {
        result.push(vehicle);
      }
    }

    return result;
  }, [data]);

  return { vehicles, isLoading, error };
}
