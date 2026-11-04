import { test, expect } from './fixtures';
import { makeDelayMap } from '../tests/fixtures/delayMap';

const statsUrl = '/stats?line=304&from=2026-10-27&to=2026-11-02';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('krk-transit-language', 'pl'));
});

for (const theme of ['light', 'dark']) {
  test(`renders measured end segments, local filters and tooltips in ${theme}`, async ({ page, apiRequests }, info) => {
    await page.addInitScript(value => localStorage.setItem('krk-transit-theme', value), theme);
    await page.goto(statsUrl);
    const section = page.getByRole('region', { name: 'Mapa przyrostu opóźnień', exact: true });
    const segments = section.locator('.delay-map-segment');
    await expect(segments).toHaveCount(3);
    await expect(segments.nth(0)).toHaveAttribute('stroke', '#16a34a');
    await expect(segments.nth(1)).toHaveAttribute('stroke', '#eab308');
    await expect(segments.nth(2)).toHaveAttribute('stroke', '#9ca3af');
    await expect(section.locator('.delay-map-stop-hit')).toHaveCount(4);
    await expect.poll(() => apiRequests.filter(url => url.includes('/stats/')).length).toBe(5);
    expect(apiRequests.find(url => url.includes('/delay-map'))).toContain('include_estimated=false');
    await section.scrollIntoViewIfNeeded();
    const hit = section.locator('.delay-map-hit').first();
    if (info.project.name === 'mobile') await hit.tap();
    else await hit.hover();
    const tooltip = section.locator('.leaflet-tooltip');
    await expect(tooltip).toContainText('Przystanek A (01)');
    await expect(tooltip).toContainText('-10,5 s');
    await expect(tooltip).toContainText('+1,2 s');
    await expect(tooltip).toContainText('90. percentyl');
    const mapBounds = (await section.locator('.leaflet-container').boundingBox())!;
    await expect.poll(async () => {
      const box = await tooltip.boundingBox();
      return !!box && box.width > 200 && box.x >= mapBounds.x && box.y >= mapBounds.y
        && box.x + box.width <= mapBounds.x + mapBounds.width
        && box.y + box.height <= mapBounds.y + mapBounds.height;
    }).toBe(true);
    if (info.project.name === 'mobile') {
      await section.locator('.leaflet-container').tap({ position: { x: 10, y: 10 } });
    } else {
      await page.keyboard.press('Escape');
    }
    await expect(tooltip).toHaveCount(0);
    const geometry = await segments.first().getAttribute('d');
    for (const band of ['MORNING', 'MIDDAY', 'AFTERNOON', 'EVENING_NIGHT', 'WEEKEND', 'ALL_DAY']) {
      await section.getByRole('combobox').selectOption(band);
    }
    await expect(segments.first()).toHaveAttribute('d', geometry!);
    await section.getByRole('combobox').selectOption('MORNING');
    await expect(segments.nth(1)).toHaveAttribute('stroke', '#16a34a');
    await section.getByRole('button', { name: 'Kierunek 2 · Przystanek D' }).click();
    await expect(segments).toHaveCount(1);
    await expect(section.getByRole('combobox')).toHaveValue('MORNING');
    await expect(section.getByRole('status')).toContainText('Brak pomiarów');
    await section.getByRole('button', { name: 'Kierunek 3', exact: true }).click();
    await expect(segments).toHaveCount(1);
    await expect(section.locator('.leaflet-control-zoom')).toBeVisible();
    expect(apiRequests.filter(url => url.includes('/stats/'))).toHaveLength(5);
    expect(apiRequests.some(url => /\/shapes\/|\/trips\//.test(url))).toBe(false);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.getByRole('button', { name: 'Szukaj', exact: true }).click();
    await expect(section.getByRole('button', { name: 'Kierunek 1 · Przystanek D' })).toHaveAttribute('aria-pressed', 'true');
    await expect(section.getByRole('combobox')).toHaveValue('ALL_DAY');
  });
}

test('loads independently, zooms with the mouse wheel and pans with a finger', async ({ page }, info) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/stats/delay-map?*', async route => {
    await gate;
    await route.fulfill({ json: makeDelayMap() });
  });
  await page.goto(statsUrl);
  const section = page.getByRole('region', { name: 'Mapa przyrostu opóźnień', exact: true });
  await expect(page.getByRole('heading', { name: 'Punktualność', exact: true })).toBeVisible();
  await expect(section.getByRole('status')).toContainText('Ładowanie');
  await expect(page.getByRole('button', { name: 'Szukaj', exact: true })).toHaveAttribute('aria-busy', 'false');
  release();
  await expect(section.locator('.delay-map-segment')).toHaveCount(3);
  await section.scrollIntoViewIfNeeded();
  const map = section.locator('.leaflet-container');
  const before = await section.locator('.leaflet-map-pane').getAttribute('style');
  const scrollBefore = await page.locator('main > div').evaluate(element => element.scrollTop);
  if (info.project.name === 'desktop') {
    const segment = section.locator('.delay-map-segment').first();
    const geometry = await segment.getAttribute('d');
    await map.hover();
    await page.mouse.wheel(0, -200);
    await expect(segment).not.toHaveAttribute('d', geometry!);
    await expect.poll(() => page.locator('main > div').evaluate(element => element.scrollTop)).toBe(scrollBefore);
  } else {
    const box = (await map.boundingBox())!;
    const session = await page.context().newCDPSession(page);
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (const offset of [20, 40, 60, 80, 100]) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y + offset }] });
    }
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await session.detach();
    await expect(section.locator('.leaflet-map-pane')).not.toHaveAttribute('style', before!);
    await expect.poll(() => page.locator('main > div').evaluate(element => element.scrollTop)).toBe(scrollBefore);
  }
});

