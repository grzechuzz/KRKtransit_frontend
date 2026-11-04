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

function UpcomingStops({ query, defaultExpanded = true, compactCollapsed = false, expanded: controlledExpanded, onExpandedChange }: {
  query: VehiclePanelProps['upcomingStops'];
  defaultExpanded?: boolean;
  compactCollapsed?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const { t } = useI18n();
  const labels = t.vehiclePanel;
  const { data, error, isPending } = query;
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded ?? localExpanded;
  const toggleExpanded = () => {
    if (onExpandedChange) onExpandedChange(!expanded);
    else setLocalExpanded(!expanded);
  };
  const contentId = useId();
  const showCompactButton = compactCollapsed && !expanded;

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
    <section className={showCompactButton ? 'mt-2' : `mt-3 border-t border-overlay/10 ${expanded ? '' : 'sm:-mb-3'}`}>
      <h2>
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={toggleExpanded}
          className={`flex min-h-11 w-full touch-manipulation cursor-pointer items-center gap-2 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${showCompactButton ? 'rounded-xl border border-overlay/5 bg-canvas/25 px-3 font-medium text-strong hover:border-overlay/15 active:border-overlay/20 [[data-theme=light]_&]:bg-[#f8fafc]' : 'rounded-lg font-semibold text-ink hover:text-ink'}`}
        >
          <span className="min-w-0 flex-1">{labels.upcomingStops}</span>
          {!showCompactButton && (
            <span className="shrink-0 text-xs font-normal text-accent-strong">
              {expanded ? labels.collapseStops : labels.expandStops}
            </span>
          )}
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none ${showCompactButton ? 'text-muted' : 'text-accent-strong'} ${expanded ? 'rotate-180' : ''}`}>
            <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h2>
      <div id={contentId} hidden={!expanded}>
      {message ? (
        <p role="status" className="py-3 text-sm leading-relaxed text-body">{message}</p>
      ) : (
        <div
          role="region"
          aria-label={labels.upcomingStops}
          tabIndex={0}
          className="max-h-[min(10rem,25dvh)] overflow-y-auto overscroll-contain rounded-lg border border-overlay/5 bg-canvas/25 [[data-theme=light]_&]:bg-[#f8fafc] [scrollbar-width:thin] focus-visible:outline-2 focus-visible:outline-blue-400 sm:max-h-none"
        >
        <table className="w-full table-fixed text-sm">
          <caption className="sr-only">{labels.upcomingStops}</caption>
          <thead>
            <tr className="text-xs text-muted">
              <th scope="col" className="sticky top-0 z-10 bg-surface px-3 py-2 text-left font-medium [[data-theme=light]_&]:bg-[#f8fafc]">{labels.stop}</th>
              <th scope="col" className="sticky top-0 z-10 w-16 bg-surface py-2 text-center font-medium [[data-theme=light]_&]:bg-[#f8fafc]">{labels.scheduled}</th>
              <th scope="col" className="sticky top-0 z-10 w-20 bg-surface py-2 pr-2 text-center font-medium text-accent-strong [[data-theme=light]_&]:bg-[#f8fafc]">{labels.predicted}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-overlay/5">
            {data?.stops.map((stop) => (
              <tr key={`${stop.stop_id}-${stop.sequence}`}>
                <th scope="row" className="break-words px-3 py-2.5 text-left font-medium leading-snug text-strong">
                  {stop.stop_name}
                  {stop.stop_desc && (
                    <span className="ml-1.5 inline-block text-xs font-normal text-muted">{stop.stop_desc}</span>
                  )}
                </th>
                <td className="py-2 text-center tabular-nums text-body">
                  <ArrivalTime value={stop.scheduled_arrival} />
                </td>
                <td className="py-2 pr-2 text-center font-semibold tabular-nums text-accent-strong">
                  <ArrivalTime value={stop.predicted_arrival} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
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

interface MobileVehicleBarProps extends VehiclePanelProps {
  stopsExpanded: boolean;
  onStopsExpandedChange: (expanded: boolean) => void;
}

export function MobileVehicleBar({ vehicle, onClose, upcomingStops, stopsExpanded, onStopsExpandedChange }: MobileVehicleBarProps) {
  const relTime = useRelativeTime(vehicle.timestamp);
  const { t } = useI18n();

  return (
    <div className="max-h-[45dvh] shrink-0 overflow-y-auto overscroll-contain border-b border-overlay/5 bg-surface px-3 py-2 sm:hidden">
      <div className="flex items-center gap-3">
        <span className="shrink-0 rounded-lg bg-blue-600 px-2.5 py-1 text-sm font-bold text-white">
          {vehicle.line_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-ink">{vehicle.headsign}</p>
          <p className="truncate text-xs text-muted">
            {vehicle.license_plate} &middot; {relTime}
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="flex h-11 w-11 shrink-0 touch-manipulation cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-overlay/5 hover:text-ink active:bg-overlay/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          aria-label={t.vehiclePanel.close}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className="h-5 w-5">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      <UpcomingStops key={vehicle.license_plate} query={upcomingStops} defaultExpanded={false} compactCollapsed expanded={stopsExpanded} onExpandedChange={onStopsExpandedChange} />
    </div>
  );
}

export default function VehiclePanel({ vehicle, onClose, upcomingStops }: VehiclePanelProps) {
  const relTime = useRelativeTime(vehicle.timestamp);
  const { t } = useI18n();

  return (
    <div className="absolute top-4 right-14 z-[1000] hidden max-h-[calc(100%-2rem)] w-80 overflow-y-auto overscroll-contain rounded-2xl bg-surface/95 p-5 text-ink shadow-panel backdrop-blur-sm sm:block lg:w-96">
      <div className="mb-3 flex items-center gap-3">
        <span className="rounded-lg bg-blue-600 px-3 py-1.5 text-lg font-bold text-white">
          {vehicle.line_number}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold leading-tight">{vehicle.headsign}</p>
          <p className="text-sm text-muted">{vehicle.license_plate}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 shrink-0 touch-manipulation cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-overlay/5 hover:text-ink active:bg-overlay/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          aria-label={t.vehiclePanel.close}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" className="h-5 w-5">
            <path d="m6 6 12 12M18 6 6 18" />
          </svg>
        </button>
      </div>

      <div className="space-y-1.5 border-t border-overlay/10 pt-3 text-sm">
        <Row label={t.vehiclePanel.position} value={`${vehicle.latitude.toFixed(5)}, ${vehicle.longitude.toFixed(5)}`} />
        <Row label={t.vehiclePanel.updated} value={relTime} />
      </div>
      <UpcomingStops key={vehicle.license_plate} query={upcomingStops} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted">{label}</span>
      <span className="truncate text-sm font-medium text-body" title={value}>
        {value}
      </span>
    </div>
  );
}
