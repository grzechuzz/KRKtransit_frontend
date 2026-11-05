import { useSyncExternalStore } from 'react';
import type { Page } from '../types/pages';

const PATHS: Record<Page, string> = {
  home: '/',
  map: '/map',
  stats: '/stats',
  delayMap: '/delay-map',
  info: '/about',
};

const listeners = new Set<() => void>();

function getPage(): Page {
  switch (window.location.pathname.replace(/\/+$/, '')) {
    case '/map': return 'map';
    case '/stats': return 'stats';
    case '/delay-map': return 'delayMap';
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

export function replaceSearch(search: string) {
  window.history.replaceState(null, '', `${window.location.pathname}?${search}`);
  listeners.forEach((listener) => listener());
}

function navigate(page: Page, search = '') {
  window.history.pushState(null, '', PATHS[page] + (search ? `?${search}` : ''));
  // Notify form subscribers too, including navigation within the same page.
  window.dispatchEvent(new PopStateEvent('popstate'));
}

function getLocation() {
  return window.location.pathname + window.location.search;
}

export function usePageNavigation() {
  useSyncExternalStore(subscribe, getLocation, () => '/');
  return { page: getPage(), navigate };
}
