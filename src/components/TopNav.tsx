import { useState } from 'react';
import type { Page } from '../types/pages';
import { useI18n, type Language } from '../i18n-core';

interface TopNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

export default function TopNav({ currentPage, onNavigate }: TopNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();

  const navItems: { page: Page; label: string }[] = [
    { page: 'map', label: t.nav.map },
    { page: 'stats', label: t.nav.stats },
    { page: 'info', label: t.nav.info },
  ];

  const handleNavigate = (page: Page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    setLanguageMenuOpen(false);
  };

  const languageOptions: { language: Language; label: string; ariaLabel: string }[] = [
    { language: 'pl', label: t.language.polish, ariaLabel: t.language.switchToPolish },
    { language: 'en', label: t.language.english, ariaLabel: t.language.switchToEnglish },
  ];

  return (
    <header className="relative z-[1100] shrink-0 bg-gray-950">
      <div className="flex h-14 items-center px-3 sm:h-16 sm:px-5">
        {/* Hamburger button - mobile only */}
        <button
          onClick={() => {
            setLanguageMenuOpen(false);
            setMobileMenuOpen((prev) => !prev);
          }}
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
          {navItems.map(({ page, label }) => {
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

        <div className="relative ml-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setLanguageMenuOpen((prev) => !prev);
            }}
            aria-label={language === 'pl' ? t.language.switchToEnglish : t.language.switchToPolish}
            aria-expanded={languageMenuOpen}
            className={`flex h-9 w-11 cursor-pointer items-center justify-center rounded-xl border bg-gray-900/90 shadow-lg shadow-blue-950/30 ring-1 ring-white/5 transition hover:bg-white/10 sm:h-10 sm:w-12 ${
              languageMenuOpen
                ? 'border-blue-400 shadow-blue-500/15'
                : 'border-blue-500/25'
            }`}
          >
            <FlagIcon language={language} />
          </button>

          {languageMenuOpen && (
            <div className="absolute right-0 top-full z-[1200] mt-2 flex flex-col gap-1 rounded-xl border border-blue-500/25 bg-gray-900/95 p-1 shadow-2xl shadow-blue-950/40 ring-1 ring-white/10 backdrop-blur-sm">
              {languageOptions.map((option) => {
                const active = language === option.language;
                return (
                  <button
                    key={option.language}
                    type="button"
                    onClick={() => {
                      setLanguage(option.language);
                      setLanguageMenuOpen(false);
                    }}
                    aria-label={option.ariaLabel}
                    aria-pressed={active}
                    title={option.label}
                    className={`flex h-9 w-11 cursor-pointer items-center justify-center rounded-lg transition sm:h-10 sm:w-12 ${
                      active
                        ? 'bg-blue-600/20 ring-2 ring-blue-400'
                        : 'opacity-65 hover:bg-white/10 hover:opacity-100'
                    }`}
                  >
                    <FlagIcon language={option.language} />
                    <span className="sr-only">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-white/5 bg-gray-950 px-3 py-2 sm:hidden">
          {navItems.map(({ page, label }) => {
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

function FlagIcon({ language }: { language: Language }) {
  return (
    <span className="block h-5 w-7 overflow-hidden rounded-[3px] bg-white shadow-sm ring-1 ring-black/40" aria-hidden="true">
      {language === 'pl' ? (
        <svg viewBox="0 0 28 20" className="h-full w-full" role="img">
          <rect width="28" height="10" fill="#fff" />
          <rect y="10" width="28" height="10" fill="#dc143c" />
        </svg>
      ) : (
        <svg viewBox="0 0 60 40" className="h-full w-full" role="img">
          <rect width="60" height="40" fill="#012169" />
          <path d="M0 0l60 40M60 0L0 40" stroke="#fff" strokeWidth="8" />
          <path d="M0 0l60 40M60 0L0 40" stroke="#c8102e" strokeWidth="4" />
          <path d="M30 0v40M0 20h60" stroke="#fff" strokeWidth="13" />
          <path d="M30 0v40M0 20h60" stroke="#c8102e" strokeWidth="8" />
        </svg>
      )}
    </span>
  );
}
