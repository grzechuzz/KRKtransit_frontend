import { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext, type Theme } from './theme-core';

function readStoredTheme(): Theme {
  try {
    return window.localStorage.getItem('krk-transit-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const toggleTheme = useCallback(() => {
    setTheme((current) => current === 'dark' ? 'light' : 'dark');
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', theme === 'light' ? '#f3f6fb' : '#030712',
    );
    try {
      window.localStorage.setItem('krk-transit-theme', theme);
    } catch {
      // The switch still works when browser storage is unavailable.
    }
  }, [theme]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
