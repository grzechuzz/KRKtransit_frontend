import { useQuery } from '@tanstack/react-query';
import { fetchVehiclePositions } from '../api/client';

const POLLING_INTERVAL_MS = 2_000;

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: fetchVehiclePositions,
    refetchInterval: POLLING_INTERVAL_MS,
    staleTime: POLLING_INTERVAL_MS,
  });
}
