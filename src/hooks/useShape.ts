import { useQuery } from '@tanstack/react-query';
import { fetchShape } from '../api/client';

export function useShape(shapeId: string | null) {
  return useQuery({
    queryKey: ['shape', shapeId],
    queryFn: () => fetchShape(shapeId!),
    enabled: !!shapeId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
}
