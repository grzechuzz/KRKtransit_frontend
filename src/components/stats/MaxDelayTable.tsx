import { useState } from 'react';
import type { MaxDelayResponse } from '../../types/api';
import { formatSignedDelay } from './delayFormat';
import { useI18n } from '../../i18n-core';

interface MaxDelayTableProps {
  data: MaxDelayResponse;
}

function EstimatedIcon({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <span className={`relative inline-flex align-middle ${className}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="h-4 w-4 cursor-help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        {/* Stopwatch body */}
        <circle cx="12" cy="13" r="8" />
        {/* Top button */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5V2" />
        {/* Top bar */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 2h4" />
        {/* Minute hand */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4l2.5 2.5" />
        {/* Side button */}
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 7.5l1.5-1.5" />
      </svg>
      {open && (
        <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-raised px-2 py-1 text-[10px] font-medium text-body shadow-lg ring-1 ring-overlay/10">
          {t.tables.estimated}
        </span>
      )}
    </span>
  );
}

function delayColor(seconds: number): string {
  if (seconds < 0) return 'text-positive';
  if (seconds === 0) return 'text-muted';
  return seconds > 180 ? 'text-negative' : 'text-warning';
}

function formatTime(iso: string, locale: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string, locale: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
}

function formatRealDate(iso: string, locale: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' });
}

export default function MaxDelayTable({ data }: MaxDelayTableProps) {
  const { language, t, locale } = useI18n();

  if (!data.max_delay.length) {
    return (
      <p className="py-8 text-center text-sm text-subtle">
        {t.tables.noDelayData}
      </p>
    );
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-overlay/10 text-xs uppercase tracking-wider text-subtle">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">{t.tables.segment}</th>
              <th className="px-3 py-2.5">{t.tables.direction}</th>
              <th className="px-3 py-2.5">{t.tables.vehicleNumber}</th>
              <th className="px-3 py-2.5">
                <div>{t.tables.serviceDateTop}</div>
                <div>{t.tables.serviceDateBottom}</div>
              </th>
              <th className="px-3 py-2.5">
                <div>{t.tables.actualDateTop}</div>
                <div>{t.tables.actualDateBottom}</div>
              </th>
              <th className="px-3 py-2.5">
                <div>{t.tables.scheduledTop}</div>
                <div>{t.tables.scheduledBottom}</div>
              </th>
              <th className="px-3 py-2.5">
                <div>{t.tables.actualTop}</div>
                <div>{t.tables.actualBottom}</div>
              </th>
              <th className="px-3 py-2.5 text-right">
                <div>{t.tables.generatedTop}</div>
                <div>{t.tables.generatedBottom}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.max_delay.map((entry, i) => (
              <tr
                key={entry.trip_id + entry.from_sequence}
                className="border-b border-overlay/5 transition hover:bg-overlay/5"
              >
                <td className="px-3 py-3 font-mono text-subtle">{i + 1}</td>
                <td className="px-3 py-3">
                  <span className="font-medium text-ink">{entry.from_stop}</span>
                  <span className="mx-1.5 text-subtle">&rarr;</span>
                  <span className="font-medium text-ink">{entry.to_stop}</span>
                </td>
                <td className="px-3 py-3 text-muted">{entry.headsign}</td>
                <td className="px-3 py-3 font-mono text-body">{entry.vehicle_number}</td>
                <td className="px-3 py-3 text-muted">{formatDate(entry.service_date, locale)}</td>
                <td className="px-3 py-3 text-muted">{formatRealDate(entry.from_event_time, locale)}</td>
                <td className="px-3 py-3">
                  <div className="font-mono text-muted">
                    {formatTime(entry.from_planned_time, locale)}
                    <span className="mx-1 text-subtle">&rarr;</span>
                    {formatTime(entry.to_planned_time, locale)}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-mono text-body">
                    {formatTime(entry.from_event_time, locale)}
                    <span className="mx-1 text-subtle">&rarr;</span>
                    {formatTime(entry.to_event_time, locale)}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 whitespace-nowrap font-bold ${delayColor(entry.delay_generated_seconds)}`}>
                    {entry.is_estimated && <EstimatedIcon />}
                    {formatSignedDelay(entry.delay_generated_seconds, language)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 lg:hidden">
        {data.max_delay.map((entry, i) => (
          <div
            key={entry.trip_id + entry.from_sequence}
            className="rounded-xl border border-overlay/5 bg-overlay/[0.02] p-3"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-overlay/10 text-xs font-bold text-muted">
                  {i + 1}
                </span>
                <span className={`inline-flex items-center gap-1 text-lg font-black ${delayColor(entry.delay_generated_seconds)}`}>
                  {entry.is_estimated && <EstimatedIcon />}
                  {formatSignedDelay(entry.delay_generated_seconds, language)}
                </span>
              </div>
              <span className="rounded bg-overlay/10 px-2 py-0.5 font-mono text-xs text-muted">
                {entry.vehicle_number}
              </span>
            </div>

            <p className="mb-2 text-sm">
              <span className="font-medium text-ink">{entry.from_stop}</span>
              <span className="mx-1.5 text-subtle">&rarr;</span>
              <span className="font-medium text-ink">{entry.to_stop}</span>
            </p>

            {/* Times */}
            <div className="mb-2 grid grid-cols-2 gap-2 rounded-lg bg-overlay/[0.03] px-2.5 py-2 text-xs">
              <div>
                <span className="text-subtle">{t.tables.plannedShort}: </span>
                <span className="font-mono text-muted">
                  {formatTime(entry.from_planned_time, locale)} &rarr; {formatTime(entry.to_planned_time, locale)}
                </span>
              </div>
              <div>
                <span className="text-subtle">{t.tables.actualShort}: </span>
                <span className="font-mono text-body">
                  {formatTime(entry.from_event_time, locale)} &rarr; {formatTime(entry.to_event_time, locale)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-subtle">
              <span>{t.tables.serviceShort}: {formatDate(entry.service_date, locale)}</span>
              <span>{t.tables.actualShort}: {formatRealDate(entry.from_event_time, locale)}</span>
              <span className="text-subtle">&middot;</span>
              <span>{entry.headsign}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-subtle">
        {t.tables.analyzedTrips(data.trips_analyzed.toLocaleString(locale))}
      </p>
    </div>
  );
}
