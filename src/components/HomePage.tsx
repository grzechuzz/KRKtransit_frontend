import type { Page } from '../types/pages';
import { useI18n } from '../i18n-core';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { t } = useI18n();

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto px-4">
      <div className="w-full max-w-2xl py-12 text-center">
        {/* Brand */}
        <h1 className="mb-2 text-5xl font-black uppercase tracking-wide text-white sm:text-7xl">
          KRK
          <span className="ml-2 font-light tracking-wider text-blue-400">TRANSIT</span>
        </h1>

        {/* Accent line */}
        <div className="mx-auto mb-10 h-1 w-24 -skew-x-12 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40 sm:w-32" />

        {/* Description */}
        <p className="mx-auto mb-12 max-w-lg text-lg leading-relaxed text-gray-300 sm:text-xl">
          {t.home.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={() => onNavigate('map')}
            className="group relative -skew-x-12 cursor-pointer overflow-hidden rounded-sm bg-blue-600 w-52 py-4 text-center text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-500 hover:shadow-blue-500/30"
          >
            <span className="relative z-10 inline-block skew-x-12">{t.home.mapCta}</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </button>

          <button
            onClick={() => onNavigate('stats')}
            className="group relative -skew-x-12 cursor-pointer overflow-hidden rounded-sm bg-white/5 w-52 py-4 text-center text-sm font-bold uppercase tracking-widest text-gray-300 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white"
          >
            <span className="relative z-10 inline-block skew-x-12">{t.home.statsCta}</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </button>
        </div>
      </div>
    </div>
  );
}
