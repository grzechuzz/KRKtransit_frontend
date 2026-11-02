import { useState, useEffect, useId } from 'react';
import type { Vehicle } from '../types/api';
import { useI18n } from '../i18n-core';
import { ApiClientError } from '../api/client';
import type { useUpcomingStops } from '../hooks/useUpcomingStops';

interface VehiclePanelProps {
  vehicle: Vehicle;
  onClose: () => void;
  upcomingStops: ReturnType<typeof useUpcomingStops>;
}

const PREDICTION_LINES = new Set(['139', '163', '179', '304', '578']);

const arrivalTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
  timeZone: 'Europe/Warsaw',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

function ArrivalTime({ value }: { value: string | null }) {
  if (value === null) return <span>–</span>;

  // Intl omits seconds without rounding the original timestamp.
  return <time dateTime={value}>{arrivalTimeFormatter.format(new Date(value))}</time>;
}

function UpcomingStops({ query, lineNumber, defaultExpanded = true }: {
  query: VehiclePanelProps['upcomingStops'];
  lineNumber: string;
  defaultExpanded?: boolean;
}) {
  const { t } = useI18n();
  const labels = t.vehiclePanel;
  const { data, error, isPending } = query;
  const [expanded, setExpanded] = useState(defaultExpanded);
  const contentId = useId();

  let message: string | null = null;
  if (error) {
    message = error instanceof ApiClientError && error.status === 404
      ? labels.noData
      : labels.stopsError;
  } else if (isPending) {
    message = labels.loadingStops;
  } else if (!data?.stops.length) {
    message = data?.status === 'FINISHED'
      ? labels.tripFinished
      : data?.status === 'UNKNOWN'
        ? labels.progressUnknown
        : labels.noUpcomingStops;
  }

  return (
    <section className="mt-3 border-t border-white/10">
      <h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded((value) => !value)}
          className="flex min-h-11 w-full touch-manipulation cursor-pointer items-center gap-2 rounded-lg py-2 text-left text-sm font-semibold text-gray-200 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
        >
          <span className="min-w-0 flex-1">{labels.upcomingStops}</span>
          {!message && data && (
            <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs tabular-nums text-gray-400">{data.stops.length}</span>
          )}
          <span className="text-xs font-normal text-blue-300">{expanded ? labels.collapseStops : labels.expandStops}</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`h-4 w-4 shrink-0 text-blue-300 transition-transform motion-reduce:transition-none ${expanded ? 'rotate-180' : ''}`}>
            <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h2>
      <div id={contentId} hidden={!expanded}>
      {message ? (
        <p role="status" className="py-3 text-sm leading-relaxed text-gray-300">{message}</p>
      ) : (
        <div
          role="region"
          aria-label={labels.upcomingStops}
          tabIndex={0}
          className="max-h-[min(10rem,25dvh)] overflow-y-auto overscroll-contain rounded-lg border border-white/5 bg-gray-950/25 [scrollbar-color:#4b5563_#111827] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-blue-400 sm:max-h-none"
        >
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">{labels.upcomingStops}</caption>
          <thead>
            <tr className="text-xs text-gray-400">
              <th scope="col" className="sticky top-0 z-10 bg-gray-900 px-3 py-2 text-left font-medium">{labels.stop}</th>
              <th scope="col" className="sticky top-0 z-10 w-16 bg-gray-900 py-2 text-center font-medium">{labels.scheduled}</th>
              <th scope="col" className="sticky top-0 z-10 w-16 bg-gray-900 py-2 text-center font-medium text-blue-300">{labels.predicted}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data?.stops.map((stop) => (
              <tr key={`${stop.stop_id}-${stop.sequence}`}>
                <th scope="row" className="break-words px-3 py-2.5 text-left font-medium leading-snug text-gray-200">
                  {stop.stop_name}
                  {stop.stop_desc && (
                    <span className="ml-1.5 inline-block text-xs font-normal text-gray-400">{stop.stop_desc}</span>
                  )}
                </th>
                <td className="py-2 text-center tabular-nums text-gray-300">
                  <ArrivalTime value={stop.scheduled_arrival} />
                </td>
                <td className="py-2 text-center font-semibold tabular-nums text-blue-300">
                  <ArrivalTime value={stop.predicted_arrival} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      {!PREDICTION_LINES.has(lineNumber) && (
        <p className="mt-2 text-xs leading-relaxed text-gray-400">{labels.predictionNote}</p>
      )}
      </div>
    </section>
  );
}

function formatRelativeTime(
  iso: string,
  now: number,
  labels: {
    secondsAgo: (seconds: number) => string;
    minutesAgo: (minutes: number, seconds: number) => string;
  },
): string {
  const diff = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  if (diff < 60) return labels.secondsAgo(diff);
  const min = Math.floor(diff / 60);
  const sec = diff % 60;
  return labels.minutesAgo(min, sec);
}

function useRelativeTime(iso: string): string {
  const [now, setNow] = useState(() => Date.now());
  const { t } = useI18n();

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(id);
  }, []);

  return formatRelativeTime(iso, now, t.vehiclePanel);
}

export function MobileVehicleBar({ vehicle, onClose, upcomingStops }: VehiclePanelProps) {
  const relTime = useRelativeTime(vehicle.timestamp);
  const { t } = useI18n();

  return (
    <div className="max-h-[45dvh] shrink-0 overflow-y-auto overscroll-contain border-b border-white/5 bg-gray-900 px-3 py-2 sm:hidden">
      <div className="flex items-center gap-3">
        <span className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-bold text-white">
          {vehicle.line_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-white">{vehicle.headsign}</p>
          <p className="truncate text-xs text-gray-400">
            {vehicle.license_plate} &middot; {relTime}
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/10 text-sm text-gray-400 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          aria-label={t.vehiclePanel.close}
        >
          X
        </button>
      </div>
      <UpcomingStops key={vehicle.license_plate} query={upcomingStops} lineNumber={vehicle.line_number} defaultExpanded={false} />
    </div>
  );
}

export default function VehiclePanel({ vehicle, onClose, upcomingStops }: VehiclePanelProps) {
  const relTime = useRelativeTime(vehicle.timestamp);
  const { t } = useI18n();

  return (
    <div className="absolute top-4 right-14 z-[1000] hidden max-h-[calc(100%-2rem)] w-80 overflow-y-auto overscroll-contain rounded-2xl bg-gray-900/95 p-5 text-white shadow-2xl backdrop-blur-sm sm:block lg:w-96">
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-lg font-bold">
          {vehicle.line_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{vehicle.headsign}</p>
          <p className="text-sm text-gray-400">{vehicle.license_plate}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/10 text-sm text-gray-400 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          aria-label={t.vehiclePanel.close}
        >
          X
        </button>
      </div>

      <div className="space-y-1.5 border-t border-white/10 pt-3 text-sm">
        <Row label={t.vehiclePanel.position} value={`${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}`} />
        <Row label={t.vehiclePanel.updated} value={relTime} />
      </div>
      <UpcomingStops key={vehicle.license_plate} query={upcomingStops} lineNumber={vehicle.line_number} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-400">{label}</span>
      <span className="truncate text-sm font-medium text-gray-300" title={value}>
        {value}
      </span>
    </div>
  );
}
