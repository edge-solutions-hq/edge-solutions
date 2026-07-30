import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
register('./ts-extension-resolver.mjs', import.meta.url);

const locales = ['fr', 'en', 'nl'];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function messageKeyPaths(value, prefix = '') {
  if (Array.isArray(value) || value === null || typeof value !== 'object') return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    messageKeyPaths(child, prefix ? `${prefix}.${key}` : key)
  );
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
      extractStringProperty(block, 'hubCheckKey').replace('services.', ''),
    ],
    decisionKey: extractStringProperty(block, 'decisionKey').replace('services.', ''),
    priorityRole: extractStringProperty(block, 'priorityRole'),
  }));
}

const offerTracks = extractOfferTracks();
const {
  OFFER_TRACK_EVIDENCE_PROFILES: evidenceProfiles,
  serviceEvidenceRegistry,
} = await import('../src/lib/content/service-evidence-registry.ts');

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

describe('website operating docs', () => {
  it('keeps the website source-of-truth entrypoint discoverable', () => {
    const website = read('../WEBSITE.md');
    const positioning = read('../docs/positioning.md');
    const agents = read('../AGENTS.md');
    const webReadme = read('README.md');

    assert.match(website, /mandatory entrypoint for website work/i);
    assert.match(website, /docs\/positioning\.md/);
    assert.match(website, /technical_seo_platform/);
    assert.match(website, /content_icp/);
    assert.match(website, /design_conversion/);
    assert.match(website, /pr_review/);
    assert.match(website, /analysis_observation/);
    assert.match(positioning, /AI-first/i);
    assert.match(positioning, /not a generic agency/);
    assert.match(website, /Generated visuals are allowed only as synthetic diagrams/);
    assert.match(website, /Missing provider access is a setup-required state, not evidence/);

    assert.equal(existsSync(path.join(root, '../docs/README.md')), false);
    assert.match(agents, /`WEBSITE\.md`/);
    assert.match(webReadme, /`\.\.\/WEBSITE\.md`/);
    assert.doesNotMatch(agents, /Tests: none defined yet/);
  });
});

