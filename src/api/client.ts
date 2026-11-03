import type {
  LiveVehicleResponse,
  ShapeResponse,
  TripStopsResponse,
  UpcomingStopsResponse,
  PunctualityResponse,
  MaxDelayResponse,
  RouteDelayResponse,
  TrendResponse,
} from '../types/api';
import { translations, type Language } from '../i18n-core';

const BASE_URL = import.meta.env.PROD
  ? 'https://api.krktransit.pl/v1'
  : '/v1';

const DEFAULT_LANGUAGE: Language = 'pl';

export class ApiClientError extends Error {
  readonly status: number | null;
  readonly errorCode: string | null;

  constructor(message: string, status: number | null = null, errorCode: string | null = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errorCode = errorCode;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function apiMessages(language: Language) {
  return translations[language].api;
}

function translateError(message: string, language: Language): string {
  const api = apiMessages(language);
  const errorTranslations = api.errorTranslations as Record<string, string>;

  if (errorTranslations[message]) return errorTranslations[message];

  const lineMatch = message.match(/^Line (.+) not found between (.+) and (.+)$/);
  if (lineMatch) {
    return api.lineNotFoundBetween(lineMatch[1], lineMatch[2], lineMatch[3]);
  }

  const currentLineMatch = message.match(/^Line '(.+)' not found$/);
  if (currentLineMatch) {
    return api.lineNotFound(currentLineMatch[1]);
  }

  const shapeMatch = message.match(/^Shape '(.+)' not found$/);
  if (shapeMatch) return api.shapeNotFound(shapeMatch[1]);

  const tripMatch = message.match(/^Trip '(.+)' not found$/);
  if (tripMatch) return api.tripNotFound(tripMatch[1]);

  return message;
}

function fieldFromLoc(loc: unknown): string | null {
  if (!Array.isArray(loc)) return null;

  return loc
    .map((part) => String(part))
    .filter((part) => !['body', 'path', 'query'].includes(part))
    .at(-1) ?? null;
}

function formatValidationIssue(issue: unknown, language: Language): string | null {
  if (!isRecord(issue)) return null;

  const api = apiMessages(language);
  const field = fieldFromLoc(issue.loc);
  const fieldLabels = api.fieldLabels as Record<string, string>;
  const label = field ? fieldLabels[field] ?? field : null;
  const msg = asString(issue.msg) ?? asString(issue.message);
  const type = asString(issue.type);
  const lowerMsg = msg?.toLowerCase() ?? '';

  if (label && type === 'missing') return api.required(label);

  if (label && lowerMsg.includes('valid date')) {
    return api.validDate(label);
  }

  if (field === 'line_number' && lowerMsg.includes('string should match pattern')) {
    return api.linePattern;
  }

  if ((field === 'shape_id' || field === 'trip_id') && label && lowerMsg.includes('string should match pattern')) {
    return api.invalidFormat(label);
  }

  if (label && type?.includes('bool')) {
    return api.boolValue(label);
  }

  if (label && lowerMsg.includes('at most')) {
    return api.tooLong(label);
  }

  if (label && lowerMsg.includes('at least')) {
    return api.required(label);
  }

  if (label) return `${label}: ${msg ? translateError(msg, language) : api.invalidValue}`;
  if (msg) return translateError(msg, language);

  return null;
}

function messageFromDetail(detail: unknown, language: Language): string | null {
  const detailText = asString(detail);
  if (detailText) return detailText;

  if (Array.isArray(detail)) {
    const messages = detail
      .map((issue) => formatValidationIssue(issue, language))
      .filter((message): message is string => message !== null);

    if (messages.length) return [...new Set(messages)].slice(0, 2).join(' ');
  }

  if (isRecord(detail)) {
    return asString(detail.message) ?? asString(detail.msg);
  }

  return null;
}

async function readErrorBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function errorCodeFromBody(body: unknown): string | null {
  if (!isRecord(body)) return null;
  return asString(body.error_code) ?? asString(body.code);
}

function messageFromBody(body: unknown, language: Language): string | null {
  if (!isRecord(body)) return null;
  return asString(body.message) ?? messageFromDetail(body.detail, language);
}

function fallbackMessage(status: number, language: Language): string {
  const api = apiMessages(language);
  if (status === 404) return api.fallback404;
  if (status === 422) return api.fallback422;
  if (status === 429) return api.errorCodeTranslations.RATE_LIMIT_EXCEEDED;
  if (status === 502 || status === 503 || status === 504) {
    return api.errorCodeTranslations.EXTERNAL_SERVICE_ERROR;
  }
  if (status >= 500) return api.errorCodeTranslations.INTERNAL_ERROR;
  return api.fallbackStatus(status);
}

function userMessage(rawMessage: string | null, errorCode: string | null, status: number, language: Language): string {
  const errorCodeTranslations = apiMessages(language).errorCodeTranslations as Record<string, string>;
  if (errorCode && errorCodeTranslations[errorCode]) return errorCodeTranslations[errorCode];
  if (rawMessage) return translateError(rawMessage, language);
  return fallbackMessage(status, language);
}

export function getErrorMessage(error: unknown, language: Language = DEFAULT_LANGUAGE, fallback?: string): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (typeof error === 'string' && error.trim()) return translateError(error, language);
  return fallback ?? apiMessages(language).getDataFallback;
}

async function fetchJson<T>(url: string, language: Language = DEFAULT_LANGUAGE): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new ApiClientError(apiMessages(language).networkError);
  }

  if (!response.ok) {
    const body = await readErrorBody(response);
    const errorCode = errorCodeFromBody(body);
    const message = userMessage(messageFromBody(body, language), errorCode, response.status, language);

    throw new ApiClientError(message, response.status, errorCode);
  }

  try {
    return await response.json() as T;
  } catch {
    throw new ApiClientError(apiMessages(language).getDataFallback, response.status);
  }
}

