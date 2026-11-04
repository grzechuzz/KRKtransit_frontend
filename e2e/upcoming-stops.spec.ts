import { test, expect, stops } from './fixtures';
import type { UpcomingStopsResponse } from '../src/types/api';

const predictionCases = [
  { source: 'ML', sourceLabel: 'KRKTransit' },
  { source: 'OPERATOR', sourceLabel: 'ZTP Kraków' },
  { source: null, sourceLabel: null },
] as const;

for (const language of ['pl', 'en'] as const) {
  const theme = language === 'pl' ? 'light' : 'dark';
  for (const { source, sourceLabel } of predictionCases) {
    test(`upcoming stops label ${source ?? 'missing'} predictions in ${language} (${theme})`, async ({ page }, info) => {
      await page.addInitScript(({ language, theme }) => {
        localStorage.setItem('krk-transit-language', language);
        localStorage.setItem('krk-transit-theme', theme);
      }, { language, theme });
      if (info.project.name === 'mobile') await page.setViewportSize({ width: 320, height: 740 });

      const arrival = '2026-11-04T00:16:59Z';
      const response: UpcomingStopsResponse = {
        trip_id: 'trip-304',
        status: 'IN_PROGRESS',
        observed_at: new Date().toISOString(),
        // The first stop has no prediction; the footer must use a later stop's source.
        stops: stops.map((stop, index) => ({
          ...stop,
          predicted_arrival: index === 0 || source === null ? null : arrival,
          prediction_source: index === 0 ? null : source,
        })),
      };
      await page.route('**/upcoming-stops', route => route.fulfill({
        json: response,
        headers: { 'access-control-allow-origin': '*' },
      }));

      await page.goto('/map');
      // Use the same line for every source so a frontend line list cannot choose the label.
      await page.locator('.leaflet-marker-icon').filter({ hasText: '304' }).click();
      if (info.project.name === 'mobile') {
        const name = language === 'pl' ? /Najbliższe przystanki/ : /Upcoming stops/;
        await page.getByRole('button', { name }).filter({ visible: true }).click();
      }

      const table = page.getByRole('table').filter({ visible: true });
      const title = language === 'pl' ? 'Prognoza' : 'Prediction';
      await expect(table.getByRole('columnheader', { name: title, exact: true })).toBeVisible();
      const sourceTitle = language === 'pl' ? 'Źródło prognozy:' : 'Prediction source:';
      if (sourceLabel) {
        await expect(page.getByText(sourceLabel, { exact: true }).filter({ visible: true })).toBeVisible();
        await expect(table).toHaveAccessibleDescription(`${sourceTitle} ${sourceLabel}`);
      } else {
        await expect(page.getByText(sourceTitle, { exact: true })).toBeHidden();
      }
      const rows = table.getByRole('row');
      await expect(rows.nth(1).getByRole('cell').last()).toHaveText('–');
      const prediction = rows.nth(2).getByRole('cell').last();
      if (source === null) {
        await expect(prediction).toHaveText('–');
      } else {
        await expect(prediction).toHaveText('01:16');
        await expect(prediction.locator('time')).toHaveAttribute('datetime', arrival);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await table.locator('..').locator('..').screenshot({ path: info.outputPath('predictions.png') });
    });
  }
}
