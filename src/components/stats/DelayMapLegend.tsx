import { useI18n } from '../../i18n-core';
import { DELAY_MAP_SCALE, NO_MEASUREMENTS_COLOR } from './delayMapColors';

export default function DelayMapLegend() {
  const { t } = useI18n();
  return (
    <div className="mt-4 text-xs text-body">
      <p className="mb-2 font-semibold text-ink">{t.delayMap.legendTitle}</p>
      <ul className="flex flex-wrap gap-x-5 gap-y-2">
        {[...DELAY_MAP_SCALE, { key: 'missing' as const, color: NO_MEASUREMENTS_COLOR }].map(item => (
          <li key={item.key} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-6 rounded-full" style={{ backgroundColor: item.color }} />
            {t.delayMap.colors[item.key]}
          </li>
        ))}
      </ul>
    </div>
  );
}
