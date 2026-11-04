import { describe, expect, it } from 'vitest';
import { formatCompactDelay, formatDelay, formatSignedDelay } from '../src/components/stats/delayFormat';
import { translations } from '../src/i18n-core';

describe('delay presentation', () => {
  it('preserves the sign of generated delay', () => {
    expect(formatSignedDelay(-149)).toBe('−2 min 29 sek');
    expect(formatSignedDelay(149)).toBe('+2 min 29 sek');
    expect(formatSignedDelay(0)).toBe('0 min');
  });

  it('formats long durations, rounding and English units', () => {
    expect(formatDelay(4256)).toBe('1 godz 10 min 56 sek');
    expect(formatDelay(59.6, 'en')).toBe('1 min');
    expect(formatDelay(0, 'en')).toBe('0 s');
    expect(formatCompactDelay(495)).toBe('8m 15s');
  });

  it.each(['pl', 'en'] as const)('does not repeat single-day ranges in %s', (language) => {
    const label = translations[language].stats.lineRange('304', '3 Nov 2026', '3 Nov 2026');
    expect(label.match(/3 Nov 2026/g)).toHaveLength(1);
    expect(translations[language].stats.lineRange('304', '2 Nov 2026', '3 Nov 2026')).toContain('2 Nov 2026 — 3 Nov 2026');
  });
});
