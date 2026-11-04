export const DELAY_MAP_SCALE = [
  { key: 'green', max: 10, color: '#16a34a' },
  { key: 'yellow', max: 30, color: '#eab308' },
  { key: 'orange', max: 60, color: '#f97316' },
  { key: 'red', max: 120, color: '#dc2626' },
  { key: 'burgundy', max: Infinity, color: '#9f1239' },
] as const;

export const NO_MEASUREMENTS_COLOR = '#9ca3af';

export function delayMapColor(mean: number | undefined): string {
  if (mean === undefined) return NO_MEASUREMENTS_COLOR;
  return DELAY_MAP_SCALE.find(item => mean <= item.max)?.color ?? NO_MEASUREMENTS_COLOR;
}
