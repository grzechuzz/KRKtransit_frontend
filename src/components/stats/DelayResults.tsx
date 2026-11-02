import { useI18n } from '../../i18n-core';
import { formatSignedDelay } from './delayFormat';

export interface DelayResultRow {
  id: string;
  fromStop: string;
  toStop: string;
  direction: string;
  vehicleNumber: string;
  serviceDate: string;
  fromPlannedTime: string;
  toPlannedTime: string;
  fromEventTime: string;
  toEventTime: string;
  delaySeconds: number;
  estimated: boolean;
}

interface DelayResultsProps {
  rows: DelayResultRow[];
  tripsAnalyzed: number;
  kind: 'segment' | 'route';
}

const actualDateFormatter = new Intl.DateTimeFormat('en', {
  timeZone: 'Europe/Warsaw',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function hasDifferentActualDate(row: DelayResultRow) {
  const parts = actualDateFormatter.formatToParts(new Date(row.fromEventTime));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((value) => value.type === type)?.value;
  const actualDate = `${part('year')}-${part('month')}-${part('day')}`;
  return actualDate !== row.serviceDate;
}

function delayStyle(seconds: number) {
  if (seconds < 0) return 'border-positive/15 bg-positive/10 text-positive';
  if (seconds === 0) return 'border-overlay/10 bg-overlay/5 text-muted';
  return seconds > 180
    ? 'border-negative/15 bg-negative/10 text-negative'
    : 'border-warning/15 bg-warning/10 text-warning';
}

function DelayBadge({ row, centered = false }: { row: DelayResultRow; centered?: boolean }) {
  const { language, t } = useI18n();
  return (
    <div className={`flex flex-col gap-1.5 ${centered ? 'items-center' : 'items-end'}`}>
      <span
        aria-label={`${t.tables.generatedTop} ${t.tables.generatedBottom}: ${formatSignedDelay(row.delaySeconds, language)}`}
        className={`inline-flex whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-sm font-bold tabular-nums ${delayStyle(row.delaySeconds)}`}
      >
        {formatSignedDelay(row.delaySeconds, language)}
      </span>
      {row.estimated && <span className="text-xs font-medium text-muted">{t.tables.estimated}</span>}
    </div>
  );
}

function StopPair({ from, to }: { from: string; to: string }) {
  return (
    <div className="grid min-w-0 grid-cols-[0.75rem_minmax(0,1fr)] gap-x-2 gap-y-1.5 text-left text-sm leading-relaxed text-ink">
      <span aria-hidden="true" className="relative flex justify-center pt-1.5">
        <span className="h-2 w-2 rounded-full border-2 border-accent bg-surface" />
        <span className="absolute top-4 -bottom-2 w-px bg-accent/25" />
      </span>
      <span className="min-w-0 break-words font-semibold">{from}</span>
      <span aria-hidden="true" className="flex justify-center pt-1.5">
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
      <span className="min-w-0 break-words font-semibold">{to}</span>
    </div>
  );
}

function TimePair({ from, to }: { from: string; to: string }) {
  const { locale } = useI18n();
  const format = (value: string) => new Date(value).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 whitespace-nowrap text-center text-sm tabular-nums">
      <time dateTime={from}>{format(from)}</time>
      <span aria-hidden="true" className="text-subtle">→</span>
      <time dateTime={to}>{format(to)}</time>
    </div>
  );
}

export default function DelayResults({ rows, tripsAnalyzed, kind }: DelayResultsProps) {
  const { t, locale } = useI18n();
  const date = (value: string) => new Date(value).toLocaleDateString(locale, { timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit' });
  const time = (value: string) => new Date(value).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  const title = kind === 'segment' ? t.stats.betweenStopsTitle : t.stats.routeDelayTitle;
  if (!rows.length) return <p className="py-8 text-center text-sm text-subtle">{t.tables.noDelayData}</p>;

  return (
    <div>
      <div className="hidden overflow-x-auto rounded-2xl border border-overlay/10 bg-surface lg:block">
        <table className="w-full min-w-[1040px] table-fixed text-center text-sm">
          <caption className="sr-only">{title}</caption>
          <colgroup>
            <col className="w-[5%]" /><col className="w-[26%]" /><col className="w-[8%]" />
            <col className="w-[15%]" /><col className="w-[14%]" /><col className="w-[14%]" /><col className="w-[18%]" />
          </colgroup>
          <thead className="border-b border-overlay/10 bg-overlay/[0.03] text-xs font-semibold text-muted">
            <tr>
              <th scope="col" className="px-4 py-4">#</th>
              <th scope="col" className="px-4 py-4">{kind === 'segment' ? t.tables.segment : t.tables.route}</th>
              <th scope="col" className="px-3 py-4">{t.tables.vehicleNumber}</th>
              <th scope="col" className="px-3 py-4">{t.tables.serviceDateTop}<br />{t.tables.serviceDateBottom}</th>
              <th scope="col" className="px-3 py-4 text-center">{t.tables.scheduledTop}<br />{t.tables.scheduledBottom}</th>
              <th scope="col" className="px-3 py-4 text-center">{t.tables.actualTop}<br />{t.tables.actualBottom}</th>
              <th scope="col" className="px-4 py-4">{t.tables.generatedTop}<br />{t.tables.generatedBottom}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-overlay/10 [&_td]:align-middle [&_th]:align-middle">
            {rows.map((row, index) => (
              <tr key={row.id} className="transition-colors hover:bg-overlay/[0.03]">
                <td className="px-2 py-5 text-xs font-medium tabular-nums text-subtle">{index + 1}</td>
                <th scope="row" className="px-4 py-5 font-normal">
                  <StopPair from={row.fromStop} to={row.toStop} />
                  <p className="mt-2.5 break-words text-xs leading-relaxed text-muted">
                    {t.tables.direction}: <span className="font-medium text-body">{row.direction}</span>
                  </p>
                </th>
                <td className="px-3 py-5"><span className="inline-block max-w-full break-words rounded-md bg-overlay/5 px-2 py-1 text-xs font-semibold text-body">{row.vehicleNumber}</span></td>
                <td className="px-3 py-5">
                  <dl className="space-y-2 text-center">
                    <div>
                      <dt className="sr-only">{t.tables.serviceDateTop} {t.tables.serviceDateBottom}</dt>
                      <dd className="font-medium tabular-nums text-body"><time dateTime={row.serviceDate}>{date(row.serviceDate)}</time></dd>
                    </div>
                    {hasDifferentActualDate(row) && (
                      <div className="space-y-0.5 text-xs">
                        <dt className="text-subtle">{t.tables.actualDateLabel}</dt>
                        <dd className="tabular-nums text-body"><time dateTime={row.fromEventTime}>{date(row.fromEventTime)}</time></dd>
                      </div>
                    )}
                  </dl>
                </td>
                <td className="px-3 py-5 text-muted"><TimePair from={row.fromPlannedTime} to={row.toPlannedTime} /></td>
                <td className="px-3 py-5 font-semibold text-ink"><TimePair from={row.fromEventTime} to={row.toEventTime} /></td>
                <td className="px-4 py-5"><DelayBadge row={row} centered /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol aria-label={title} className="space-y-3 lg:hidden">
        {rows.map((row, index) => (
          <li key={row.id} className="min-w-0 rounded-2xl border border-overlay/10 bg-surface p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold tabular-nums text-subtle">#{index + 1}</span>
                <span className="max-w-full break-words rounded-md bg-overlay/5 px-2 py-1 text-xs font-semibold text-body">
                  <span className="sr-only">{t.tables.vehicleNumber}: </span>{row.vehicleNumber}
                </span>
              </div>
              <DelayBadge row={row} />
            </div>
            <StopPair from={row.fromStop} to={row.toStop} />
            <p className="mt-3 break-words text-xs leading-relaxed text-muted">
              {t.tables.direction}: <span className="font-medium text-body">{row.direction}</span>
            </p>

            <div className="mt-4 overflow-hidden rounded-xl border border-overlay/5 bg-canvas/70 px-3 py-2">
              <table className="w-full table-fixed text-sm tabular-nums">
                <caption className="sr-only">{t.tables.departureComparison}</caption>
                <colgroup><col /><col className="w-[4.5rem]" /><col className="w-[5rem]" /></colgroup>
                <thead className="text-xs text-muted">
                  <tr>
                    <td />
                    <th scope="col" className="py-2 text-center font-medium">{t.tables.plannedMobile}</th>
                    <th scope="col" className="py-2 text-center font-medium">{t.tables.actualMobile}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-overlay/5">
                  <tr>
                    <th scope="row" className="py-2 text-left text-xs font-medium text-muted">{t.tables.start}</th>
                    <td className="py-2 text-center text-body"><time dateTime={row.fromPlannedTime}>{time(row.fromPlannedTime)}</time></td>
                    <td className="py-2 text-center font-semibold text-ink"><time dateTime={row.fromEventTime}>{time(row.fromEventTime)}</time></td>
                  </tr>
                  <tr>
                    <th scope="row" className="py-2 text-left text-xs font-medium text-muted">{t.tables.end}</th>
                    <td className="py-2 text-center text-body"><time dateTime={row.toPlannedTime}>{time(row.toPlannedTime)}</time></td>
                    <td className="py-2 text-center font-semibold text-ink"><time dateTime={row.toEventTime}>{time(row.toEventTime)}</time></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <dl className="mt-4 flex flex-col items-center gap-2 border-t border-overlay/10 pt-3 text-center text-xs">
              <div className="space-y-1">
                <dt className="text-subtle">{t.tables.serviceDateTop} {t.tables.serviceDateBottom}</dt>
                <dd className="text-sm font-medium tabular-nums text-body"><time dateTime={row.serviceDate}>{date(row.serviceDate)}</time></dd>
              </div>
              {hasDifferentActualDate(row) && (
                <div className="space-y-0.5">
                  <dt className="text-subtle">{t.tables.actualDateLabel}</dt>
                  <dd className="tabular-nums text-body"><time dateTime={row.fromEventTime}>{date(row.fromEventTime)}</time></dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-subtle">{t.tables.analyzedTrips(tripsAnalyzed.toLocaleString(locale))}</p>
    </div>
  );
}
