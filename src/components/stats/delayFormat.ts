import type { Language } from '../../i18n-core';

function formatDuration(seconds: number, language: Language = 'pl'): string {
  const totalSeconds = Math.abs(Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  const parts: string[] = [];
  const units = language === 'pl'
    ? { hours: 'godz', minutes: 'min', seconds: 'sek' }
    : { hours: 'h', minutes: 'min', seconds: 's' };

  if (hours > 0) {
    parts.push(`${hours} ${units.hours}`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes} ${units.minutes}`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds} ${units.seconds}`);
  }

  return parts.join(' ');
}

export function formatSignedDelay(seconds: number, language: Language = 'pl'): string {
  if (seconds === 0) return '0 min';

  const value = formatDuration(seconds, language);

  if (seconds < 0) return `\u2212${value}`;
  return `+${value}`;
}

export function formatDelay(seconds: number, language: Language = 'pl'): string {
  return formatDuration(seconds, language);
}

export function formatMapDelay(seconds: number, locale = 'pl-PL'): string {
  const totalSeconds = Math.round(Math.abs(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  const sign = totalSeconds === 0 ? '' : seconds < 0 ? '\u2212' : '+';
  const parts: string[] = [];

  if (minutes > 0) parts.push(`${minutes.toLocaleString(locale)} min`);
  if (remainingSeconds > 0 || minutes === 0) parts.push(`${remainingSeconds} s`);

  return sign + parts.join(' ');
}

export function formatCompactDelay(seconds: number): string {
  const totalSeconds = Math.abs(Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0 || hours > 0) {
    parts.push(`${minutes}m`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
}
