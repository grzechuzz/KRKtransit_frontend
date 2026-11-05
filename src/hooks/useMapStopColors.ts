import { useTheme } from '../theme-core';

const STOP_COLORS = {
  light: { color: '#1e40af', fillColor: '#ffffff' },
  dark: { color: '#ffffff', fillColor: '#3b82f6' },
} as const;

export function useMapStopColors() {
  const { theme } = useTheme();
  return STOP_COLORS[theme];
}
