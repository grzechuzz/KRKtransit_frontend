import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, it, vi } from 'vitest';
import { fetchUpcomingStops } from '../src/api/client';
import { useUpcomingStops } from '../src/hooks/useUpcomingStops';

vi.mock('../src/api/client', () => ({ fetchUpcomingStops: vi.fn() }));
vi.mock('../src/i18n-core', () => ({ useI18n: () => ({ language: 'pl' }) }));

it('polls only the selected trip every five seconds and stops after deselection', async () => {
  vi.useFakeTimers();
  const fetchMock = vi.mocked(fetchUpcomingStops).mockResolvedValue({ trip_id: 'trip', status: 'UNKNOWN', observed_at: '2026-11-04T12:00:00Z', stops: [] });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const initialProps: { trip: string | null } = { trip: null };
  const { rerender, unmount } = renderHook(({ trip }: { trip: string | null }) => useUpcomingStops(trip), { initialProps, wrapper });
  try {
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });
    expect(fetchMock).not.toHaveBeenCalled();
    rerender({ trip: 'trip' });
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('trip', 'pl');
    await act(async () => { await vi.advanceTimersByTimeAsync(5_000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    rerender({ trip: null });
    await act(async () => { await vi.advanceTimersByTimeAsync(10_000); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  } finally {
    unmount();
    client.clear();
    vi.useRealTimers();
  }
});
