export const BROWSER_HARNESS_HEADER = 'x-edge-browser-harness';

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
