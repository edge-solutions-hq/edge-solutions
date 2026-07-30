export const BROWSER_HARNESS_HEADER = 'x-edge-browser-harness';

export type BrowserHarnessMode = 'production' | 'verified' | 'unverified';

export function isBrowserHarnessRequest({
  enabled,
  expectedToken,
  requestToken,
}: {
  enabled: string | undefined;
  expectedToken: string | undefined;
  requestToken: string | null;
}) {
  return (
    enabled === '1' &&
    Boolean(expectedToken) &&
    requestToken === expectedToken
  );
}

export function resolveBrowserHarnessMode({
  enabled,
  expectedToken,
  requestToken,
}: {
  enabled: string | undefined;
  expectedToken: string | undefined;
  requestToken: string | null;
}): BrowserHarnessMode {
  if (enabled !== '1') return 'production';
  return isBrowserHarnessRequest({enabled, expectedToken, requestToken})
    ? 'verified'
    : 'unverified';
}
