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

function delayColor(seconds: number) {
  if (seconds < 0) return 'text-positive';
  if (seconds === 0) return 'text-muted';
  return seconds > 180 ? 'text-negative' : 'text-warning';
}

function delayBadgeStyle(seconds: number) {
  if (seconds < 0) return 'border-positive/15 bg-positive/10';
  if (seconds === 0) return 'border-overlay/10 bg-overlay/5';
  return seconds > 180 ? 'border-negative/15 bg-negative/10' : 'border-warning/15 bg-warning/10';
}

function DelayValue({ row, plain = false }: { row: DelayResultRow; plain?: boolean }) {
  const { language, t } = useI18n();
  const shape = plain
    ? 'text-lg leading-7'
    : `inline-flex rounded-lg border px-2.5 py-1 text-sm ${delayBadgeStyle(row.delaySeconds)}`;
  return (
    <span
      aria-label={`${t.tables.generatedTop} ${t.tables.generatedBottom}: ${formatSignedDelay(row.delaySeconds, language)}`}
      className={`shrink-0 whitespace-nowrap font-bold tabular-nums ${shape} ${delayColor(row.delaySeconds)}`}
    >
      {formatSignedDelay(row.delaySeconds, language)}
    </span>
  );
}

function DelayBadge({ row }: { row: DelayResultRow }) {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-1.5">
      <DelayValue row={row} />
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

function StopTimeRow({ stop, label, planned, actual, last = false }: {
  stop: string;
  label: string;
  planned: string;
  actual: string;
  last?: boolean;
}) {
  const { t, locale } = useI18n();
  const format = (value: string) => new Date(value).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
  return (
    <>
      <span aria-hidden="true" className="relative flex justify-center self-stretch pt-2.5">
        <span className={`h-2 w-2 rounded-full ${last ? 'bg-accent' : 'border-2 border-accent bg-surface'}`} />
        {!last && <span className="absolute top-4.5 -bottom-3.5 left-1/2 w-px -translate-x-1/2 bg-accent/25" />}
      </span>
      <span className="min-w-0 break-words text-base font-semibold leading-7 text-ink">
        <span className="sr-only">{label}: </span>{stop}
      </span>
      <span className="whitespace-nowrap text-right text-sm leading-7 tabular-nums text-muted">
        <span className="sr-only">{t.tables.plannedMobile}: </span><time dateTime={planned}>{format(planned)}</time>
      </span>
      <span className="whitespace-nowrap text-right text-lg font-bold leading-7 tabular-nums text-ink">
        <span className="sr-only">{t.tables.actualMobile}: </span><time dateTime={actual}>{format(actual)}</time>
      </span>
    </>
  );
}

export default function DelayResults({ rows, tripsAnalyzed, kind }: DelayResultsProps) {
  const { t, locale } = useI18n();
  const date = (value: string) => new Date(value).toLocaleDateString(locale, { timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit' });
  const fullDate = (value: string) => new Date(value).toLocaleDateString(locale, { timeZone: 'Europe/Warsaw', day: '2-digit', month: '2-digit', year: 'numeric' });
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
                <td className="px-4 py-5"><DelayBadge row={row} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ol aria-label={title} className="space-y-2.5 lg:hidden">
        {rows.map((row, index) => (
          <li key={row.id} className="min-w-0 rounded-2xl border border-overlay/10 bg-surface px-3.5 py-3">
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-sm font-semibold tabular-nums text-subtle">#{index + 1}</span>
                <span className="max-w-full break-words rounded-md bg-overlay/5 px-2 py-0.5 text-sm font-semibold text-body">
                  <span className="sr-only">{t.tables.vehicleNumber}: </span>{row.vehicleNumber}
                </span>
                {row.estimated && (
                  <span title={t.tables.estimated} className="rounded-md border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-sm font-bold tracking-wide text-accent-strong">
                    <span aria-hidden="true">EST</span><span className="sr-only">{t.tables.estimated}</span>
                  </span>
                )}
              </div>
              <DelayValue row={row} plain />
            </div>
            <div className="grid grid-cols-[0.75rem_minmax(0,1fr)_auto_auto] items-baseline gap-x-2 gap-y-1">
              <StopTimeRow stop={row.fromStop} label={t.tables.start} planned={row.fromPlannedTime} actual={row.fromEventTime} />
              <StopTimeRow stop={row.toStop} label={t.tables.end} planned={row.toPlannedTime} actual={row.toEventTime} last />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-3 text-sm text-muted">
              <p className="min-w-0 break-words">
                <span aria-hidden="true">→ </span><span className="sr-only">{t.tables.direction}: </span>{row.direction}
              </p>
              <dl className="shrink-0 text-right tabular-nums">
                <div>
                  <dt className="sr-only">{t.tables.serviceDateTop} {t.tables.serviceDateBottom}</dt>
                  <dd><time dateTime={row.serviceDate}>{fullDate(row.serviceDate)}</time></dd>
                </div>
                {hasDifferentActualDate(row) && (
                  <div className="flex justify-end gap-1 text-subtle">
                    <dt>{t.tables.actualDateLabel}:</dt>
                    <dd><time dateTime={row.fromEventTime}>{date(row.fromEventTime)}</time></dd>
                  </div>
                )}
              </dl>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-xs text-subtle">{t.tables.analyzedTrips(tripsAnalyzed.toLocaleString(locale))}</p>
    </div>
  );
}
