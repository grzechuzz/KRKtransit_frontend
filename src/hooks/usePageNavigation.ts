import { useSyncExternalStore } from 'react';
import type { Page } from '../types/pages';

function getPage(): Page {
  const path = window.location.hash.slice(1);

  switch (path) {
    case '/map': return 'map';
    case '/stats': return 'stats';
    case '/about':
    case '/info': return 'info';
    default: return 'home';
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function navigate(page: Page) {
  // Hash routes also work on static hosting without server-side rewrites.
  const path = page === 'home' ? '/' : page === 'info' ? '/about' : `/${page}`;
  window.location.hash = path;
}

export function usePageNavigation() {
  const page = useSyncExternalStore<Page>(subscribe, getPage, () => 'home');
  return { page, navigate };
}
