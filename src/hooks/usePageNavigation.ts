import { useSyncExternalStore } from 'react';
import type { Page } from '../types/pages';

const PATHS: Record<Page, string> = {
  home: '/',
  map: '/map',
  stats: '/stats',
  info: '/about',
};

const listeners = new Set<() => void>();

function getPage(): Page {
  switch (window.location.pathname.replace(/\/+$/, '')) {
    case '/map': return 'map';
    case '/stats': return 'stats';
    case '/about':
    case '/info': return 'info';
    default: return 'home';
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('popstate', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('popstate', onChange);
  };
}

function navigate(page: Page) {
  window.history.pushState(null, '', PATHS[page]);
  listeners.forEach((listener) => listener());
}

export function usePageNavigation() {
  const page = useSyncExternalStore<Page>(subscribe, getPage, () => 'home');
  return { page, navigate };
}
