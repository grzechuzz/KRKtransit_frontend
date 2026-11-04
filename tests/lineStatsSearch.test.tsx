import { act, renderHook } from '@testing-library/react';
import type { FormEvent } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useLineStatsSearch } from '../src/hooks/useLineStatsSearch';
import { delayMapHref, isValidStatsQuery, readStatsUrl, serializeStatsQuery } from '../src/utils/lineStatsSearch';

describe('shared line search', () => {
  it('round-trips the submitted context and preserves the existing estimated convention', () => {
    const query = { line: '304', start: '2026-10-28', end: '2026-11-04', estimated: true };
    const search = serializeStatsQuery(query);
    expect(readStatsUrl('2026-11-04', search)).toEqual(query);
    expect(delayMapHref(query)).toBe('/delay-map?line=304&from=2026-10-28&to=2026-11-04&estimated=1');
    expect(serializeStatsQuery({ ...query, estimated: false })).not.toContain('estimated');
    expect(delayMapHref(null)).toBe('/delay-map');
  });

  it('validates dates, clamps limits and defaults to seven local calendar days', () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date(2026, 10, 4, 12));
      expect(readStatsUrl('2026-11-04', '')).toEqual({ line: '', start: '2026-10-29', end: '2026-11-04', estimated: false });
      const invalid = readStatsUrl('2026-11-04', 'from=2026-02-30&to=bad');
      expect(invalid.start).toBe('2026-10-29');
      expect(invalid.end).toBe('2026-11-04');
      const clamped = readStatsUrl('2026-11-04', 'from=2025-01-01&to=2027-01-01');
      expect(clamped.start).toBe('2026-03-12');
      expect(clamped.end).toBe('2026-11-04');
    } finally { vi.useRealTimers(); }
  });

  it('rejects invalid lines and inverted date ranges', () => {
    const query = { line: '304', start: '2026-11-01', end: '2026-11-04', estimated: false };
    expect(isValidStatsQuery(query)).toBe(true);
    expect(isValidStatsQuery({ ...query, line: '@@' })).toBe(false);
    expect(isValidStatsQuery({ ...query, start: '2026-11-05' })).toBe(false);
  });

  it('keeps unsubmitted edits separate and restores search-only history changes', () => {
    window.history.replaceState(null, '', '/stats?line=304&from=2026-03-12&to=2026-03-13');
    const { result } = renderHook(useLineStatsSearch);
    act(() => result.current.setLine('139'));
    expect(result.current.draft.line).toBe('139');
    expect(result.current.query?.line).toBe('304');
    act(() => {
      window.history.replaceState(null, '', '/stats?line=194&from=2026-03-14&to=2026-03-15&estimated=1');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.draft.line).toBe('194');
    expect(result.current.query).toEqual(result.current.draft);
    expect(result.current.query?.estimated).toBe(true);
  });

  it('submits trimmed values to the URL and tracks repeated searches', () => {
    const { result } = renderHook(useLineStatsSearch);
    act(() => result.current.setLine(' 304 '));
    const event = { preventDefault: vi.fn(), currentTarget: { reportValidity: () => true } } as unknown as FormEvent<HTMLFormElement>;
    act(() => result.current.handleSubmit(event));
    expect(result.current.query?.line).toBe('304');
    expect(new URLSearchParams(window.location.search).get('line')).toBe('304');
    act(() => result.current.handleSubmit(event));
    expect(result.current.version).toBe(2);
  });
});
