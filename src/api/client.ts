import type {
  LiveVehicleResponse,
  ShapeResponse,
  TripStopsResponse,
  PunctualityResponse,
  MaxDelayResponse,
  RouteDelayResponse,
  TrendResponse,
} from '../types/api';

const BASE_URL = import.meta.env.PROD
  ? 'https://api.krktransit.pl/v1'
  : '/v1';

const ERROR_TRANSLATIONS: Record<string, string> = {
  'start_date must be <= end_date': 'Data początkowa musi być wcześniejsza lub równa dacie końcowej.',
  'Date range cannot exceed 365 days': 'Zakres dat nie może przekraczać 365 dni.',
  'end_date cannot be in the future': 'Data końcowa nie może być w przyszłości.',
  'Internal server error': 'Wewnętrzny błąd serwera.',
};

function translateError(message: string): string {
  if (ERROR_TRANSLATIONS[message]) return ERROR_TRANSLATIONS[message];

  // Translate dynamic "Line X not found between ..." messages
  const lineMatch = message.match(/^Line (.+) not found between (.+) and (.+)$/);
  if (lineMatch) {
    return `Nie znaleziono danych dla linii ${lineMatch[1]} w okresie ${lineMatch[2]} – ${lineMatch[3]}.`;
  }

  const shapeMatch = message.match(/^Shape '(.+)' not found$/);
  if (shapeMatch) return `Nie znaleziono trasy '${shapeMatch[1]}'.`;

  const tripMatch = message.match(/^Trip '(.+)' not found$/);
  if (tripMatch) return `Nie znaleziono kursu '${tripMatch[1]}'.`;

  return message;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = typeof body?.detail === 'string' ? body.detail : null;

    if (response.status === 404) {
      throw new Error(detail ? translateError(detail) : 'Nie znaleziono danych — sprawdź numer linii.');
    }
    if (response.status === 422) {
      throw new Error(detail ? translateError(detail) : 'Nieprawidłowe dane wejściowe — sprawdź zakres dat.');
    }
    if (response.status === 429) {
      throw new Error('Zbyt wiele zapytań — poczekaj chwilę i spróbuj ponownie.');
    }
    throw new Error(detail ? translateError(detail) : `Błąd serwera (${response.status}). Spróbuj ponownie.`);
  }
  return response.json() as Promise<T>;
}

export function fetchVehiclePositions(): Promise<LiveVehicleResponse> {
  return fetchJson<LiveVehicleResponse>(`${BASE_URL}/vehicles/positions`);
}

export function fetchShape(shapeId: string): Promise<ShapeResponse> {
  return fetchJson<ShapeResponse>(`${BASE_URL}/shapes/${encodeURIComponent(shapeId)}`);
}

export function fetchTripStops(tripId: string): Promise<TripStopsResponse> {
  return fetchJson<TripStopsResponse>(`${BASE_URL}/trips/${encodeURIComponent(tripId)}/stops`);
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
): Promise<PunctualityResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<PunctualityResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/punctuality?${params}`,
  );
}

export function fetchMaxDelay(
  lineNumber: string,
  startDate: string,
  endDate: string,
  includeEstimated = false,
): Promise<MaxDelayResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<MaxDelayResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/max-delay?${params}`,
  );
}

export function fetchRouteDelay(
  lineNumber: string,
  startDate: string,
  endDate: string,
  includeEstimated = false,
): Promise<RouteDelayResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<RouteDelayResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/route-delay?${params}`,
  );
}

export function fetchTrend(
  lineNumber: string,
  startDate: string,
  endDate: string,
  includeEstimated = false,
): Promise<TrendResponse> {
  const params = statsParams(startDate, endDate, includeEstimated);
  return fetchJson<TrendResponse>(
    `${BASE_URL}/lines/${encodeURIComponent(lineNumber)}/stats/trend?${params}`,
  );
}
