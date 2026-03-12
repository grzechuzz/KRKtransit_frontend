import { useQuery } from '@tanstack/react-query';
import { fetchTripStops } from '../api/client';

export function useTripStops(tripId: string | null) {
  return useQuery({
    queryKey: ['tripStops', tripId],
    queryFn: () => fetchTripStops(tripId!),
    enabled: !!tripId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
}
