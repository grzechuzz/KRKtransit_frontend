import { useQuery } from '@tanstack/react-query';
import { fetchShape } from '../api/client';
import { useI18n } from '../i18n-core';

export function useShape(shapeId: string | null) {
  const { language } = useI18n();

  return useQuery({
    queryKey: ['shape', shapeId, language],
    queryFn: () => fetchShape(shapeId!, language),
    enabled: !!shapeId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
}
