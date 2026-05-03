import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const locales = ['fr', 'en', 'nl'];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function extractObjectBlocks(source, arrayName) {
  const start = source.indexOf(`const ${arrayName}`) > -1
    ? source.indexOf(`const ${arrayName}`)
    : source.indexOf(`export const ${arrayName}`);
  assert.ok(start > -1, `${arrayName} not found`);
  const arrayStart = source.indexOf('[', start);
  const arrayEnd = source.indexOf('];', arrayStart);
  const body = source.slice(arrayStart + 1, arrayEnd);
  return [...body.matchAll(/\{([\s\S]*?)\n  \}/g)].map((match) => match[1]);
}

function extractStringProperty(block, key) {
  const match = block.match(new RegExp(`${key}: '([^']+)'`));
  return match?.[1] ?? '';
}

function extractConstStringValues(source, constName) {
  const match = source.match(new RegExp(`${constName}\\s*=\\s*(?:\\{|\\[)([\\s\\S]*?)(?:\\}|\\]) as const`));
  assert.ok(match, `${constName} not found`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
}

function extractConstNumberValues(source, constName) {
  const match = source.match(new RegExp(`${constName}\\s*=\\s*\\[([\\s\\S]*?)\\] as const`));
  assert.ok(match, `${constName} not found`);
  return [...match[1].matchAll(/\b(\d+)\b/g)].map((item) => item[1]);
}

function extractOfferTracks() {
  return extractObjectBlocks(read('src/lib/offer-tracks.ts'), 'OFFER_TRACKS').map((block) => ({
    slug: extractStringProperty(block, 'slug'),
    titleKey: extractStringProperty(block, 'titleKey').replace('services.', ''),
    descKey: extractStringProperty(block, 'descriptionKey').replace('services.', ''),
    hubKeys: [
      extractStringProperty(block, 'hubTriggerKey').replace('services.', ''),
      extractStringProperty(block, 'hubDescriptionKey').replace('services.', ''),
      extractStringProperty(block, 'hubProofKey').replace('services.', ''),
    ],
    decisionKey: extractStringProperty(block, 'decisionKey').replace('services.', ''),
    priorityRole: extractStringProperty(block, 'priorityRole'),
  }));
}

const offerTracks = extractOfferTracks();
const {OFFER_TRACK_PROOF_PROFILES: proofProfiles} = await import('../src/lib/content/proof-registry.ts');

function countArrayItems(source, propName) {
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
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, "'");
}

describe('offer track catalog seam', () => {
  it('keeps offer track identity and ordering in the catalog', () => {
    const source = read('src/lib/offer-tracks.ts');
    const first = source.indexOf("slug: 'ai-automation'");
    const second = source.indexOf("slug: 'web-dev'");
    const third = source.indexOf("slug: 'realtime-games'");

    assert.ok(first > -1, 'missing AI offer track');
    assert.ok(second > first, 'web track must follow AI track');
    assert.ok(third > second, 'realtime track must follow web track');
    assert.match(source, /priorityRole: 'primary'/, 'AI-first hierarchy should be explicit');
    assert.equal(offerTracks[0].priorityRole, 'primary');
  });

  it('wires public route modules through the catalog', () => {
    assert.match(read('src/lib/offer-presentation.ts'), /OFFER_TRACKS\.map/);
    assert.match(read('src/app/[locale]/page.tsx'), /getHomeOfferCards/);
    assert.match(read('src/app/[locale]/services/page.tsx'), /getServicesHubOfferCards/);
    assert.match(read('src/app/[locale]/services/page.tsx'), /getServicesDecisionItems/);
    assert.match(read('src/components/layout/Header.tsx'), /getHeaderOfferNavItems/);
    assert.doesNotMatch(read('src/app/[locale]/page.tsx'), /OFFER_TRACKS\.map/);
    assert.doesNotMatch(read('src/app/[locale]/services/page.tsx'), /OFFER_TRACKS\.map/);
    assert.doesNotMatch(read('src/components/layout/Header.tsx'), /OFFER_TRACKS\.map/);
    assert.match(read('src/app/sitemap.ts'), /getLocalizedSitemapEntries/);
    assert.match(read('src/lib/page-profiles.ts'), /OFFER_TRACKS/);
    assert.match(read('src/lib/content/services.ts'), /OFFER_TRACK_SLUGS/);
  });

  it('keeps localized message keys complete for every offer track', () => {
    for (const locale of locales) {
      const messages = readJson(`messages/${locale}.json`);
      for (const track of offerTracks) {
        assert.equal(typeof messages.services[track.titleKey], 'string', `${locale} ${track.titleKey}`);
        assert.equal(typeof messages.services[track.descKey], 'string', `${locale} ${track.descKey}`);
        assert.equal(typeof messages.services[track.decisionKey], 'string', `${locale} ${track.decisionKey}`);
        for (const key of track.hubKeys) {
          assert.equal(typeof messages.services[key], 'string', `${locale} ${key}`);
        }
      }
    }
  });
});

