import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePageNavigation } from '../src/hooks/usePageNavigation';

describe('page navigation', () => {
  it.each([
    ['/', 'home'], ['/map/', 'map'], ['/stats', 'stats'],
    ['/about', 'info'], ['/info', 'info'], ['/unknown', 'home'],
  ])('opens %s directly', (path, expected) => {
    window.history.replaceState(null, '', path);
    const { result } = renderHook(usePageNavigation);
    expect(result.current.page).toBe(expected);
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
