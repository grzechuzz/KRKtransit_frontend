import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ApiClientError, fetchDelayMap, fetchMaxDelay, fetchPunctuality, fetchRouteDelay, fetchTrend,
  fetchShape, fetchTripStops, fetchUpcomingStops, fetchVehiclePositions,
} from '../src/api/client';
import { translations } from '../src/i18n-core';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => vi.stubGlobal('fetch', fetchMock));

describe('API requests', () => {
  it('encodes identifiers and returns the decoded response', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ stops: [] })));
    await expect(fetchTripStops('trip/a b')).resolves.toEqual({ stops: [] });
    expect(fetchMock).toHaveBeenCalledWith('/v1/trips/trip%2Fa%20b/stops');
  });

  it.each([
    [fetchPunctuality, 'punctuality'], [fetchMaxDelay, 'max-delay'],
    [fetchRouteDelay, 'route-delay'], [fetchTrend, 'trend'], [fetchDelayMap, 'delay-map'],
  ] as const)('sends the selected statistics filters to %s', async (request, endpoint) => {
    fetchMock.mockResolvedValue(new Response('{}'));
    await request('A/B', '2026-03-12', '2026-03-13', true);
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost');
    expect(url.pathname).toBe(`/v1/lines/A%2FB/stats/${endpoint}`);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      start_date: '2026-03-12', end_date: '2026-03-13', include_estimated: 'true',
    });
  });

  it('omits estimated events when they were not requested', async () => {
    fetchMock.mockResolvedValue(new Response('{}'));
    await fetchTrend('304', '2026-03-12', '2026-03-13');
    expect(String(fetchMock.mock.calls[0][0])).not.toContain('include_estimated');
  });

  it.each([false, true])('sends explicit estimated=%s without changing the line identifier', async estimated => {
    fetchMock.mockResolvedValue(new Response('{}'));
    await fetchDelayMap('00aB', '2026-03-12', '2026-03-12', estimated);
    const url = new URL(String(fetchMock.mock.calls[0][0]), 'http://localhost');
    expect(url.pathname).toBe('/v1/lines/00aB/stats/delay-map');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      start_date: '2026-03-12', end_date: '2026-03-12', include_estimated: String(estimated),
    });
  });

  it.each([
    [() => fetchVehiclePositions(), '/v1/vehicles/positions'],
    [() => fetchShape('a/b'), '/v1/shapes/a%2Fb'],
    [() => fetchUpcomingStops('a/b'), '/v1/trips/a%2Fb/upcoming-stops'],
  ] as const)('uses the public endpoint %s', async (request, url) => {
    fetchMock.mockResolvedValue(new Response('{}'));
    await request();
    expect(fetchMock).toHaveBeenCalledWith(url);
  });
});

describe.each(['pl', 'en'] as const)('API errors (%s)', (language) => {
  const messages = translations[language].api;

  it('handles offline requests without exposing a browser error', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    await expect(fetchVehiclePositions(language)).rejects.toMatchObject({
      name: 'ApiClientError', message: messages.networkError, status: null,
    });
  });

  it.each([
    [429, 'RATE_LIMIT_EXCEEDED'], [502, 'EXTERNAL_SERVICE_ERROR'], [500, 'INTERNAL_ERROR'],
  ] as const)('translates HTTP %s using the backend error code', async (status, code) => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error_code: code }), { status }));
    await expect(fetchVehiclePositions(language)).rejects.toMatchObject({
      status, errorCode: code, message: messages.errorCodeTranslations[code],
    });
  });

  it('translates missing fields and invalid date ranges', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      detail: [{ type: 'missing', loc: ['query', 'start_date'], msg: 'Field required' }],
    }), { status: 422 }));
    await expect(fetchVehiclePositions(language)).rejects.toThrow(messages.required(messages.fieldLabels.start_date));
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ message: 'start_date must be <= end_date' }), { status: 422 }));
    await expect(fetchVehiclePositions(language)).rejects.toThrow(messages.errorTranslations['start_date must be <= end_date']);
  });

  it('explains missing line data', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Line '999' not found" }), { status: 404 }));
    await expect(fetchVehiclePositions(language)).rejects.toThrow(messages.lineNotFound('999'));
  });

  it('handles non-JSON error pages and malformed successful responses', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Unavailable</html>', { status: 503 }));
    await expect(fetchVehiclePositions(language)).rejects.toThrow(messages.errorCodeTranslations.EXTERNAL_SERVICE_ERROR);
    fetchMock.mockResolvedValueOnce(new Response('invalid json'));
    await expect(fetchVehiclePositions(language)).rejects.toBeInstanceOf(ApiClientError);
  });
});
