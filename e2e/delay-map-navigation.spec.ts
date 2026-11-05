import { test, expect } from './fixtures';

const context = 'line=304&from=2026-03-12&to=2026-03-13&estimated=1';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('krk-transit-language', 'pl'));
});

for (const path of ['/stats', '/delay-map']) {
  test(`empty search on ${path} explains the disabled button without requesting data`, async ({ page, apiRequests }) => {
    await page.goto(path);
    const search = page.getByRole('button', { name: 'Szukaj', exact: true });
    await expect(search).toBeDisabled();
    await search.hover();
    await expect(search).toHaveCSS('cursor', 'not-allowed');
    await expect(page.getByRole('tooltip')).toHaveText('Wybierz numer linii');
    await search.click({ force: true });
    expect(apiRequests).toHaveLength(0);
    await page.mouse.move(0, 0);
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await search.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('tooltip')).toHaveText('Wybierz numer linii');
    await page.getByLabel('Numer linii', { exact: true }).fill('304');
    await expect(page.getByRole('tooltip')).toHaveCount(0);
    await expect(search).toBeEnabled();
  });
}

for (const theme of ['light', 'dark']) {
  test(`promotes the map without loading it and preserves context in ${theme}`, async ({ page, apiRequests }, info) => {
    await page.addInitScript(value => localStorage.setItem('krk-transit-theme', value), theme);
    await page.goto(`/stats?${context}`);
    const promo = page.getByRole('region', { name: 'Mapa opóźnień', exact: true });
    await expect(promo.getByRole('heading', { name: 'Gdzie pojazdy tracą najwięcej czasu?' })).toBeVisible();
    const cta = promo.getByRole('link', { name: 'Zobacz mapę opóźnień' });
    await expect(cta).toHaveAttribute('href', `/delay-map?${context}`);
    await expect.poll(() => apiRequests.filter(url => url.includes('/stats/')).length).toBe(4);
    expect(apiRequests.some(url => url.includes('/delay-map'))).toBe(false);
    await expect(page.locator('.leaflet-container')).toHaveCount(0);
    await page.getByLabel('Numer linii', { exact: true }).fill('139');
    await expect(cta).toHaveAttribute('href', `/delay-map?${context}`);
    await promo.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`promo-${theme}.png`), fullPage: true });
    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`/delay-map?${context}`);
    await expect(page.locator('.delay-map-segment')).toHaveCount(3);
    await expect.poll(() => page.locator('main > div').evaluate(element => element.scrollTop)).toBeGreaterThan(0);
    expect(apiRequests.filter(url => url.includes('/delay-map'))).toHaveLength(1);
    await page.reload();
    await expect(page.getByLabel('Numer linii', { exact: true })).toHaveValue('304');
    await expect(page.getByLabel('Od', { exact: true })).toHaveValue('2026-03-12');
    await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await expect(page.locator('.delay-map-segment')).toHaveCount(3);
    await page.screenshot({ path: info.outputPath(`map-${theme}.png`), fullPage: true });
    await page.getByRole('region', { name: 'Mapa opóźnień', exact: true }).screenshot({ path: info.outputPath(`map-results-${theme}.png`) });
  });
}

test('menu carries submitted context and browser history restores both pages', async ({ page }, info) => {
  await page.goto(`/stats?${context}`);
  await page.getByLabel('Numer linii', { exact: true }).fill('139');
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'MAPA OPÓŹNIEŃ', exact: true }).click();
  await expect(page).toHaveURL(`/delay-map?${context}`);
  await expect(page.getByLabel('Numer linii', { exact: true })).toHaveValue('304');
  await page.goBack();
  await expect(page).toHaveURL(`/stats?${context}`);
  await page.goForward();
  await expect(page.getByLabel('Numer linii', { exact: true })).toHaveValue('304');
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(page.getByRole('button', { name: 'MAPA OPÓŹNIEŃ', exact: true })).toHaveAttribute('aria-current', 'page');
});

test('English promotion and empty navigation from another page are translated', async ({ page, apiRequests }, info) => {
  await page.addInitScript(() => localStorage.setItem('krk-transit-language', 'en'));
  await page.goto(`/stats?${context}`);
  const cta = page.getByRole('link', { name: 'View delay map' });
  await expect(page.getByRole('heading', { name: 'Where do vehicles lose the most time?' })).toBeVisible();
  await expect(cta).toHaveAttribute('href', `/delay-map?${context}`);
  expect(apiRequests.some(url => url.includes('/delay-map'))).toBe(false);
  await page.goto('/about');
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'DELAY MAP', exact: true }).click();
  await expect(page).toHaveURL('/delay-map');
  await expect(page.getByRole('heading', { name: 'Delay map' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Choose a line and date range');
  await expect(page.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
});

test('empty direct route waits for submission and validates date order', async ({ page, apiRequests }) => {
  await page.goto('/delay-map');
  await expect(page.getByRole('status')).toContainText('Wybierz linię');
  expect(apiRequests).toHaveLength(0);
  await page.getByLabel('Numer linii', { exact: true }).fill('304');
  await page.getByLabel('Od', { exact: true }).fill('2026-03-15');
  await page.getByLabel('Do', { exact: true }).fill('2026-03-14');
  await expect(page.getByRole('alert')).toContainText('Data końcowa');
  await expect(page.getByRole('button', { name: 'Szukaj', exact: true })).toBeDisabled();
  await page.getByLabel('Do', { exact: true }).fill('2026-03-16');
  await page.getByRole('button', { name: 'Szukaj', exact: true }).click();
  await expect(page.locator('.delay-map-segment')).toHaveCount(3);
  expect(apiRequests).toHaveLength(1);
});

test('clicking the active delay map tab clears the search and returns to the top', async ({ page }, info) => {
  await page.goto(`/delay-map?${context}`);
  await expect(page.locator('.delay-map-segment')).toHaveCount(3);
  const container = page.locator('main > div');
  await expect.poll(() => container.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  if (info.project.name === 'mobile') await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page.getByRole('button', { name: 'MAPA OPÓŹNIEŃ', exact: true }).click();
  await expect(page).toHaveURL('/delay-map');
  await expect(page.getByLabel('Numer linii', { exact: true })).toHaveValue('');
  await expect.poll(() => container.evaluate(element => element.scrollTop)).toBe(0);
  await expect(page.getByRole('heading', { name: 'Mapa opóźnień' })).toBeInViewport();
});

test('navigation fits narrow screens and switches at the new breakpoint', async ({ page }, info) => {
  await page.goto('/delay-map');
  for (const width of [320, 390, 820, 1099, 1100, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (width < 1100) {
      await expect(menu).toBeVisible();
      await menu.click();
      await expect(page.getByRole('button', { name: 'MAPA OPÓŹNIEŃ', exact: true })).toBeVisible();
      await menu.click();
    } else {
      await expect(menu).toBeHidden();
      await expect(page.getByRole('button', { name: 'MAPA OPÓŹNIEŃ', exact: true })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.screenshot({ path: info.outputPath(`navigation-${width}.png`) });
  }
});
