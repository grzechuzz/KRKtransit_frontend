import type { MouseEvent } from 'react';
import { useI18n } from '../../i18n-core';
import { usePageNavigation } from '../../hooks/usePageNavigation';
import { delayMapHref, serializeStatsQuery } from '../../utils/lineStatsSearch';
import type { LineStatsQuery } from '../../utils/lineStatsSearch';
import SectionHeader from './SectionHeader';
import { DELAY_MAP_SCALE } from './delayMapColors';

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
      <SectionHeader title={t.delayMap.title} subtitle={t.delayMap.subtitle} />
      <div className="delay-map-promo group grid overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-surface to-surface shadow-panel transition-colors hover:border-blue-500/40 motion-reduce:transition-none md:grid-cols-[1.1fr_1fr]">
        <div className="px-6 pt-6 sm:px-8 sm:pt-8 md:col-start-1 md:row-start-1">
          <h3 className="max-w-lg text-2xl font-black leading-tight text-ink sm:text-3xl">{t.delayMap.promoTitle}</h3>
          <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted">{t.delayMap.promoDescription}</p>
        </div>
        <div className="relative flex min-w-0 items-center justify-center px-6 pt-6 md:col-start-2 md:row-span-2 md:row-start-1 md:py-6">
          <svg aria-hidden="true" viewBox="0 0 440 210" className="h-36 w-full max-w-lg md:h-56" fill="none">
            <g stroke="currentColor" className="text-accent" opacity="0.12" strokeWidth="2">
              <path d="M0 35h440M0 100h440M0 165h440M75 0v210M190 0v210M315 0v210M0 210 210 0M230 210 440 0" />
              <path d="m0 75 145 40 90-45 205 65" strokeWidth="12" />
            </g>
            <g className="delay-map-promo-route" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M35 170 110 135" stroke={DELAY_MAP_SCALE[0].color} />
              <path d="m110 135 75-20 45-55" stroke={DELAY_MAP_SCALE[1].color} />
              <path d="m230 60 80 30" stroke={DELAY_MAP_SCALE[2].color} />
              <path d="m310 90 90-45" stroke={DELAY_MAP_SCALE[3].color} />
            </g>
            <g fill="var(--app-surface)" stroke="var(--app-accent)" strokeWidth="3">
              {[[35, 170], [110, 135], [185, 115], [230, 60], [310, 90], [400, 45]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="6" />)}
            </g>
          </svg>
        </div>
        <div className="px-6 pt-6 pb-6 sm:px-8 sm:pb-8 md:col-start-1 md:row-start-2">
          <a href={delayMapHref(query)} onClick={open} className="inline-flex min-h-11 w-full -skew-x-12 items-center justify-center rounded-sm bg-blue-600 px-6 py-3 text-center text-sm font-bold uppercase tracking-widest text-white shadow-xl shadow-blue-600/25 transition-[background-color,box-shadow] hover:bg-blue-500 hover:shadow-blue-500/30 motion-reduce:transition-none sm:w-auto">
            <span className="inline-block skew-x-12">{t.delayMap.promoCta}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
