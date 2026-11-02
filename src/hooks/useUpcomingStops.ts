import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingStops } from '../api/client';
import { useI18n } from '../i18n-core';

const REFRESH_INTERVAL_MS = 15_000;

export function useUpcomingStops(tripId: string | null) {
  const { language } = useI18n();

  return useQuery({
    queryKey: ['upcomingStops', tripId, language],
    queryFn: () => fetchUpcomingStops(tripId!, language),
    enabled: !!tripId,
    refetchInterval: REFRESH_INTERVAL_MS,
    staleTime: REFRESH_INTERVAL_MS,
    retry: false,
  });
}
