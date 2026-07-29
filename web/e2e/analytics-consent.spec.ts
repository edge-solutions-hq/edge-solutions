import {
  ANALYTICS_CONSENT_STORAGE_KEY,
  expect,
  expectNoOptionalRuntime,
  guardBrowserNetwork,
  optionalAnalyticsKind,
  test,
} from './fixtures';

test('undecided visitors produce no optional load or conversion emission', async ({page}) => {
  const network = await guardBrowserNetwork(page);

  await page.goto('/fr');
  await expect(page.getByRole('region', {name: 'Mesures optionnelles'})).toBeVisible();
  await expectNoOptionalRuntime(page, network);

  await page.getByRole('main').getByRole('link', {name: 'IA & automatisation', exact: true}).click();
  await expect(page).toHaveURL(/\/fr\/services\/ai-automation$/);
  await expectNoOptionalRuntime(page, network);
});

test('acceptance persists, enables configured runtimes, and withdrawal disables them', async ({page}) => {
  const network = await guardBrowserNetwork(page);

  await page.goto('/en');
  await expectNoOptionalRuntime(page, network);
  await page.getByRole('button', {name: 'Accept', exact: true}).click();

  await expect.poll(() => new Set(
    network.optionalRequests.map(optionalAnalyticsKind).filter(Boolean)
  ).size).toBe(3);
  await expect.poll(() => page.evaluate(() => ({
    dataLayer: Array.isArray(window.dataLayer),
    gtag: typeof window.gtag === 'function',
    va: typeof window.va === 'function',
    si: typeof window.si === 'function',
  }))).toEqual({dataLayer: true, gtag: true, va: true, si: true});

  await page.getByRole('main').getByRole('link', {name: 'AI systems & automation', exact: true}).click();
  await expect.poll(() => page.evaluate(() =>
    (window.dataLayer ?? []).some((entry) => entry.event === 'service_card_click')
  )).toBe(true);

  network.optionalRequests.length = 0;
  await page.reload();
  await expect(page.getByRole('region', {name: 'Optional measurement'})).toHaveCount(0);
  await expect.poll(() => new Set(
    network.optionalRequests.map(optionalAnalyticsKind).filter(Boolean)
  ).size).toBe(3);

  await page.getByRole('button', {name: 'Analytics settings'}).click();
  await expect(page.getByRole('region', {name: 'Analytics settings'})).toBeVisible();
  network.optionalRequests.length = 0;
  const reloaded = page.waitForEvent('load');
  await page.getByRole('button', {name: 'Disable measurement'}).click();
  await reloaded;

  await expect.poll(() => page.evaluate(
    (key) => window.localStorage.getItem(key),
    ANALYTICS_CONSENT_STORAGE_KEY
  )).toBe('rejected');
  await expectNoOptionalRuntime(page, network);

  await page.locator('header').getByRole('link', {name: 'Contact me', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoOptionalRuntime(page, network);
  expect(network.unexpectedExternalRequests).toEqual([]);
});

test('rejection persists while essential navigation and contact remain available', async ({page}) => {
  const network = await guardBrowserNetwork(page);

  await page.goto('/nl');
  await page.getByRole('button', {name: 'Weigeren', exact: true}).click();
  await expect.poll(() => page.evaluate(
    (key) => window.localStorage.getItem(key),
    ANALYTICS_CONSENT_STORAGE_KEY
  )).toBe('rejected');
  await expectNoOptionalRuntime(page, network);

  await page.reload();
  await expect(page.getByRole('region', {name: 'Optionele meting'})).toHaveCount(0);
  await page.getByRole('main').getByRole('link', {name: 'AI-systemen & automatisatie', exact: true}).click();
  await expect(page).toHaveURL(/\/nl\/services\/ai-automation$/);
  await page.locator('header').getByRole('link', {name: 'Contacteer mij', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoOptionalRuntime(page, network);
});