test('shows a usable map when every other statistic fails', async ({ page }) => {
  await page.route('**/stats/*?*', async route => {
    if (route.request().url().includes('/delay-map?')) return route.fallback();
    await route.fulfill({ status: 503, json: { error_code: 'EXTERNAL_SERVICE_ERROR', message: 'Statistics service is busy' } });
  });
  await page.goto(statsUrl);
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.locator('.delay-map-segment')).toHaveCount(3);
  await expect(page.getByRole('heading', { name: 'Punktualność', exact: true })).toBeHidden();
});

test('distinguishes no route, no measurements and an unmeasured band', async ({ page }) => {
  const data = makeDelayMap();
  data.directions = [];
  await page.route('**/stats/delay-map?*', route => route.fulfill({ json: data }));
  await page.goto(statsUrl);
  const section = page.getByRole('region', { name: 'Mapa przyrostu opóźnień', exact: true });
  await expect(section.getByRole('status')).toContainText('Brak aktualnej trasy');
  data.directions = makeDelayMap().directions;
  data.directions.forEach(direction => direction.segments.forEach(segment => { segment.delays = []; }));
  await page.reload();
  await expect(section.locator('.delay-map-segment')).toHaveCount(3);
  await expect(section.getByRole('status')).toContainText('Brak pomiarów');
  for (const segment of await section.locator('.delay-map-segment').all()) await expect(segment).toHaveAttribute('stroke', '#9ca3af');
});

