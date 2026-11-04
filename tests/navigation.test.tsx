import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePageNavigation } from '../src/hooks/usePageNavigation';

describe('page navigation', () => {
  it.each([
    ['/', 'home'], ['/map/', 'map'], ['/stats', 'stats'],
    ['/delay-map', 'delayMap'], ['/delay-map/?line=304', 'delayMap'],
    ['/about', 'info'], ['/info', 'info'], ['/unknown', 'home'],
  ])('opens %s directly', (path, expected) => {
    window.history.replaceState(null, '', path);
    const { result } = renderHook(usePageNavigation);
    expect(result.current.page).toBe(expected);
  });

  it('navigates with search parameters', () => {
    const { result } = renderHook(usePageNavigation);
    act(() => result.current.navigate('delayMap', 'line=304&from=2026-10-28&to=2026-11-04&estimated=1'));
    expect(window.location.pathname).toBe('/delay-map');
    expect(new URLSearchParams(window.location.search).get('estimated')).toBe('1');
    expect(result.current.page).toBe('delayMap');
  });

  it('updates the URL and responds to browser history changes', () => {
    const { result } = renderHook(usePageNavigation);
    act(() => result.current.navigate('stats'));
    expect(window.location.pathname).toBe('/stats');
    expect(result.current.page).toBe('stats');
    act(() => {
      window.history.replaceState(null, '', '/map');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(result.current.page).toBe('map');
  });
});
