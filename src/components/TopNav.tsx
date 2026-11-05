import { useState } from 'react';
import type { Page } from '../types/pages';
import { useI18n, type Language } from '../i18n-core';
import { useTheme } from '../theme-core';
import { isValidStatsQuery, localDateStr, readStatsUrl, serializeStatsQuery } from '../utils/lineStatsSearch';

interface TopNavProps {
  currentPage: Page;
  onNavigate: (page: Page, search?: string) => void;
  mobileMenuOpen: boolean;
  onMobileMenuChange: (open: boolean) => void;
}

export default function TopNav({ currentPage, onNavigate, mobileMenuOpen, onMobileMenuChange }: TopNavProps) {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const { language, setLanguage, t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const themeLabel = theme === 'dark' ? t.theme.switchToLight : t.theme.switchToDark;

  const navItems: { page: Page; label: string }[] = [
    { page: 'map', label: t.nav.map },
    { page: 'stats', label: t.nav.stats },
    { page: 'delayMap', label: t.nav.delayMap },
    { page: 'info', label: t.nav.info },
  ];

  const handleNavigate = (page: Page) => {
    const query = currentPage === 'stats' && page === 'delayMap' ? readStatsUrl(localDateStr(new Date())) : null;
    onNavigate(page, query && isValidStatsQuery(query) ? serializeStatsQuery(query) : undefined);
    onMobileMenuChange(false);
    setLanguageMenuOpen(false);
  };

  const languageOptions: { language: Language; label: string; ariaLabel: string }[] = [
    { language: 'pl', label: t.language.polish, ariaLabel: t.language.switchToPolish },
    { language: 'en', label: t.language.english, ariaLabel: t.language.switchToEnglish },
  ];

  return (
    <header className="relative z-[1100] shrink-0 bg-canvas">
      <div className="flex h-14 items-center px-3 sm:h-16 sm:px-5">
        {/* Hamburger button - mobile only */}
        <button
          onClick={() => {
            setLanguageMenuOpen(false);
            onMobileMenuChange(!mobileMenuOpen);
          }}
          className="mr-2 flex h-11 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink transition-colors hover:bg-overlay/5 min-[1100px]:hidden"
          aria-label="Menu"
          aria-expanded={mobileMenuOpen}
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
          className="min-w-0 flex-1 cursor-pointer text-left min-[1100px]:mr-5 min-[1100px]:flex-none"
        >
          <span className="whitespace-nowrap text-base font-black uppercase tracking-wide text-ink min-[380px]:text-xl lg:text-2xl">
            KRK
            <span className="ml-1 font-light tracking-wider text-accent">TRANSIT</span>
          </span>
        </button>

        {/* Desktop navigation - skewed buttons */}
        <nav className="hidden items-center gap-1 min-[1100px]:flex">
          {navItems.map(({ page, label }) => {
            const active = currentPage === page;
            return (
              <button
                aria-current={active ? 'page' : undefined}
                key={page}
                onClick={() => handleNavigate(page)}
                className={`w-40 -skew-x-12 cursor-pointer rounded-sm py-2 text-center text-sm font-bold tracking-widest transition-colors ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-overlay/5 text-ink hover:bg-overlay/10'
                }`}
              >
                <span className="inline-block skew-x-12">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 pl-2 sm:gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={themeLabel}
            title={themeLabel}
            className="flex h-11 w-10 touch-manipulation cursor-pointer items-center justify-center rounded-xl border border-overlay/10 bg-surface text-accent transition-colors hover:bg-raised sm:w-11"
          >
            {theme === 'dark' ? (
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.1 3.3a9 9 0 1 0 11.6 11.6 9 9 0 0 1-11.6-11.6Z" />
              </svg>
            )}
          </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              onMobileMenuChange(false);
              setLanguageMenuOpen((prev) => !prev);
            }}
            aria-label={language === 'pl' ? t.language.switchToEnglish : t.language.switchToPolish}
            aria-expanded={languageMenuOpen}
            className={`flex h-11 w-10 cursor-pointer items-center justify-center rounded-xl border bg-surface/90 ring-1 ring-overlay/5 transition-colors hover:bg-raised sm:w-11 ${
              languageMenuOpen
                ? 'border-blue-400 shadow-blue-500/15'
                : 'border-blue-500/25'
            }`}
          >
            <FlagIcon language={language} />
          </button>

          {languageMenuOpen && (
            <div className="absolute right-0 top-full z-[1200] mt-2 flex flex-col gap-1 rounded-xl border border-blue-500/25 bg-surface/95 p-1 shadow-panel shadow-blue-950/40 ring-1 ring-overlay/10 backdrop-blur-sm">
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
                    className={`flex h-9 w-11 cursor-pointer items-center justify-center rounded-lg transition-colors sm:h-10 sm:w-12 ${
                      active
                        ? 'bg-blue-600/20 ring-2 ring-blue-400'
                        : 'opacity-65 hover:bg-overlay/10 hover:opacity-100'
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
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <nav className="flex flex-col gap-1 border-t border-overlay/5 bg-canvas px-3 py-2 min-[1100px]:hidden">
          {navItems.map(({ page, label }) => {
            const active = currentPage === page;
            return (
              <button
                aria-current={active ? 'page' : undefined}
                key={page}
                onClick={() => handleNavigate(page)}
                className={`w-full -skew-x-12 cursor-pointer rounded-sm py-2.5 text-center text-sm font-bold tracking-widest transition-colors ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-overlay/5 text-ink hover:bg-overlay/10'
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
