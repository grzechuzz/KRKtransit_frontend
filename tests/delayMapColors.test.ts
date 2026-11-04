import { describe, expect, it } from 'vitest';
import { delayMapColor, NO_MEASUREMENTS_COLOR } from '../src/components/stats/delayMapColors';

describe('delay growth colors', () => {
  it.each([
    [-180, '#16a34a'], [0, '#16a34a'], [10, '#16a34a'],
    [10.1, '#eab308'], [30, '#eab308'], [30.1, '#f97316'],
    [60, '#f97316'], [60.1, '#dc2626'], [120, '#dc2626'], [120.1, '#9f1239'],
  ])('colors an average of %s seconds as %s', (mean, color) => {
    expect(delayMapColor(mean)).toBe(color);
  });

  it('distinguishes missing measurements from a measured zero', () => {
    expect(delayMapColor(undefined)).toBe(NO_MEASUREMENTS_COLOR);
    expect(delayMapColor(0)).not.toBe(NO_MEASUREMENTS_COLOR);
  });
});
