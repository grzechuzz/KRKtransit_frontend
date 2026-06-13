import { useVehicles } from './useVehicles';

export function useVehicleCache() {
  const { data, isLoading, error } = useVehicles();
  const vehicles = data?.vehicles ?? [];

  return { vehicles, isLoading, error };
}
