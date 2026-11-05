export const DELAY_MAP_SCALE = [
  { key: 'green', max: 15, color: '#059669' },
  { key: 'yellow', max: 45, color: '#eab308' },
  { key: 'orange', max: 90, color: '#f97316' },
  { key: 'red', max: 180, color: '#e11d48' },
  { key: 'burgundy', max: Infinity, color: '#7c3aed' },
] as const;

export const NO_MEASUREMENTS_COLOR = '#94a3b8';

export function delayMapColor(mean: number | undefined): string {
  if (mean === undefined) return NO_MEASUREMENTS_COLOR;
  return DELAY_MAP_SCALE.find(item => mean <= item.max)?.color ?? NO_MEASUREMENTS_COLOR;
}
