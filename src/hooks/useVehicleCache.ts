import { useVehicles } from './useVehicles';

export function useVehicleCache() {
  const { data, isLoading, error, fetchStatus } = useVehicles();
  const vehicles = data?.vehicles ?? [];

  return { vehicles, isLoading, error, isPaused: fetchStatus === 'paused' };
}
