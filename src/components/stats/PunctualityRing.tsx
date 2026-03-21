import type { PunctualityResponse } from '../../types/api';

interface PunctualityRingProps {
  data: PunctualityResponse;
}

const CATEGORIES = [
  {
    key: 'on_time',
    label: 'Na czas',
    sublabel: '< 2 min',
    color: '#22c55e',
    gradientFrom: 'from-green-500/20',
    gradientTo: 'to-green-500/5',
    ring: 'ring-green-500/30',
  },
  {
    key: 'slightly_delayed',
    label: 'Lekkie opóźnienie',
    sublabel: '2 – 6 min',
    color: '#eab308',
    gradientFrom: 'from-yellow-500/20',
    gradientTo: 'to-yellow-500/5',
    ring: 'ring-yellow-500/30',
  },
  {
    key: 'delayed',
    label: 'Opóźnione',
    sublabel: '> 6 min',
    color: '#ef4444',
    gradientFrom: 'from-red-500/20',
    gradientTo: 'to-red-500/5',
    ring: 'ring-red-500/30',
  },
] as const;

export default function PunctualityRing({ data }: PunctualityRingProps) {
  const values = {
    on_time: data.on_time_percent,
    slightly_delayed: data.slightly_delayed_percent,
    delayed: data.delayed_percent,
  };

  const counts = {
    on_time: data.on_time_count,
    slightly_delayed: data.slightly_delayed_count,
    delayed: data.delayed_count,
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:gap-6">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.key}
            className={`flex flex-col items-center rounded-2xl bg-gradient-to-b ${cat.gradientFrom} ${cat.gradientTo} p-2 ring-1 ${cat.ring} sm:p-6`}
          >
            {/* Circle */}
            <div
              className="relative mb-2 flex h-18 w-18 items-center justify-center rounded-full sm:mb-4 sm:h-32 sm:w-32"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${cat.color}33, ${cat.color}0d)`,
                boxShadow: `0 0 30px ${cat.color}1a`,
              }}
            >
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{ border: `3px solid ${cat.color}66` }}
              />
              {/* Value */}
              <span
                className="text-base font-black sm:text-3xl"
                style={{ color: cat.color }}
              >
                {values[cat.key].toFixed(1)}%
              </span>
            </div>

            {/* Label */}
            <span className="text-center text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
              {cat.label}
            </span>
            <span className="mt-0.5 text-center text-[10px] text-gray-500 sm:text-xs">
              {cat.sublabel}
            </span>
            <span className="mt-1 text-[10px] text-gray-600 sm:text-xs">
              {counts[cat.key].toLocaleString('pl-PL')} pomiarów
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-gray-600">
        Łącznie {data.total_stops.toLocaleString('pl-PL')} pomiarów
      </p>
    </div>
  );
}
