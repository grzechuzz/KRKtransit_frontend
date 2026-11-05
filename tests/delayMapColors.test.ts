import { describe, expect, it } from 'vitest';
import { delayMapColor, NO_MEASUREMENTS_COLOR } from '../src/components/stats/delayMapColors';

describe('delay growth colors', () => {
  it.each([
    [-180, '#059669'], [0, '#059669'], [15, '#059669'],
    [15.1, '#eab308'], [45, '#eab308'], [45.1, '#f97316'],
    [90, '#f97316'], [90.1, '#e11d48'], [180, '#e11d48'], [180.1, '#7c3aed'],
  ])('colors an average of %s seconds as %s', (mean, color) => {
    expect(delayMapColor(mean)).toBe(color);
  });

  it('distinguishes missing measurements from a measured zero', () => {
    expect(delayMapColor(undefined)).toBe(NO_MEASUREMENTS_COLOR);
    expect(delayMapColor(0)).not.toBe(NO_MEASUREMENTS_COLOR);
  });
});
