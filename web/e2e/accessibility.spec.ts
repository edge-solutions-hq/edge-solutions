import AxeBuilder from '@axe-core/playwright';
import {
  expect,
  guardBrowserNetwork,
  seedRejectedConsent,
  test,
} from './fixtures';

const pageFamilies = [
  ['home', '/fr'],
  ['services index', '/fr/services'],
  ['service detail', '/fr/services/ai-automation'],
  ['contact', '/fr/contact'],
  ['static', '/fr/privacy-policy'],
] as const;

for (const [family, path] of pageFamilies) {
  test(`${family} page has no automated WCAG A/AA violations`, async ({page}, testInfo) => {
    await seedRejectedConsent(page);
    const network = await guardBrowserNetwork(page);
    await page.goto(path);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();

    const results = await new AxeBuilder({page})
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    await testInfo.attach(`axe-${family.replaceAll(' ', '-')}`, {
      body: Buffer.from(JSON.stringify(results, null, 2)),
      contentType: 'application/json',
    });

    const diagnostics = results.violations.map((violation) => [
      `${violation.id} (${violation.impact ?? 'unknown impact'})`,
      violation.helpUrl,
      ...violation.nodes.map((node) => `  ${node.target.join(' > ')}`),
    ].join('\n'));

    expect(diagnostics, `axe violations on ${family}`).toEqual([]);
    expect(network.optionalRequests).toEqual([]);
    expect(network.unexpectedExternalRequests).toEqual([]);
  });
}
