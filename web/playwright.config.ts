import {randomUUID} from 'node:crypto';
import {defineConfig, devices} from '@playwright/test';
import {BROWSER_HARNESS_HEADER} from './src/lib/contact/browser-harness';

const port = 3100;
const baseURL = `http://127.0.0.1:${port}`;
const browserHarnessToken = process.env.PLAYWRIGHT_TEST_TOKEN ?? randomUUID();
process.env.PLAYWRIGHT_TEST_TOKEN = browserHarnessToken;

export default defineConfig({
  testDir: './e2e',
  outputDir: 'test-results',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', {open: 'never', outputFolder: 'playwright-report'}]]
    : [['list'], ['html', {open: 'never', outputFolder: 'playwright-report'}]],
  use: {
    baseURL,
    extraHTTPHeaders: {
      [BROWSER_HARNESS_HEADER]: browserHarnessToken,
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  webServer: {
    command: `corepack pnpm exec next start --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: false,
    env: {
      ...process.env,
      PLAYWRIGHT_TEST: '1',
      PLAYWRIGHT_TEST_TOKEN: browserHarnessToken,
      RESEND_API_KEY: 'playwright-no-io-key',
      RESEND_FROM_EMAIL: 'Edge Browser Test <browser@example.test>',
      RESEND_TO_EMAIL: 'inbox@example.test',
      NEXT_TELEMETRY_DISABLED: '1',
    },
  },
});
