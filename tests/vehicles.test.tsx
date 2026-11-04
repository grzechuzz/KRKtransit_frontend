import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { fetchVehiclePositions } from '../src/api/client';
import { useVehicles } from '../src/hooks/useVehicles';
import type { Vehicle } from '../src/types/api';

vi.mock('../src/api/client', () => ({ fetchVehiclePositions: vi.fn() }));
vi.mock('../src/i18n-core', () => ({ useI18n: () => ({ language: 'pl' }) }));

afterEach(() => vi.useRealTimers());

it('retains briefly missing vehicles, updates positions and removes stale data', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-04T12:00:00Z'));
  const vehicle: Vehicle = {
    trip_id: 'trip', license_plate: 'CACHE-TEST', line_number: '304', headsign: 'Kampus',
    shape_id: null, latitude: 50.06, longitude: 19.94, bearing: null, timestamp: new Date().toISOString(),
  };
  const fetchMock = vi.mocked(fetchVehiclePositions);
  fetchMock.mockResolvedValueOnce({ count: 1, vehicles: [vehicle] });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const { result, unmount } = renderHook(useVehicles, { wrapper });
  await waitFor(() => expect(result.current.data?.vehicles).toEqual([vehicle]));

  fetchMock.mockResolvedValue({ count: 0, vehicles: [] });
  vi.setSystemTime(new Date('2026-11-04T12:01:00Z'));
  await act(async () => { await result.current.refetch(); });
  expect(result.current.data?.count).toBe(1);

  const updated = { ...vehicle, latitude: 50.07, timestamp: new Date().toISOString() };
  fetchMock.mockResolvedValueOnce({ count: 1, vehicles: [updated] });
  await act(async () => { await result.current.refetch(); });
  await waitFor(() => expect(result.current.data?.vehicles[0].latitude).toBe(50.07));

  vi.setSystemTime(new Date('2026-11-04T12:06:01Z'));
  await act(async () => { await result.current.refetch(); });
  await waitFor(() => expect(result.current.data).toEqual({ count: 0, vehicles: [] }));
  unmount();
  client.clear();
});
