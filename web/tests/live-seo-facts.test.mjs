import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {getLiveSeoSourceFacts} from '../scripts/seo-source-facts.mjs';

const root = path.resolve(import.meta.dirname, '..');

function copyFixtureFile(fixtureRoot, relativePath) {
  const sourcePath = path.join(root, relativePath);
  const fixturePath = path.join(fixtureRoot, relativePath);

  mkdirSync(path.dirname(fixturePath), {recursive: true});
  copyFileSync(sourcePath, fixturePath);
}

function withSourceFixture(mutate) {
  const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'edge-seo-source-facts-'));
  const sourceFiles = [
    'src/lib/site/site.ts',
    'src/i18n/routing.ts',
    'src/lib/site/seo.ts',
    'src/lib/site/page-profiles.ts',
    'src/lib/offer/offer-tracks.ts',
  ];
  const facts = getLiveSeoSourceFacts({root});

  try {
    for (const relativePath of sourceFiles) {
      copyFixtureFile(fixtureRoot, relativePath);
    }

    for (const locale of facts.locales) {
      for (const slug of facts.serviceSlugs) {
        copyFixtureFile(fixtureRoot, `src/content/${locale}/services/${slug}.mdx`);
      }
    }

    mutate({fixtureRoot, facts});
    return getLiveSeoSourceFacts({root: fixtureRoot});
  } finally {
    rmSync(fixtureRoot, {recursive: true, force: true});
  }
}

function rewriteMdxMetadata(relativePath, field, value, fixtureRoot) {
  const filePath = path.join(fixtureRoot, relativePath);
  const source = readFileSync(filePath, 'utf8');
  const nextSource = source.replace(
    new RegExp(`(\\b${field}\\s*:\\s*)(['"])([\\s\\S]*?)\\2`),
    `$1${JSON.stringify(value)}`
  );

  assert.notEqual(nextSource, source, `${relativePath} ${field} was not rewritten`);
  writeFileSync(filePath, nextSource);
}

describe('live SEO source facts', () => {
  it('rejects empty localized service titles and meta descriptions', () => {
    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot}) => {
          rewriteMdxMetadata('src/content/fr/services/ai-automation.mdx', 'title', '   ', fixtureRoot);
        }),
      /\/fr\/services\/ai-automation has empty localized service title/
    );

    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot}) => {
          rewriteMdxMetadata('src/content/nl/services/realtime-games.mdx', 'description', '   ', fixtureRoot);
        }),
      /\/nl\/services\/realtime-games has empty localized service description/
    );
  });

  it('rejects duplicated localized service titles and meta descriptions', () => {
    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot, facts}) => {
          const existingTitle = facts.serviceMetadataChecks.find(
            (route) => route.path === '/fr/services/ai-automation'
          ).title;
          rewriteMdxMetadata('src/content/en/services/realtime-games.mdx', 'title', existingTitle, fixtureRoot);
        }),
      /Duplicate localized service title metadata:/
    );

    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot, facts}) => {
          const existingDescription = facts.serviceMetadataChecks.find(
            (route) => route.path === '/en/services/ai-automation'
          ).description;
          rewriteMdxMetadata(
            'src/content/nl/services/realtime-games.mdx',
            'description',
            existingDescription,
            fixtureRoot
          );
        }),
      /Duplicate localized service description metadata:/
    );
  });

  it('rejects fallback-looking localized service metadata for the full FR/EN/NL route family', () => {
    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot}) => {
          rewriteMdxMetadata('src/content/fr/services/realtime-games.mdx', 'title', 'realtime-games', fixtureRoot);
        }),
      /\/fr\/services\/realtime-games has fallback-looking localized service title/
    );

    assert.throws(
      () =>
        withSourceFixture(({fixtureRoot, facts}) => {
          const fallbackDescription = facts.serviceMetadataChecks.find(
            (route) => route.path === '/fr/services/ai-automation'
          ).description;
          rewriteMdxMetadata(
            'src/content/en/services/ai-automation.mdx',
            'description',
            fallbackDescription,
            fixtureRoot
          );
        }),
      /\/en\/services\/ai-automation has fallback-looking localized service description: it matches \/fr\/services\/ai-automation/
    );
  });
});
