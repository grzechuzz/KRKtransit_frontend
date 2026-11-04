import { test, expect } from './fixtures';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('krk-transit-language')) localStorage.setItem('krk-transit-language', 'pl');
  });
});

test('direct routes, history, theme and language survive reloads', async ({ page }, info) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^mapa live$/i }).last().click();
  await expect(page).toHaveURL(/\/map$/);
  await page.goBack();
  await expect(page.getByRole('heading', { name: /KRK/ })).toBeVisible();
  await page.goto('/about');
  await expect(page.getByText('Źródła danych', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to light theme' }).or(page.getByRole('button', { name: /jasny/ })).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('button', { name: /angielski|English/ }).click();
  await page.getByRole('button', { name: 'Switch to English', exact: true }).last().click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  if (info.project.name === 'mobile') await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeVisible();
});

for (const theme of ['light', 'dark']) {
  test(`map panels coordinate correctly in ${theme} mode`, async ({ page }, info) => {
    await page.addInitScript(value => localStorage.setItem('krk-transit-theme', value), theme);
    if (info.project.name === 'mobile' && theme === 'light') await page.setViewportSize({ width: 320, height: 740 });
    await page.goto('/map');
    await page.locator('.leaflet-marker-icon').filter({ hasText: '304' }).click();
    // The visible button selects the mobile or desktop rendering without relying on DOM order.
    const stops = page.getByRole('button', { name: /Najbliższe przystanki/ }).filter({ visible: true });
    const filter = page.getByRole('button', { name: /Filtr linii/ });
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(page.getByText(/TEST304/).filter({ visible: true })).toBeVisible();
    await expect(stops).toHaveAttribute('aria-expanded', info.project.name === 'mobile' ? 'false' : 'true');
    if (info.project.name === 'mobile') {
      await stops.click();
      await expect(stops).toHaveAttribute('aria-expanded', 'true');
      await expect(page.getByRole('table').filter({ visible: true })).toContainText('Prokocim Szpitale Uniwersyteckie');
      await filter.click();
      await expect(stops).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByRole('button', { name: 'Wszystkie', exact: true })).toBeVisible();
      await menu.click();
      await expect(page.getByRole('button', { name: 'Wszystkie', exact: true })).toBeHidden();
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await stops.click();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await page.locator('.leaflet-marker-icon').filter({ hasText: '139' }).click();
      await expect(stops).toHaveAttribute('aria-expanded', 'false');
      await stops.click();
      await page.getByRole('button', { name: 'Zamknij', exact: true }).filter({ visible: true }).click();
      await page.locator('.leaflet-marker-icon').filter({ hasText: '304' }).click();
      await expect(stops).toHaveAttribute('aria-expanded', 'false');
      const mobileViewport = page.viewportSize()!;
      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(stops).toHaveAttribute('aria-expanded', 'true');
      await filter.click();
      await expect(stops).toHaveAttribute('aria-expanded', 'true');
      await page.setViewportSize(mobileViewport);
      await expect(stops).toHaveAttribute('aria-expanded', 'false');
      await expect(page.getByRole('button', { name: 'Wszystkie', exact: true })).toBeHidden();
    } else {
      await filter.click();
      await expect(stops).toHaveAttribute('aria-expanded', 'true');
    }
    await filter.click();
    if (info.project.name === 'desktop') await filter.click();
    await page.getByRole('button', { name: 'Odznacz', exact: true }).click();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(0);
    await page.getByRole('button', { name: '304', exact: true }).click();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
    await expect(page.locator('.leaflet-marker-icon')).toContainText('304');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('statistics validate input, save filters and show actual event dates', async ({ page, apiRequests }, info) => {
  await page.goto('/stats');
  const search = page.getByRole('button', { name: 'Szukaj', exact: true });
  await expect(search).toBeDisabled();
  await page.getByLabel('Numer linii', { exact: true }).fill('@@');
  await search.click();
  await expect(page.getByRole('alert')).toContainText('Numer linii');
  expect(apiRequests).toHaveLength(0);
  await page.getByLabel('Numer linii', { exact: true }).fill('304');
  await page.locator('#start-hero').fill('2026-03-12');
  await page.locator('#end-hero').fill('2026-03-13');
  await page.getByRole('button', { name: /Uwzględnij estymacje/ }).click();
  await search.click();
  await expect(page.getByRole('heading', { name: 'Punktualność', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/estimated=1/);
  await expect.poll(() => apiRequests.filter(url => url.includes('/stats/')).length).toBe(5);
  expect(apiRequests.every(url => url.includes('include_estimated=true'))).toBe(true);
  const result = info.project.name === 'mobile'
    ? page.getByRole('list', { name: 'Opóźnienia między przystankami', exact: true })
    : page.getByRole('table', { name: 'Opóźnienia między przystankami', exact: true });
  await expect(result).toContainText('Pędzichów');
  await expect(result).toContainText('+2 min 29 sek');
  const actualDate = info.project.name === 'mobile' ? result.locator('dl time') : result.locator('time[title]');
  await expect(actualDate).toHaveAttribute('datetime', '2026-11-03T23:05:00Z');
  await expect(actualDate).toHaveText(info.project.name === 'mobile' ? '04.11.2026' : '04.11');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Punktualność', exact: true })).toBeVisible();
  await expect(page.locator('#start-hero')).toHaveValue('2026-03-12');
});

test('missing statistics show a readable error without empty result sections', async ({ page }) => {
  await page.goto('/stats?line=999&from=2026-03-12&to=2026-03-13');
  await expect(page.getByRole('alert')).toContainText('Nie znaleziono danych dla linii 999');
  await expect(page.getByRole('heading', { name: 'Punktualność', exact: true })).toBeHidden();
});

test('unknown trip progress displays a message instead of an empty timetable', async ({ page }, info) => {
  await page.route('**/upcoming-stops', r => r.fulfill({
    json: { trip_id: 'trip-304', status: 'UNKNOWN', observed_at: new Date().toISOString(), stops: [] },
    headers: { 'access-control-allow-origin': '*' },
  }));
  await page.goto('/map');
  await page.locator('.leaflet-marker-icon').filter({ hasText: '304' }).click();
  if (info.project.name === 'mobile') await page.getByRole('button', { name: /Najbliższe przystanki/ }).filter({ visible: true }).click();
  await expect(page.getByRole('status').filter({ visible: true })).toHaveText('Brak danych o postępie');
  await expect(page.getByRole('table').filter({ visible: true })).toHaveCount(0);
});
