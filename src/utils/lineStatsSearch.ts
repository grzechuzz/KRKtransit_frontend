export function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

const DEFAULT_STATS_RANGE_DAYS = 7;
export const MIN_STATS_DATE = '2026-03-12';
export const MAX_LINE_LENGTH = 5;
export const LINE_PATTERN = /^[a-zA-Z0-9]{1,5}$/;

export function clampStatsDate(value: string, maxDate: string): string {
  if (!value) return value;
  if (value < MIN_STATS_DATE) return MIN_STATS_DATE;
  return value > maxDate ? maxDate : value;
}

function getDefaultDates() {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - (DEFAULT_STATS_RANGE_DAYS - 1));
  return {
    start: localDateStr(weekAgo),
    end: localDateStr(today),
  };
}

export interface LineStatsQuery {
  line: string;
  start: string;
  end: string;
  estimated: boolean;
}

function readDateParam(value: string | null, fallback: string, maxDate: string): string {
  const parsed = value ? new Date(value) : null;
  const valid = value !== null && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && parsed !== null && !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  return valid ? clampStatsDate(value, maxDate) : fallback;
}

export function readStatsUrl(maxDate: string, search = window.location.search): LineStatsQuery {
  const params = new URLSearchParams(search);
  const defaults = getDefaultDates();
  return {
    line: (params.get('line') ?? '').trim().slice(0, MAX_LINE_LENGTH),
    start: readDateParam(params.get('from'), defaults.start, maxDate),
    end: readDateParam(params.get('to'), defaults.end, maxDate),
    estimated: params.get('estimated') === '1',
  };
}

export function isValidStatsQuery(query: LineStatsQuery): boolean {
  return LINE_PATTERN.test(query.line) && !!query.start && !!query.end && query.start <= query.end;
}

export function serializeStatsQuery({ line, start, end, estimated }: LineStatsQuery): string {
  const params = new URLSearchParams({ line, from: start, to: end });
  if (estimated) params.set('estimated', '1');
  return params.toString();
}

export function delayMapHref(query: LineStatsQuery | null): string {
  return query ? '/delay-map?' + serializeStatsQuery(query) : '/delay-map';
}

export function formatDateLabel(value: string, locale: string): string {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
}

