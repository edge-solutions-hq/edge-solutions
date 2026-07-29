import {expect, test as base, type Page} from '@playwright/test';
import {ANALYTICS_CONSENT_STORAGE_KEY} from '../src/lib/analytics/consent';

const appOrigin = 'http://127.0.0.1:3100';

function googleHarnessScript(urlString: string) {
  const measurementId = new URL(urlString).searchParams.get('id');
  return `
    window.dataLayer = window.dataLayer || [];
    window.__googleHarness = {delivered: [], suppressed: []};
    const originalPush = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = function (...items) {
      for (const item of items) {
        const args = item && typeof item.length === 'number'
          ? Array.from(item)
          : [];
        const eventName = item && typeof item.event === 'string'
          ? item.event
          : args[0] === 'event' ? args[1] : undefined;
        if (typeof eventName === 'string') {
          const target = window['ga-disable-' + ${JSON.stringify(measurementId)}]
            ? window.__googleHarness.suppressed
            : window.__googleHarness.delivered;
          target.push(eventName);
        }
      }
      return originalPush(...items);
    };
  `;
}

export {expect, ANALYTICS_CONSENT_STORAGE_KEY};

export type NetworkEvidence = {
  optionalRequests: string[];
  unexpectedExternalRequests: string[];
};

export function optionalAnalyticsKind(urlString: string) {
  const url = new URL(urlString);
  if (url.hostname === 'www.googletagmanager.com') return 'google';
  if (url.pathname.startsWith('/_vercel/insights/')) return 'vercel-analytics';
  if (url.pathname.startsWith('/_vercel/speed-insights/')) return 'vercel-speed';
  return undefined;
}

export async function guardBrowserNetwork(page: Page): Promise<NetworkEvidence> {
  const evidence: NetworkEvidence = {
    optionalRequests: [],
    unexpectedExternalRequests: [],
  };

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = request.url();
    const optionalKind = optionalAnalyticsKind(url);

    if (optionalKind) {
      evidence.optionalRequests.push(url);
      await route.fulfill({
        status: request.resourceType() === 'script' ? 200 : 204,
        contentType: request.resourceType() === 'script'
          ? 'application/javascript'
          : 'text/plain',
        body: url.includes('googletagmanager.com/gtag/js')
          ? googleHarnessScript(url)
          : '',
      });
      return;
    }

    if (new URL(url).origin !== appOrigin) {
      evidence.unexpectedExternalRequests.push(url);
      await route.abort('blockedbyclient');
      return;
    }

    await route.continue();
  });

  return evidence;
}

export async function seedRejectedConsent(page: Page) {
  await page.addInitScript(
    ({key}) => window.localStorage.setItem(key, 'rejected'),
    {key: ANALYTICS_CONSENT_STORAGE_KEY}
  );
}

export async function expectNoOptionalRuntime(
  page: Page,
  evidence: NetworkEvidence
) {
  expect(evidence.optionalRequests, 'optional analytics requests').toEqual([]);
  expect(evidence.unexpectedExternalRequests, 'unexpected external requests').toEqual([]);
  await expect.poll(() => page.evaluate(() => ({
    dataLayer: 'dataLayer' in window,
    gtag: 'gtag' in window,
    va: 'va' in window || 'vaq' in window,
    si: 'si' in window || 'siq' in window,
    optionalScripts: Array.from(document.scripts).filter((script) =>
      script.src.includes('googletagmanager.com/gtag/js') ||
      script.src.includes('/_vercel/insights/script.js') ||
      script.src.includes('/_vercel/speed-insights/script.js')
    ).length,
  }))).toEqual({
    dataLayer: false,
    gtag: false,
    va: false,
    si: false,
    optionalScripts: 0,
  });
}

export const test = base.extend<{diagnostics: void}>({
  diagnostics: [async ({page}, use, testInfo) => {
    const diagnostics: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') diagnostics.push(`console: ${message.text()}`);
    });
    page.on('pageerror', (error) => diagnostics.push(`pageerror: ${error.message}`));
    page.on('requestfailed', (request) => {
      diagnostics.push(
        `requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`
      );
    });

    await use();

    if (testInfo.status !== testInfo.expectedStatus && diagnostics.length > 0) {
      await testInfo.attach('browser-diagnostics', {
        body: Buffer.from(diagnostics.join('\n')),
        contentType: 'text/plain',
      });
    }
  }, {auto: true}],
});
