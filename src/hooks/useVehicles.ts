import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchVehiclePositions } from '../api/client';
import { useI18n, type Language } from '../i18n-core';
import type { LiveVehicleResponse, Vehicle } from '../types/api';

const POLLING_INTERVAL_MS = 3_000;
const STALE_THRESHOLD_MS = 5 * 60 * 1000;

const vehicleCache = new Map<string, Vehicle>();

async function fetchCachedVehiclePositions(language: Language): Promise<LiveVehicleResponse> {
  const data = await fetchVehiclePositions(language);
  const now = Date.now();

  for (const vehicle of data.vehicles) {
    vehicleCache.set(vehicle.license_plate, vehicle);
  }

  const vehicles: Vehicle[] = [];
  for (const [licensePlate, vehicle] of vehicleCache) {
    const age = now - new Date(vehicle.timestamp).getTime();
    if (age > STALE_THRESHOLD_MS) {
      vehicleCache.delete(licensePlate);
    } else {
      vehicles.push(vehicle);
    }
  }

  return {
    count: vehicles.length,
    vehicles,
  };
}

export function useVehicles() {
  const { language } = useI18n();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    // Expire displayed positions even when polling fails or is paused offline.
    const interval = window.setInterval(() => setNow(Date.now()), POLLING_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, []);

  return useQuery({
    queryKey: ['vehicles', language],
    queryFn: () => fetchCachedVehiclePositions(language),
    refetchInterval: POLLING_INTERVAL_MS,
    staleTime: POLLING_INTERVAL_MS,
    select: (data) => {
      const vehicles = data.vehicles.filter((vehicle) =>
        now - new Date(vehicle.timestamp).getTime() <= STALE_THRESHOLD_MS);
      return { count: vehicles.length, vehicles };
    },
  });
}
