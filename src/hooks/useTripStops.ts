import { useQuery } from '@tanstack/react-query';
import { fetchTripStops } from '../api/client';
import { useI18n } from '../i18n-core';

export function useTripStops(tripId: string | null) {
  const { language } = useI18n();

  return useQuery({
    queryKey: ['tripStops', tripId, language],
    queryFn: () => fetchTripStops(tripId!, language),
    enabled: !!tripId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
}
