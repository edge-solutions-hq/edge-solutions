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

  await page.getByRole('main').getByRole('link', {name: /^IA & automatisation/}).click();
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

test('analytics settings choices restore focus to the footer trigger', async ({page}) => {
  await guardBrowserNetwork(page);
  await page.addInitScript(
    ({key}) => window.localStorage.setItem(key, 'rejected'),
    {key: ANALYTICS_CONSENT_STORAGE_KEY}
  );

  await page.goto('/en');
  const settingsTrigger = page.getByRole('button', {name: 'Analytics settings'});

  await settingsTrigger.click();
  await page.getByRole('button', {name: 'Reject', exact: true}).click();
  await expect(settingsTrigger).toBeFocused();

  await settingsTrigger.click();
  await page.getByRole('button', {name: 'Accept', exact: true}).click();
  await expect(settingsTrigger).toBeFocused();
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

  await page.getByRole('main').getByRole('link', {name: /^AI systems & automation/}).click();
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

test('failed withdrawal persistence survives reload and blocks stale acceptance', async ({page}) => {
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

  await page.evaluate(({key}) => {
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    Storage.prototype.setItem = function (storageKey, value) {
      if (
        this === window.localStorage &&
        storageKey === key &&
        value === 'rejected'
      ) {
        throw new DOMException('Storage is blocked', 'SecurityError');
      }
      return originalSetItem.call(this, storageKey, value);
    };
    Storage.prototype.removeItem = function (storageKey) {
      if (this === window.localStorage && storageKey === key) {
        throw new DOMException('Storage is blocked', 'SecurityError');
      }
      return originalRemoveItem.call(this, storageKey);
    };
  }, {key: ANALYTICS_CONSENT_STORAGE_KEY});

  network.optionalRequests.length = 0;
  const reloaded = page.waitForEvent('load');
  await page.getByRole('button', {name: 'Disable measurement'}).click();
  await reloaded;
  await expect.poll(() => page.evaluate(
    (key) => window.localStorage.getItem(key),
    ANALYTICS_CONSENT_STORAGE_KEY
  )).toBe('accepted');
  await expect.poll(() => page.evaluate(
    (key) => window.sessionStorage.getItem(key),
    ANALYTICS_CONSENT_STORAGE_KEY
  )).toBe('rejected');
  await page.getByRole('button', {name: 'Analytics settings'}).click();
  await expect(page.getByText(
    'Optional measurement is disabled. You can allow it at any time.'
  )).toBeVisible();
  await expectNoOptionalRuntime(page, network);

  await page.locator('header').getByRole('link', {name: 'Contact me', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoOptionalRuntime(page, network);
});

test('withdrawing in another page blocks the previously accepted page', async ({page, context}) => {
  const acceptedPageNetwork = await guardBrowserNetwork(page);

  await page.goto('/en');
  await page.getByRole('button', {name: 'Accept', exact: true}).click();
  await expect.poll(() => new Set(
    acceptedPageNetwork.optionalRequests.map(optionalAnalyticsKind).filter(Boolean)
  ).size).toBe(3);

  const withdrawingPage = await context.newPage();
  const withdrawingPageNetwork = await guardBrowserNetwork(withdrawingPage);
  await withdrawingPage.goto('/en');
  await expect.poll(() => new Set(
    withdrawingPageNetwork.optionalRequests.map(optionalAnalyticsKind).filter(Boolean)
  ).size).toBe(3);
  const settingsTrigger = page.getByRole('button', {name: 'Analytics settings'});
  await settingsTrigger.click();
  await page.getByRole('button', {name: 'Disable measurement'}).focus();
  await withdrawingPage.getByRole('button', {name: 'Analytics settings'}).click();
  const reloaded = withdrawingPage.waitForEvent('load');
  await withdrawingPage.getByRole('button', {name: 'Disable measurement'}).click();
  await reloaded;

  await expect(settingsTrigger).toBeFocused();
  await expect.poll(() => page.evaluate(() => {
    const googleWindow = window as unknown as Window & Record<string, unknown>;
    return googleWindow['ga-disable-G-PLAYWRIGHT'];
  })).toBe(true);
  await settingsTrigger.click();
  await expect(page.getByText(
    'Optional measurement is disabled. You can allow it at any time.'
  )).toBeVisible();

  const transportGates = await page.evaluate(() => {
    const analyticsWindow = window as unknown as Window & {
      __googleHarness: {delivered: string[]; suppressed: string[]};
      vaq?: Array<[string, unknown?]>;
      siq?: Array<[string, unknown?]>;
    };
    const analyticsBeforeSend = analyticsWindow.vaq?.find(
      ([command]) => command === 'beforeSend'
    )?.[1] as ((event: object) => object | null) | undefined;
    const speedBeforeSend = analyticsWindow.siq?.find(
      ([command]) => command === 'beforeSend'
    )?.[1] as ((event: object) => object | null) | undefined;
    window.gtag?.('event', 'cross_tab_withdrawal_probe');

    return {
      googleDelivered: analyticsWindow.__googleHarness.delivered.includes(
        'cross_tab_withdrawal_probe'
      ),
      googleSuppressed: analyticsWindow.__googleHarness.suppressed.includes(
        'cross_tab_withdrawal_probe'
      ),
      vercelAnalytics: analyticsBeforeSend?.({}),
      vercelSpeed: speedBeforeSend?.({}),
    };
  });
  expect(transportGates).toEqual({
    googleDelivered: false,
    googleSuppressed: true,
    vercelAnalytics: null,
    vercelSpeed: null,
  });

  const emissionsBefore = await page.evaluate(() => ({
    configs: (window.dataLayer ?? []).filter((entry) => {
      const args = Array.from(entry as unknown as ArrayLike<unknown>);
      return args[0] === 'config';
    }).length,
    conversions: (window.dataLayer ?? []).filter(
      (entry) => entry.event === 'service_card_click'
    ).length,
  }));
  acceptedPageNetwork.optionalRequests.length = 0;
  await page.getByRole('button', {name: 'Close'}).click();
  await page.getByRole('main').getByRole('link', {name: /^AI systems & automation/}).click();
  await expect(page).toHaveURL(/\/en\/services\/ai-automation$/);

  await expect.poll(() => page.evaluate(() => ({
    configs: (window.dataLayer ?? []).filter((entry) => {
      const args = Array.from(entry as unknown as ArrayLike<unknown>);
      return args[0] === 'config';
    }).length,
    conversions: (window.dataLayer ?? []).filter(
      (entry) => entry.event === 'service_card_click'
    ).length,
  }))).toEqual(emissionsBefore);
  expect(acceptedPageNetwork.optionalRequests).toEqual([]);
  expect(acceptedPageNetwork.unexpectedExternalRequests).toEqual([]);
});

test('clearing storage in another page withdraws consent', async ({page, context}) => {
  const network = await guardBrowserNetwork(page);

  await page.goto('/en');
  await page.getByRole('button', {name: 'Accept', exact: true}).click();
  await expect.poll(() => new Set(
    network.optionalRequests.map(optionalAnalyticsKind).filter(Boolean)
  ).size).toBe(3);

  const clearingPage = await context.newPage();
  await clearingPage.goto('/en');
  await clearingPage.evaluate(() => window.localStorage.clear());

  await expect(page.getByRole('region', {name: 'Optional measurement'})).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const googleWindow = window as unknown as Window & Record<string, unknown>;
    return googleWindow['ga-disable-G-PLAYWRIGHT'];
  })).toBe(true);

  const emissionsBefore = await page.evaluate(() => (
    window.dataLayer ?? []
  ).filter((entry) => entry.event === 'service_card_click').length);
  await page.getByRole('main').getByRole('link', {name: /^AI systems & automation/}).click();
  await expect(page).toHaveURL(/\/en\/services\/ai-automation$/);
  await expect.poll(() => page.evaluate(() => (
    window.dataLayer ?? []
  ).filter((entry) => entry.event === 'service_card_click').length)).toBe(emissionsBefore);
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
  await page.getByRole('main').getByRole('link', {name: /^AI-systemen & automatisatie/}).click();
  await expect(page).toHaveURL(/\/nl\/services\/ai-automation$/);
  await page.locator('header').getByRole('link', {name: 'Contacteer mij', exact: true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoOptionalRuntime(page, network);
});
