import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DelayMap from '../src/components/stats/DelayMap';
import { I18nContext, translations, type Language } from '../src/i18n-core';
import { makeDelayMap } from './fixtures/delayMap';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TileLayer: () => null,
  ZoomControl: () => null,
}));
vi.mock('../src/components/stats/DelayMapViewport', () => ({ default: () => null }));
vi.mock('../src/components/stats/DelayMapLayers', () => ({
  default: ({ band }: { band: string }) => <div data-testid="layers">{band}</div>,
}));

function renderMap(data = makeDelayMap(), language: Language = 'pl') {
  return render(
    <I18nContext.Provider value={{ language, setLanguage: () => {}, locale: translations[language].locale, t: translations[language] }}>
      <DelayMap data={data} />
    </I18nContext.Provider>,
  );
}

describe('delay map controls', () => {
  it('supports repeated or empty headsigns and keeps the band when changing direction', () => {
    renderMap();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Kierunek 1 · Przystanek D' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('option')).toHaveLength(6);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'AFTERNOON' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kierunek 2 · Przystanek D' }));
    expect(screen.getByTestId('layers')).toHaveTextContent('AFTERNOON');
    expect(screen.getByRole('status')).toHaveTextContent(translations.pl.delayMap.noBandMeasurements);
    fireEvent.click(screen.getByRole('button', { name: 'Kierunek 3' }));
    expect(screen.getByRole('button', { name: 'Kierunek 3' })).toHaveAttribute('aria-pressed', 'true');
  });

  it.each(['pl', 'en'] as const)('renders empty routes in %s', language => {
    renderMap({ ...makeDelayMap(), directions: [] }, language);
    expect(screen.getByRole('status')).toHaveTextContent(translations[language].delayMap.noRoute);
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('supports a single direction without drawable segments', () => {
    const data = makeDelayMap();
    data.directions = [{ ...data.directions[0], segments: [] }];
    renderMap(data);
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent(translations.pl.delayMap.noSegments);
    expect(screen.queryByTestId('layers')).toBeNull();
  });

  it('keeps geometry for missing bands but recognizes measured zero', () => {
    const data = makeDelayMap();
    data.directions[0].segments = [data.directions[0].segments[0]];
    data.directions[0].segments[0].delays.find(item => item.band === 'MORNING')!.mean_seconds = 0;
    renderMap(data);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'WEEKEND' } });
    expect(screen.getByTestId('layers')).toBeVisible();
    expect(screen.getByRole('status')).toBeVisible();
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'MORNING' } });
    expect(screen.queryByRole('status')).toBeNull();
  });
});