describe('localized content and proof seam', () => {
  it('has localized MDX content, metadata, proof profile, and CTA for each offer track', () => {
    assert.deepEqual(
      proofProfiles.map((profile) => profile.slug),
      offerTracks.map((track) => track.slug),
      'proof registry must match offer track catalog order'
    );

    for (const locale of locales) {
      for (const track of offerTracks) {
        const proof = proofProfiles.find((profile) => profile.slug === track.slug);
        assert.ok(proof, `${track.slug} missing proof profile`);
        assert.ok(proof.requiredSignals.length > 0, `${track.slug} missing proof signals`);
        const filePath = `src/content/${locale}/services/${track.slug}.mdx`;
        assert.ok(existsSync(path.join(root, filePath)), `${filePath} missing`);
        const source = read(filePath);
        assert.match(source, /export const metadata = \{/, `${filePath} missing metadata`);
        assert.match(source, new RegExp(`<${proof.proofModule}\\b`), `${filePath} missing ${proof.proofModule}`);
        assert.match(source, new RegExp(proof.imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${filePath} missing proof image`);
        assert.match(source, /<CTA\b/, `${filePath} missing CTA`);

        for (const [propName, expectedCount] of Object.entries(proof.structuralCounts)) {
          const actualCount = propName === 'columnPoints'
            ? countColumnPoints(source)
            : countArrayItems(source, propName);
          assert.equal(actualCount, expectedCount, `${filePath} ${propName} count drifted`);
        }

        const normalizedSource = normalizeContent(source);
        for (const signal of proof.requiredSignals) {
          const terms = signal.terms[locale];
          assert.ok(terms?.length, `${track.slug} missing ${locale} terms for ${signal.concept}`);
          assert.ok(
            terms.some((term) => normalizedSource.includes(normalizeContent(term))),
            `${filePath} missing proof signal: ${signal.concept}`
          );
        }
      }
    }

    assert.match(read('src/lib/content/services.ts'), /getOfferTrackProofProfile/);
    assert.match(read('src/lib/content/services.ts'), /renderPolicy/);
    assert.doesNotMatch(read('src/lib/content/services.ts'), /function getServiceMdx/);
    assert.match(read('src/app/[locale]/services/[slug]/page.tsx'), /renderPolicy\.requestedLocale/);
  });

  it('uses page profiles for metadata and JSON-LD graph selection', () => {
    assert.match(read('src/app/[locale]/page.tsx'), /getHomePageProfile/);
    assert.match(read('src/app/[locale]/services/page.tsx'), /getServicesPageProfile/);
    assert.match(read('src/app/[locale]/services/[slug]/page.tsx'), /getOfferTrackPageProfile/);
    assert.match(read('src/app/[locale]/contact/page.tsx'), /getContactPageProfile/);
  });
});

describe('contact intake and analytics taxonomy seams', () => {
  it('keeps honeypot submissions out of success conversion outcomes', () => {
    const deliverySource = read('src/lib/contact/delivery.ts');
    assert.match(deliverySource, /kind === 'spam'/);
    assert.match(deliverySource, /status: 'idle'/);
    assert.doesNotMatch(deliverySource, /status: 'success', message: 'OK'/);
  });

  it('keeps contact offer options and visible outcomes behind contact seams', () => {
    const intakeSource = read('src/lib/contact/intake.ts');
    const formSource = read('src/app/[locale]/contact/ContactForm.tsx');
    const deliverySource = read('src/lib/contact/delivery.ts');

    assert.match(intakeSource, /contactOfferOptions/);
    assert.match(formSource, /contactOfferOptions\.map/);
    assert.doesNotMatch(formSource, /<option value="ai"/);
    assert.match(deliverySource, /messageKey/);
    assert.match(formSource, /state\.messageKey \? t\(state\.messageKey\)/);
  });

  it('keeps contact attempt tracking outside the form Adapter', () => {
    const formSource = read('src/app/[locale]/contact/ContactForm.tsx');
    assert.match(formSource, /createContactAttemptTrackerState/);
    assert.match(formSource, /captureContactSubmitAttempt/);
    assert.match(formSource, /resolveContactAttemptCompletion/);
    assert.doesNotMatch(formSource, /submissionAttemptRef/);
    assert.doesNotMatch(formSource, /trackedAttemptRef/);
  });

  it('keeps tracked link target normalization in one navigation seam', () => {
    const buttonSource = read('src/components/ui/Button.tsx');
    const trackedLinkSource = read('src/components/ui/TrackedLink.tsx');

    assert.match(read('src/lib/navigation/tracked-link-target.ts'), /hrefToTrackedTarget/);
    assert.match(buttonSource, /tracked-link-target/);
    assert.match(trackedLinkSource, /tracked-link-target/);
    assert.doesNotMatch(buttonSource, /function queryValueToStrings/);
    assert.doesNotMatch(trackedLinkSource, /function queryValueToStrings/);
  });

  it('keeps scroll-depth decision logic outside the browser Adapter', () => {
    const trackerSource = read('src/components/analytics/ServiceScrollDepthTracker.tsx');
    assert.match(read('src/lib/analytics/service-scroll-depth.ts'), /calculateScrollDepthPercent/);
    assert.match(trackerSource, /service-scroll-depth/);
    assert.match(trackerSource, /trackServiceScrollDepth/);
    assert.match(read('src/lib/analytics/taxonomy.ts'), /scrollDepthThresholds/);
  });

  it('routes event taxonomy through named domain actions', () => {
    const eventsSource = read('src/lib/analytics/events.ts');
    const taxonomySource = read('src/lib/analytics/taxonomy.ts');
    for (const name of [
      'trackContactCtaClick',
      'trackOfferTrackClick',
      'trackLocaleSwitch',
      'trackServiceScrollDepth',
      'trackContactFormSubmit',
      'trackContactFormOutcome',
    ]) {
      assert.match(eventsSource, new RegExp(`export function ${name}\\b`), `${name} missing`);
    }

    assert.doesNotMatch(read('src/components/ui/Button.tsx'), /trackConversionEvent/);
    assert.doesNotMatch(read('src/components/ui/TrackedLink.tsx'), /trackConversionEvent/);
    assert.doesNotMatch(read('src/app/[locale]/contact/ContactForm.tsx'), /trackConversionEvent/);
    assert.match(eventsSource, /analyticsEvents\./);
    assert.match(taxonomySource, /home_process_primary/);
  });

  it('keeps analytics docs aligned with runtime events and AI offer value', () => {
    const taxonomy = read('../docs/analytics/conversion-event-taxonomy.md');
    const taxonomySource = read('src/lib/analytics/taxonomy.ts');
    const eventNames = extractConstStringValues(taxonomySource, 'analyticsEvents');
    const placements = [
      ...extractConstStringValues(taxonomySource, 'contactCtaPlacements'),
      ...extractConstStringValues(taxonomySource, 'offerTrackClickPlacements'),
    ];
    const thresholds = extractConstNumberValues(taxonomySource, 'scrollDepthThresholds');

    assert.match(taxonomy, /`ai` \| `web` \| `realtime` \| `unsure`/);
    for (const eventName of eventNames) {
      assert.match(taxonomy, new RegExp(eventName), `taxonomy docs missing ${eventName}`);
    }
    for (const placement of placements) {
      assert.match(taxonomy, new RegExp(placement), `taxonomy docs missing ${placement}`);
    }
    for (const threshold of thresholds) {
      assert.match(taxonomy, new RegExp(`\\b${threshold}\\b`), `taxonomy docs missing scroll depth ${threshold}`);
    }

    const readme = read('README.md');
    assert.match(readme, /locale_switch/);
    assert.match(readme, /service_scroll_depth/);
  });

  it('keeps contact delivery and runtime config behind named seams', () => {
    assert.match(read('src/app/[locale]/contact/actions.ts'), /submitContactAttempt/);
    assert.match(read('src/lib/contact/delivery.ts'), /ContactDeliveryAdapter/);
    assert.match(read('src/lib/contact/delivery.ts'), /getContactDeliveryConfig/);
    assert.match(read('src/app/[locale]/layout.tsx'), /getAnalyticsRuntimeConfig/);
    assert.match(read('src/lib/runtime-config.ts'), /getAnalyticsRuntimeConfig/);
    assert.match(read('scripts/validate-analytics-env.mjs'), /runtime-config-core/);
    assert.match(read('src/lib/runtime-config.ts'), /getContactDeliveryConfig/);
  });
});

describe('page profile seam', () => {
  it('owns sitemap route facts and keeps sitemap as an Adapter', () => {
    const profileSource = read('src/lib/page-profiles.ts');
    const sitemapSource = read('src/app/sitemap.ts');
    const seoCheckSource = read('scripts/check-seo.mjs');
    assert.match(profileSource, /STATIC_PAGE_DEFINITIONS/);
    assert.match(profileSource, /getLocalizedSitemapEntries/);
    assert.match(sitemapSource, /getLocalizedSitemapEntries/);
    assert.doesNotMatch(sitemapSource, /path\.endsWith/);
    assert.match(seoCheckSource, /expectedLocalizedUrlCount/);
    assert.doesNotMatch(seoCheckSource, /Expected 18/);
    assert.match(seoCheckSource, /\[\^'\\?"\]\*/);
  });
});
