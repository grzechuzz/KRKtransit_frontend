import type { MaxDelayResponse } from '../../types/api';

interface MaxDelayTableProps {
  data: MaxDelayResponse;
}

function formatDelay(seconds: number): string {
  const abs = Math.abs(seconds);
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  const value = s > 0 ? `${m} min ${s} sek` : `${m} min`;
  if (seconds < 0) return `\u2212${value}`;
  if (seconds === 0) return '0 min';
  return `+${value}`;
}

function delayColor(seconds: number): string {
  if (seconds < 0) return 'text-green-400';
  if (seconds === 0) return 'text-gray-400';
  return seconds > 180 ? 'text-red-400' : 'text-yellow-400';
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

function formatRealDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

export default function MaxDelayTable({ data }: MaxDelayTableProps) {
  if (!data.max_delay.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Brak danych o opóźnieniach dla wybranego zakresu.
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
              <th className="px-3 py-2.5">Odcinek</th>
              <th className="px-3 py-2.5">Kierunek</th>
              <th className="px-3 py-2.5">Nr boczny</th>
              <th className="px-3 py-2.5">
                <div>Data</div>
                <div>serwisowa</div>
              </th>
              <th className="px-3 py-2.5">
                <div>Data</div>
                <div>rzeczywista</div>
              </th>
              <th className="px-3 py-2.5">
                <div>Planowe</div>
                <div>odjazdy</div>
              </th>
              <th className="px-3 py-2.5">
                <div>Rzeczywiste</div>
                <div>odjazdy</div>
              </th>
              <th className="px-3 py-2.5 text-right">
                <div>Wygenerowane</div>
                <div>opóźnienie</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.max_delay.map((entry, i) => (
              <tr
                key={entry.trip_id + entry.from_sequence}
                className="border-b border-white/5 transition hover:bg-white/5"
              >
                <td className="px-3 py-3 font-mono text-gray-600">{i + 1}</td>
                <td className="px-3 py-3">
                  <span className="font-medium text-white">{entry.from_stop}</span>
                  <span className="mx-1.5 text-gray-600">&rarr;</span>
                  <span className="font-medium text-white">{entry.to_stop}</span>
                </td>
                <td className="px-3 py-3 text-gray-400">{entry.headsign}</td>
                <td className="px-3 py-3 font-mono text-gray-300">{entry.vehicle_number}</td>
                <td className="px-3 py-3 text-gray-400">{formatDate(entry.service_date)}</td>
                <td className="px-3 py-3 text-gray-400">{formatRealDate(entry.from_event_time)}</td>
                <td className="px-3 py-3">
                  <div className="font-mono text-gray-400">
                    {formatTime(entry.from_planned_time)}
                    <span className="mx-1 text-gray-700">&rarr;</span>
                    {formatTime(entry.to_planned_time)}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="font-mono text-gray-300">
                    {formatTime(entry.from_event_time)}
                    <span className="mx-1 text-gray-700">&rarr;</span>
                    {formatTime(entry.to_event_time)}
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className={`font-bold ${delayColor(entry.delay_generated_seconds)}`}>
                    {formatDelay(entry.delay_generated_seconds)}
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
            className="rounded-xl border border-white/5 bg-white/[0.02] p-3"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-gray-400">
                  {i + 1}
                </span>
                <span className={`text-lg font-black ${delayColor(entry.delay_generated_seconds)}`}>
                  {formatDelay(entry.delay_generated_seconds)}
                </span>
              </div>
              <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-gray-400">
                {entry.vehicle_number}
              </span>
            </div>

            <p className="mb-2 text-sm">
              <span className="font-medium text-white">{entry.from_stop}</span>
              <span className="mx-1.5 text-gray-600">&rarr;</span>
              <span className="font-medium text-white">{entry.to_stop}</span>
            </p>

            {/* Times */}
            <div className="mb-2 grid grid-cols-2 gap-2 rounded-lg bg-white/[0.03] px-2.5 py-2 text-xs">
              <div>
                <span className="text-gray-600">Plan: </span>
                <span className="font-mono text-gray-400">
                  {formatTime(entry.from_planned_time)} &rarr; {formatTime(entry.to_planned_time)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Rzecz: </span>
                <span className="font-mono text-gray-300">
                  {formatTime(entry.from_event_time)} &rarr; {formatTime(entry.to_event_time)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Serw: {formatDate(entry.service_date)}</span>
              <span>Rzecz: {formatRealDate(entry.from_event_time)}</span>
              <span className="text-gray-700">&middot;</span>
              <span>{entry.headsign}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-600">
        Przeanalizowano {data.trips_analyzed.toLocaleString('pl-PL')} kursów
      </p>
    </div>
  );
}