describe('offer track catalog seam', () => {
  it('keeps offer track identity and ordering in the catalog', () => {
    const source = read('src/lib/offer-tracks.ts');
    const first = source.indexOf("slug: 'ai-automation'");
    const second = source.indexOf("slug: 'realtime-games'");

    assert.ok(first > -1, 'missing AI offer track');
    assert.ok(second > first, 'realtime track must follow AI track');
    assert.match(source, /priorityRole: 'primary'/, 'AI-first hierarchy should be explicit');
    assert.equal(offerTracks[0].priorityRole, 'primary');
    assert.equal(
      offerTracks.filter((track) => track.priorityRole === 'primary').length,
      1,
      'offer catalog must identify exactly one primary track'
    );
    assert.ok(
      offerTracks.slice(1).every((track) => track.priorityRole === 'supporting'),
      'supporting tracks must remain visible after the primary AI track'
    );
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
    assert.match(read('src/app/llms.txt/route.ts'), /buildLlmsTxt/);
    assert.match(read('src/lib/ai-discovery.ts'), /OFFER_TRACKS/);
    assert.match(read('src/lib/ai-discovery.ts'), /STATIC_PAGE_DEFINITIONS/);
    assert.match(read('src/lib/content/services.ts'), /OFFER_TRACK_SLUGS/);
    assert.match(read('../docs/architecture.md'), /UI surfaces/);
    assert.match(read('../docs/architecture.md'), /Surface\.tsx/);
    assert.match(read('../docs/architecture.md'), /External CTA links/);
    assert.match(read('../docs/architecture.md'), /ExternalLinkButton\.tsx/);
  });

  it('projects role-aware offer presentation while homepage cards stay visually balanced', () => {
    const presentationSource = read('src/lib/offer-presentation.ts');
    const homeSource = read('src/app/[locale]/page.tsx');
    const servicesSource = read('src/app/[locale]/services/page.tsx');

    assert.match(presentationSource, /visualRole: 'primary-offer'/);
    assert.match(presentationSource, /visualRole: 'supporting-offer'/);
    assert.match(presentationSource, /visualEmphasis: 'high'/);
    assert.match(presentationSource, /visualGroup: 'execution-depth'/);
    assert.match(presentationSource, /assertSinglePrimaryOfferTrack/);

    assert.match(homeSource, /getHomeOfferCards/);
    assert.match(homeSource, /homeOfferGridItemClass/);
    assert.doesNotMatch(homeSource, /service\.visualGroup === 'ai-primary'/);
    assert.doesNotMatch(homeSource, /md:col-span-2 xl:col-span-2/);
    assert.match(servicesSource, /service\.visualRole/);
    assert.match(servicesSource, /service\.visualEmphasis/);
    assert.match(servicesSource, /item\.visualEmphasis/);
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

describe('localized content and evidence seam', () => {
  it('validates the evidence registry through its runtime contract interface', () => {
    assert.deepEqual(serviceEvidenceRegistry.validate(), []);
    assert.deepEqual(
      serviceEvidenceRegistry.profiles.map((profile) => profile.slug),
      offerTracks.map((track) => track.slug),
      'evidence contract registry must match offer track catalog order'
    );

    for (const track of offerTracks) {
      const contract = serviceEvidenceRegistry.getContract(track.slug);
      assert.ok(contract, `${track.slug} missing evidence contract`);
      assert.equal(contract.slug, track.slug);
      assert.ok(contract.render.module, `${track.slug} missing evidence render module`);
      assert.ok(contract.render.imagePath.endsWith('.svg'), `${track.slug} evidence image must be an svg asset`);
      assert.equal(contract.render.assetAuthority.approvalStatus, 'approved', `${track.slug} source asset must be approved`);
      assert.equal(contract.render.assetAuthority.authority, 'authoritative', `${track.slug} source asset must be authoritative`);
      assert.ok(contract.structure.length > 0, `${track.slug} missing structural expectations`);
      assert.ok(contract.signals.length > 0, `${track.slug} missing required signals`);
    }
  });

  it('has localized MDX content, metadata, evidence profile, and CTA for each offer track', () => {
    assert.deepEqual(
      evidenceProfiles.map((profile) => profile.slug),
      offerTracks.map((track) => track.slug),
      'evidence registry must match offer track catalog order'
    );

    for (const locale of locales) {
      for (const track of offerTracks) {
        const evidence = evidenceProfiles.find((profile) => profile.slug === track.slug);
        assert.ok(evidence, `${track.slug} missing evidence profile`);
        assert.ok(evidence.requiredSignals.length > 0, `${track.slug} missing evidence signals`);
        const filePath = `src/content/${locale}/services/${track.slug}.mdx`;
        assert.ok(existsSync(path.join(root, filePath)), `${filePath} missing`);
        const source = read(filePath);
        assert.match(source, /export const metadata = \{/, `${filePath} missing metadata`);
        assert.match(source, new RegExp(`<${evidence.evidenceModule}\\b`), `${filePath} missing ${evidence.evidenceModule}`);
        assert.match(source, new RegExp(evidence.imagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${filePath} missing evidence image`);
        assert.match(source, /<CTA\b/, `${filePath} missing CTA`);

        for (const [propName, expectedCount] of Object.entries(evidence.structuralCounts)) {
          const actualCount = propName === 'columnPoints'
            ? countColumnPoints(source)
            : countArrayItems(source, propName);
          assert.equal(actualCount, expectedCount, `${filePath} ${propName} count drifted`);
        }

        const normalizedSource = normalizeContent(source);
        for (const signal of evidence.requiredSignals) {
          const terms = signal.terms[locale];
          assert.ok(terms?.length, `${track.slug} missing ${locale} terms for ${signal.concept}`);
          assert.ok(
            terms.some((term) => normalizedSource.includes(normalizeContent(term))),
            `${filePath} missing evidence signal: ${signal.concept}`
          );
        }
      }
    }

    assert.match(read('src/lib/content/services.ts'), /getOfferTrackEvidenceProfile/);
    assert.match(read('src/lib/content/services.ts'), /getOfferTrackEvidenceContract/);
    assert.match(read('src/lib/content/services.ts'), /renderPolicy/);
    assert.doesNotMatch(read('src/lib/content/services.ts'), /function getServiceMdx/);
    assert.match(read('src/lib/content/service-page.ts'), /renderPolicy\.requestedLocale/);
    assert.match(read('src/lib/content/service-page.ts'), /evidencePolicy/);
    assert.match(read('src/app/[locale]/services/[slug]/page.tsx'), /getServicePageModel/);
  });

  it('uses page profiles for metadata and JSON-LD graph selection', () => {
    assert.match(read('src/app/[locale]/page.tsx'), /getHomePageProfile/);
    assert.match(read('src/app/[locale]/services/page.tsx'), /getServicesPageProfile/);
    assert.match(read('src/lib/content/service-page.ts'), /getOfferTrackPageProfile/);
    assert.match(read('src/app/[locale]/services/[slug]/page.tsx'), /getServicePageMetadata/);
    assert.match(read('src/app/[locale]/contact/page.tsx'), /getContactPageProfile/);
    assert.match(read('src/app/[locale]/privacy-policy/page.tsx'), /getPrivacyPolicyPageProfile/);
  });

  it('keeps repeated media frame mechanics behind a shared UI module', () => {
    assert.match(read('src/components/ui/MediaFrame.tsx'), /export function MediaFrame/);

    for (const filePath of [
      'src/components/ui/ShowcasePanel.tsx',
      'src/components/mdx/WorkflowSnapshot.tsx',
      'src/components/mdx/DeliveryBlueprint.tsx',
      'src/components/mdx/PrototypeSignals.tsx',
    ]) {
      const source = read(filePath);
      assert.match(source, /MediaFrame/, `${filePath} should consume the shared media frame`);
      assert.doesNotMatch(source, /bg-rose-400\/80/, `${filePath} should not repeat browser chrome dots`);
    }
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
    assert.match(formSource, /resolveContactFeedback/);
    assert.match(formSource, /feedback\.messageKey \? t\(feedback\.messageKey\)/);
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
    assert.match(read('src/lib/analytics/browser-context.ts'), /classifyAiReferrer/);
    assert.match(read('src/lib/analytics/browser-context.ts'), /safeReferrer/);
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

    assert.match(taxonomy, /`ai` \| `realtime` \| `unsure`/);
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
    const actionSource = read('src/app/[locale]/contact/actions.ts');

    assert.match(actionSource, /submitContactAttempt/);
    assert.match(actionSource, /checkRateLimit\(CONTACT_RATE_LIMIT_ID, \{headers: requestHeaders\}\)/);
    assert.doesNotMatch(actionSource, /rateLimitKey/);
    assert.match(read('src/lib/contact/abuse.ts'), /ContactAbuseAdapter/);
    assert.match(read('src/lib/contact/delivery.ts'), /ContactDeliveryAdapter/);
    assert.match(read('src/lib/contact/delivery.ts'), /buildContactEmailPayload/);
    assert.match(read('src/lib/contact/delivery.ts'), /getContactDeliveryConfig/);
    assert.match(read('src/app/[locale]/layout.tsx'), /getAnalyticsRuntimeConfig/);
    assert.match(read('src/lib/runtime-config.ts'), /getAnalyticsRuntimeConfig/);
    assert.match(read('scripts/validate-analytics-env.mjs'), /runtime-config-core/);
    assert.match(read('src/lib/runtime-config.ts'), /getContactDeliveryConfig/);
  });

  it('keeps optional analytics behind consent ownership with localized parity', () => {
    const layoutSource = read('src/app/[locale]/layout.tsx');
    const eventsSource = read('src/lib/analytics/events.ts');
    const actionSource = read('src/app/[locale]/contact/actions.ts');
    const referenceKeys = messageKeyPaths(readJson('messages/fr.json')).sort();

    assert.match(layoutSource, /AnalyticsConsentProvider/);
    assert.doesNotMatch(layoutSource, /@vercel\/analytics|@vercel\/speed-insights/);
    assert.match(eventsSource, /from '.\/consent'/);
    assert.match(eventsSource, /hasAnalyticsConsent/);
    assert.match(actionSource, /PLAYWRIGHT_TEST/);
    assert.match(actionSource, /BROWSER_HARNESS_HEADER/);

    for (const locale of locales.slice(1)) {
      assert.deepEqual(
        messageKeyPaths(readJson(`messages/${locale}.json`)).sort(),
        referenceKeys,
        `${locale} message keys must match French`
      );
    }
  });

  it('always launches the configured browser harness server', () => {
    assert.match(read('playwright.config.ts'), /reuseExistingServer: false/);
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
