import { useState } from 'react';
import type { RouteDelayResponse } from '../../types/api';
import { formatSignedDelay } from './delayFormat';
import { useI18n } from '../../i18n-core';

interface RouteDelayTableProps {
  data: RouteDelayResponse;
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
        className="h-3.5 w-3.5 cursor-help"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {open && (
        <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] font-medium text-gray-300 shadow-lg ring-1 ring-white/10">
          {t.tables.estimated}
        </span>
      )}
    </span>
  );
}

function delayColor(seconds: number): string {
  if (seconds < 0) return 'text-green-400';
  if (seconds === 0) return 'text-gray-400';
  return seconds > 180 ? 'text-red-400' : 'text-yellow-400';
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

export default function RouteDelayTable({ data }: RouteDelayTableProps) {
  const { language, t, locale } = useI18n();

  if (!data.max_route_delay.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
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
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">{t.tables.route}</th>
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
            {data.max_route_delay.map((entry, i) => (
              <tr
                key={entry.trip_id + entry.service_date}
                className="border-b border-white/5 transition hover:bg-white/5"
              >
                <td className="px-3 py-3 font-mono text-gray-600">{i + 1}</td>
                <td className="px-3 py-3">
                  <span className="font-medium text-white">{entry.first_stop}</span>
                  <span className="mx-1.5 text-gray-600">&rarr;</span>
                  <span className="font-medium text-white">{entry.last_stop}</span>
                </td>
                <td className="px-3 py-3 text-gray-400">{entry.headsign}</td>
                <td className="px-3 py-3 font-mono text-gray-300">{entry.vehicle_number}</td>
                <td className="px-3 py-3 text-gray-400">{formatDate(entry.service_date, locale)}</td>
                <td className="px-3 py-3 text-gray-400">{formatRealDate(entry.first_event_time, locale)}</td>
                <td className="px-3 py-3">
                  <div className="font-mono text-gray-400">
                    {formatTime(entry.first_planned_time, locale)}
                    <span className="mx-1 text-gray-700">&rarr;</span>
                    {formatTime(entry.last_planned_time, locale)}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-mono text-gray-300">
                    {formatTime(entry.first_event_time, locale)}
                    <span className="mx-1 text-gray-700">&rarr;</span>
                    {formatTime(entry.last_event_time, locale)}
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
        {data.max_route_delay.map((entry, i) => (
          <div
            key={entry.trip_id + entry.service_date}
            className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400">
                  {i + 1}
                </span>
                <span className={`inline-flex items-center gap-1 text-lg font-black ${delayColor(entry.delay_generated_seconds)}`}>
                  {entry.is_estimated && <EstimatedIcon />}
                  {formatSignedDelay(entry.delay_generated_seconds, language)}
                </span>
              </div>
              <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-gray-400">
                {entry.vehicle_number}
              </span>
            </div>

            <p className="mb-2 text-sm">
              <span className="font-medium text-white">{entry.first_stop}</span>
              <span className="mx-1.5 text-gray-600">&rarr;</span>
              <span className="font-medium text-white">{entry.last_stop}</span>
            </p>

            <div className="mb-2 grid grid-cols-2 gap-2 rounded-lg bg-white/[0.03] px-2.5 py-2 text-xs">
              <div>
                <span className="text-gray-600">{t.tables.plannedShort}: </span>
                <span className="font-mono text-gray-400">
                  {formatTime(entry.first_planned_time, locale)} &rarr; {formatTime(entry.last_planned_time, locale)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">{t.tables.actualShort}: </span>
                <span className="font-mono text-gray-300">
                  {formatTime(entry.first_event_time, locale)} &rarr; {formatTime(entry.last_event_time, locale)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{t.tables.serviceShort}: {formatDate(entry.service_date, locale)}</span>
              <span>{t.tables.actualShort}: {formatRealDate(entry.first_event_time, locale)}</span>
              <span className="text-gray-700">&middot;</span>
              <span>{entry.headsign}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-600">
        {t.tables.analyzedTrips(data.trips_analyzed.toLocaleString(locale))}
      </p>
    </div>
  );
}
