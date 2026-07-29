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

test('storage getter failure keeps acceptance fail closed', async ({page}) => {
  const network = await guardBrowserNetwork(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage is blocked', 'SecurityError');
      },
    });
  });

  await page.goto('/en');
  const consentRegion = page.getByRole('region', {name: 'Optional measurement'});
  await expect(consentRegion).toBeVisible();
  await page.getByRole('button', {name: 'Accept', exact: true}).click();

  await expect(consentRegion).toBeVisible();
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
  await page.evaluate(({key, measurementId}) => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (storageKey, value) {
      const result = originalSetItem.call(this, storageKey, value);
      if (storageKey !== key || value !== 'rejected') return result;

      const googleWindow = window as unknown as Window & Record<string, unknown>;
      const dataLayer = window.dataLayer ?? [];
      const denied = dataLayer.some((entry) => {
        const args = Array.from(entry as unknown as ArrayLike<unknown>);
        return args[0] === 'consent' &&
          args[1] === 'update' &&
          (args[2] as {analytics_storage?: string})?.analytics_storage === 'denied';
      });
      window.gtag?.('event', 'withdrawal_probe');
      const harness = googleWindow.__googleHarness as {
        delivered: string[];
        suppressed: string[];
      };
      window.sessionStorage.setItem('withdrawal-evidence', JSON.stringify({
        disabled: googleWindow[`ga-disable-${measurementId}`] === true,
        denied,
        delivered: harness.delivered.includes('withdrawal_probe'),
        suppressed: harness.suppressed.includes('withdrawal_probe'),
      }));
      return result;
    };
  }, {key: ANALYTICS_CONSENT_STORAGE_KEY, measurementId: 'G-PLAYWRIGHT'});
  network.optionalRequests.length = 0;
  const reloaded = page.waitForEvent('load');
  await page.getByRole('button', {name: 'Disable measurement'}).click();
  await reloaded;

  await expect.poll(() => page.evaluate(
    (key) => window.localStorage.getItem(key),
    ANALYTICS_CONSENT_STORAGE_KEY
  )).toBe('rejected');
  await expect.poll(() => page.evaluate(() => JSON.parse(
    window.sessionStorage.getItem('withdrawal-evidence') ?? 'null'
  ))).toEqual({
    disabled: true,
    denied: true,
    delivered: false,
    suppressed: true,
  });
  await expectNoOptionalRuntime(page, network);

  await page.locator('header').getByRole('link', {name: 'Contact me', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoOptionalRuntime(page, network);
  expect(network.unexpectedExternalRequests).toEqual([]);
});

test('failed withdrawal persistence blocks the session without reloading', async ({page}) => {
  const network = await guardBrowserNetwork(page);
  await page.addInitScript(
    ({key}) => window.localStorage.setItem(key, 'accepted'),
    {key: ANALYTICS_CONSENT_STORAGE_KEY}
  );

  await page.goto('/en');
  await expect.poll(() => new Set(
    network.optionalRequests.map(optionalAnalyticsKind).filter(Boolean)
  ).size).toBe(3);
  await page.getByRole('button', {name: 'Analytics settings'}).click();

  const documentMarker = await page.evaluate(({key}) => {
    const marker = crypto.randomUUID();
    const browserWindow = window as unknown as Window & Record<string, unknown>;
    browserWindow.__documentMarker = marker;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (storageKey, value) {
      if (storageKey === key && value === 'rejected') {
        throw new DOMException('Storage is blocked', 'SecurityError');
      }
      return originalSetItem.call(this, storageKey, value);
    };
    return marker;
  }, {key: ANALYTICS_CONSENT_STORAGE_KEY});

  await page.getByRole('button', {name: 'Disable measurement'}).click();
  await expect.poll(() => page.evaluate(
    () => (window as unknown as Window & Record<string, unknown>).__documentMarker
  )).toBe(documentMarker);
  await expect.poll(() => page.evaluate(
    (key) => window.localStorage.getItem(key),
    ANALYTICS_CONSENT_STORAGE_KEY
  )).toBe('accepted');

  const googleEvidence = await page.evaluate(() => {
    const googleWindow = window as unknown as Window & Record<string, unknown>;
    const harness = googleWindow.__googleHarness as {
      delivered: string[];
      suppressed: string[];
    };
    const denied = (window.dataLayer ?? []).some((entry) => {
      const args = Array.from(entry as unknown as ArrayLike<unknown>);
      return args[0] === 'consent' && args[1] === 'update' &&
        (args[2] as {analytics_storage?: string})?.analytics_storage === 'denied';
    });
    window.gtag?.('event', 'failed_withdrawal_probe');
    return {
      disabled: googleWindow['ga-disable-G-PLAYWRIGHT'] === true,
      denied,
      delivered: harness.delivered.includes('failed_withdrawal_probe'),
      suppressed: harness.suppressed.includes('failed_withdrawal_probe'),
    };
  });
  expect(googleEvidence).toEqual({
    disabled: true,
    denied: true,
    delivered: false,
    suppressed: true,
  });

  const contactEventsBefore = await page.evaluate(() => (
    window.dataLayer ?? []
  ).filter((entry) => entry.event === 'contact_cta_click').length);
  await page.locator('header').getByRole('link', {name: 'Contact me', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect.poll(() => page.evaluate(() => (
    window.dataLayer ?? []
  ).filter((entry) => entry.event === 'contact_cta_click').length)).toBe(contactEventsBefore);
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