for (const [status, body, message] of [
  [404, { error_code: 'RESOURCE_NOT_FOUND', message: "Line '304' not found" }, 'Nie znaleziono danych'],
  [404, { detail: 'Not Found' }, 'Nie znaleziono takiego zasobu API'],
  [422, { error_code: 'VALIDATION_ERROR', message: 'Date range cannot exceed 365 days' }, '365'],
  [422, { detail: [{ type: 'missing', loc: ['query', 'start_date'], msg: 'Field required', input: null }] }, 'wymagane'],
  [429, { error_code: 'RATE_LIMIT_EXCEEDED' }, 'Zbyt wiele'],
  [502, { error_code: 'EXTERNAL_SERVICE_ERROR' }, 'zależnym serwisem'],
  [503, { error_code: 'EXTERNAL_SERVICE_ERROR' }, 'zależnym serwisem'],
  [500, { error_code: 'INTERNAL_ERROR' }, 'Wewnętrzny błąd'],
] as const) {
  test(`handles HTTP ${status} (${JSON.stringify(body)}) without hiding other results`, async ({ page }) => {
    await page.route('**/stats/delay-map?*', route => route.fulfill({ status, json: body }));
    await page.goto(statsUrl);
    const section = page.getByRole('region', { name: 'Mapa przyrostu opóźnień', exact: true });
    await expect(section).toContainText(message);
    await expect(section.locator('.leaflet-container')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Punktualność', exact: true })).toBeVisible();
  });
}

test('supports English, a narrow viewport, and changing the theme without a request', async ({ page, apiRequests }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.addInitScript(() => localStorage.setItem('krk-transit-language', 'en'));
  await page.goto(statsUrl);
  const section = page.getByRole('region', { name: 'Delay growth map', exact: true });
  await expect(section.getByLabel('Time band')).toBeVisible();
  await expect(section.getByRole('option')).toHaveCount(6);
  await expect(section).toContainText('Average delay growth');
  await page.getByRole('button', { name: /Switch to .* theme/ }).click();
  await expect(section.locator('.delay-map-segment')).toHaveCount(3);
  expect(apiRequests.filter(url => url.includes('/delay-map'))).toHaveLength(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('a late response cannot replace a newer search', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const data = makeDelayMap();
  data.directions[0].headsign = 'Nowa trasa';
  await page.route('**/stats/delay-map?*', async route => {
    if (route.request().url().includes('/304/')) {
      await gate;
      await route.fulfill({ json: makeDelayMap() });
    } else await route.fulfill({ json: { ...data, line_number: '139' } });
  });
  await page.goto(statsUrl);
  await page.getByLabel('Numer linii', { exact: true }).fill('139');
  await page.getByRole('button', { name: 'Szukaj', exact: true }).click();
  const direction = page.getByRole('button', { name: 'Kierunek 1 · Nowa trasa' });
  await expect(direction).toBeVisible();
  const oldResponse = page.waitForResponse(response => response.url().includes('/304/stats/delay-map'));
  release();
  await oldResponse;
  await expect(direction).toBeVisible();
  await expect(page.getByRole('button', { name: 'Kierunek 1 · Przystanek D' })).toHaveCount(0);
});

test('a failed map can be retried by submitting the same search', async ({ page }) => {
  let calls = 0;
  await page.route('**/stats/delay-map?*', route => {
    calls++;
    return calls === 1
      ? route.abort('failed')
      : route.fulfill({ json: makeDelayMap() });
  });
  await page.goto(statsUrl);
  const section = page.getByRole('region', { name: 'Mapa przyrostu opóźnień', exact: true });
  await expect(section).toContainText('Nie udało się połączyć');
  expect(calls).toBe(1);
  await page.getByRole('button', { name: 'Szukaj', exact: true }).click();
  await expect(section.locator('.delay-map-segment')).toHaveCount(3);
  expect(calls).toBe(2);
});

test('keeps the route usable with a single-point segment returned by the deployed API', async ({ page }) => {
  const data = makeDelayMap();
  data.directions[0].segments[0].points = [[50.03, 19.96]];
  await page.route('**/stats/delay-map?*', route => route.fulfill({ json: data }));
  await page.goto(statsUrl);
  await expect(page.locator('.delay-map-segment')).toHaveCount(3);
  await expect(page.locator('.delay-map-stop-hit')).toHaveCount(4);
  await page.getByRole('combobox').selectOption('MORNING');
  await expect(page.locator('.delay-map-segment').nth(1)).toHaveAttribute('stroke', '#16a34a');
});
