import { useState } from 'react';
import type { Page } from '../types/pages';

interface TopNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'map', label: 'MAPA LIVE' },
  { page: 'stats', label: 'STATYSTYKI' },
  { page: 'info', label: 'INFORMACJE' },
];

export default function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="relative z-[1100] shrink-0 bg-gray-950">
      <div className="flex h-14 items-center px-3 sm:h-16 sm:px-5">
        {/* Hamburger button - mobile only */}
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="mr-3 flex cursor-pointer items-center justify-center rounded-md p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white sm:hidden"
          aria-label="Menu"
        >
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            {mobileMenuOpen ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            ) : (
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            )}
          </svg>
        </button>

        {/* Brand — click goes to home */}
        <button
          onClick={() => handleNavigate('home')}
          className="absolute left-1/2 -translate-x-1/2 cursor-pointer sm:static sm:mr-8 sm:translate-x-0"
        >
          <span className="text-xl font-black uppercase tracking-wide text-white sm:text-2xl">
            KRK
            <span className="ml-1 font-light tracking-wider text-blue-400">TRANSIT</span>
          </span>
        </button>

        {/* Desktop navigation - skewed buttons */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map(({ page, label }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                className={`-skew-x-12 cursor-pointer rounded-sm w-40 py-2 text-center text-sm font-bold tracking-widest transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="inline-block skew-x-12">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/5 bg-gray-950 px-3 py-2 sm:hidden">
          {NAV_ITEMS.map(({ page, label }) => {
            const active = currentPage === page;
            return (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                className={`-skew-x-12 cursor-pointer rounded-sm w-full py-2.5 text-center text-sm font-bold tracking-widest transition-all ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="inline-block skew-x-12">{label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Bottom accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
    </header>
  );
}
