import type { MouseEvent } from 'react';
import { useI18n } from '../../i18n-core';
import { usePageNavigation } from '../../hooks/usePageNavigation';
import { delayMapHref, serializeStatsQuery } from '../../utils/lineStatsSearch';
import type { LineStatsQuery } from '../../utils/lineStatsSearch';

export default function DelayMapPromo({ query }: { query: LineStatsQuery }) {
  const { t } = useI18n();
  const { navigate } = usePageNavigation();
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate('delayMap', serializeStatsQuery(query));
  };
  return (
    <section aria-label={t.delayMap.title} className="mt-8 sm:mt-10">
      <h2 className="mb-5 text-lg font-black uppercase tracking-wide text-ink sm:text-xl">{t.delayMap.title}</h2>
      <div className="delay-map-promo group grid overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-surface to-surface shadow-panel transition-colors hover:border-blue-500/40 motion-reduce:transition-none md:grid-cols-[1.1fr_1fr]">
        <div className="p-6 sm:p-8">
          <h3 className="max-w-lg text-2xl font-black leading-tight text-ink sm:text-3xl">{t.delayMap.promoTitle}</h3>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">{t.delayMap.promoDescription}</p>
          <a href={delayMapHref(query)} onClick={open} className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-500 motion-reduce:transition-none sm:w-auto">{t.delayMap.promoCta}</a>
        </div>
        <div className="relative flex min-w-0 items-center justify-center px-6 pb-6 md:py-6">
          <svg aria-hidden="true" viewBox="0 0 440 210" className="h-36 w-full max-w-lg md:h-56" fill="none">
            <g stroke="currentColor" className="text-accent" opacity="0.12" strokeWidth="2">
              <path d="M0 35h440M0 100h440M0 165h440M75 0v210M190 0v210M315 0v210M0 210 210 0M230 210 440 0" />
              <path d="m0 75 145 40 90-45 205 65" strokeWidth="12" />
            </g>
            <g className="delay-map-promo-route" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M35 170 110 135" stroke="#16a34a" />
              <path d="m110 135 75-20 45-55" stroke="#eab308" />
              <path d="m230 60 80 30" stroke="#f97316" />
              <path d="m310 90 90-45" stroke="#ef4444" />
            </g>
            <g fill="var(--app-surface)" stroke="var(--app-accent)" strokeWidth="3">
              {[[35, 170], [110, 135], [185, 115], [230, 60], [310, 90], [400, 45]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="6" />)}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