export function fetchVehiclePositions(language: Language = DEFAULT_LANGUAGE): Promise<LiveVehicleResponse> {
  return fetchJson<LiveVehicleResponse>(`${BASE_URL}/vehicles/positions`, language);
}

export function fetchShape(shapeId: string, language: Language = DEFAULT_LANGUAGE): Promise<ShapeResponse> {
  return fetchJson<ShapeResponse>(`${BASE_URL}/shapes/${encodeURIComponent(shapeId)}`, language);
}

export function fetchTripStops(tripId: string, language: Language = DEFAULT_LANGUAGE): Promise<TripStopsResponse> {
  return fetchJson<TripStopsResponse>(`${BASE_URL}/trips/${encodeURIComponent(tripId)}/stops`, language);
}

export function fetchUpcomingStops(tripId: string, language: Language = DEFAULT_LANGUAGE): Promise<UpcomingStopsResponse> {
  return fetchJson<UpcomingStopsResponse>(`${BASE_URL}/trips/${encodeURIComponent(tripId)}/upcoming-stops`, language);
}

function statsParams(startDate: string, endDate: string, includeEstimated: boolean): URLSearchParams {
  const params = new URLSearchParams({ start_date: startDate, end_date: endDate });
  if (includeEstimated) params.set('include_estimated', 'true');
  return params;
}

export function fetchPunctuality(
  lineNumber: string,
  startDate: string,
  endDate: string,
  includeEstimated = false,
  language: Language = DEFAULT_LANGUAGE,
): Promise<PunctualityResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<PunctualityResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/punctuality?${params}`,
    language,
  );
}

export function fetchMaxDelay(
  lineNumber: string,
  startDate: string,
  endDate: string,
  includeEstimated = false,
  language: Language = DEFAULT_LANGUAGE,
): Promise<MaxDelayResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<MaxDelayResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/max-delay?${params}`,
    language,
  );
}

export function fetchRouteDelay(
  lineNumber: string,
  startDate: string,
  endDate: string,
  includeEstimated = false,
  language: Language = DEFAULT_LANGUAGE,
): Promise<RouteDelayResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<RouteDelayResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/route-delay?${params}`,
    language,
  );
}

export function fetchTrend(
  lineNumber: string,
  startDate: string,
  endDate: string,
  includeEstimated = false,
  language: Language = DEFAULT_LANGUAGE,
): Promise<TrendResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<TrendResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/trend?${params}`,
    language,
  );
}
