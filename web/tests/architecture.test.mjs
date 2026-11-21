import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
register('./ts-extension-resolver.mjs', import.meta.url);

const {LOCALES} = await import('../src/i18n/routing.ts');
const {OFFER_TRACKS} = await import('../src/lib/offer/offer-tracks.ts');
const offerPresentation = await import('../src/lib/offer/offer-presentation.ts');
const {OFFER_TRACK_EVIDENCE_PROFILES: evidenceProfiles} = await import(
  '../src/lib/content/service-evidence-registry.ts'
);
const taxonomy = await import('../src/lib/analytics/taxonomy.ts');
const {contactOfferValues} = await import('../src/lib/contact/options.ts');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sourceFiles(relativeDir) {
  return readdirSync(path.join(root, relativeDir), {recursive: true})
    .filter((file) => /\.(ts|tsx|mjs)$/.test(file))
    .map((file) => path.join(relativeDir, file));
}

function messageAt(messages, dottedKey) {
  return dottedKey.split('.').reduce((value, key) => value?.[key], messages);
}

function messageKeyPaths(value, prefix = '') {
  if (Array.isArray(value) || value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    messageKeyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
}

function countMdxPropArrayItems(source, propName) {
  const match = source.match(new RegExp(`${propName}=\\{\\[([\\s\\S]*?)\\]\\}`, 'm'));
  if (!match) return 0;
  if (['columns', 'phases', 'signals', 'steps'].includes(propName)) {
    return [...match[1].matchAll(/\n\s*\{\s*(?:\n\s*)?label:/g)].length;
  }
  return [...match[1].matchAll(/\n\s*(?:\{|['"])/g)].length;
}

function countColumnPoints(source) {
  return [...source.matchAll(/points:\s*\[([\s\S]*?)\]/g)].reduce(
    (total, match) => total + [...match[1].matchAll(/\n\s*['"]/g)].length,
    0
  );
}

function normalizeContent(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'");
}

describe('offer track catalog', () => {
  it('leads with the single primary AI track and keeps realtime as supporting', () => {
    assert.equal(OFFER_TRACKS[0].slug, 'ai-automation');
    assert.equal(OFFER_TRACKS[0].priorityRole, 'primary');
    assert.ok(OFFER_TRACKS.some((track) => track.slug === 'realtime-games'));
    assert.ok(
      OFFER_TRACKS.slice(1).every((track) => track.priorityRole === 'supporting'),
      'only the first track may be primary'
    );
  });

  it('projects every offer surface in catalog order with primary emphasis only on the primary track', () => {
    const translate = (key) => key;
    const surfaces = {
      header: offerPresentation.getHeaderOfferNavItems(translate),
      home: offerPresentation.getHomeOfferCards(translate),
      servicesHub: offerPresentation.getServicesHubOfferCards(translate),
      decisions: offerPresentation.getServicesDecisionItems(translate),
    };

    for (const [surface, items] of Object.entries(surfaces)) {
      assert.deepEqual(
        items.map((item) => [item.slug, item.isPrimary]),
        OFFER_TRACKS.map((track) => [track.slug, track.priorityRole === 'primary']),
        `${surface} offer order or emphasis drifted from the catalog`
      );
    }
  });

  it('keeps route and UI code from rebuilding offer order outside the presentation seam', () => {
    const offenders = [...sourceFiles('src/app'), ...sourceFiles('src/components')]
      .filter((file) => /\bOFFER_TRACKS\b/.test(read(file)));

    assert.deepEqual(offenders, [], 'use src/lib/offer/offer-presentation.ts instead of OFFER_TRACKS');
  });

  it('has every offer track message in every locale', () => {
    for (const locale of LOCALES) {
      const messages = readJson(`messages/${locale}.json`);
      for (const track of OFFER_TRACKS) {
        for (const key of [
          track.navKey,
          track.titleKey,
          track.descriptionKey,
          track.hubTriggerKey,
          track.hubDescriptionKey,
          track.hubCheckKey,
          track.decisionKey,
        ]) {
          assert.equal(typeof messageAt(messages, key), 'string', `${locale} ${key}`);
        }
      }
    }
  });

  it('keeps EN and NL message keys identical to French', () => {
    const referenceKeys = messageKeyPaths(readJson('messages/fr.json')).sort();

    for (const locale of LOCALES.filter((item) => item !== 'fr')) {
      assert.deepEqual(
        messageKeyPaths(readJson(`messages/${locale}.json`)).sort(),
        referenceKeys,
        `${locale} message keys must match French`
      );
    }
  });
});

describe('localized service content', () => {
  it('has localized MDX content, metadata, evidence module, and CTA for each offer track', () => {
    for (const locale of LOCALES) {
      for (const track of OFFER_TRACKS) {
        const evidence = evidenceProfiles.find((profile) => profile.slug === track.slug);
        assert.ok(evidence, `${track.slug} missing evidence profile`);
        const filePath = `src/content/${locale}/services/${track.slug}.mdx`;
        assert.ok(existsSync(path.join(root, filePath)), `${filePath} missing`);
        const source = read(filePath);
        assert.match(source, /export const metadata = \{/, `${filePath} missing metadata`);
        assert.match(source, new RegExp(`<${evidence.evidenceModule}\\b`), `${filePath} missing ${evidence.evidenceModule}`);
        assert.ok(source.includes(evidence.imagePath), `${filePath} missing evidence image`);
        assert.match(source, /<CTA\b/, `${filePath} missing CTA`);

        for (const [propName, expectedCount] of Object.entries(evidence.structuralCounts)) {
          const actualCount = propName === 'columnPoints'
            ? countColumnPoints(source)
            : countMdxPropArrayItems(source, propName);
          assert.equal(actualCount, expectedCount, `${filePath} ${propName} count drifted`);
        }

        const normalizedSource = normalizeContent(source);
        for (const signal of evidence.requiredSignals) {
          assert.ok(
            signal.terms[locale].some((term) => normalizedSource.includes(normalizeContent(term))),
            `${filePath} missing evidence signal: ${signal.concept}`
          );
        }
      }
    }
  });
});

describe('analytics and contact contracts', () => {
  it('documents every runtime event, placement, scroll threshold, and contact service value', () => {
    const doc = read('../docs/analytics/conversion-event-taxonomy.md');
    const documented = [
      ...Object.values(taxonomy.analyticsEvents),
      ...taxonomy.contactCtaPlacements,
      ...taxonomy.offerTrackClickPlacements,
      ...contactOfferValues,
    ];

    for (const value of documented) {
      assert.ok(doc.includes(`\`${value}\``), `taxonomy docs missing ${value}`);
    }
    for (const threshold of taxonomy.scrollDepthThresholds) {
      assert.match(doc, new RegExp(`\\b${threshold}\\b`), `taxonomy docs missing scroll depth ${threshold}`);
    }
  });

  it('rate-limits contact submissions with the request headers', () => {
    assert.match(
      read('src/app/[locale]/contact/actions.ts'),
      /checkRateLimit\(CONTACT_RATE_LIMIT_ID, \{headers: requestHeaders\}\)/
    );
  });
});
