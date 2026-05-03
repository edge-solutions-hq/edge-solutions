import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

const locales = ['fr', 'en', 'nl'];
const offerTracks = [
  {
    slug: 'ai-automation',
    titleKey: 'aiTitle',
    descKey: 'aiDesc',
    hubKeys: ['hubAiTrigger', 'hubAiDesc', 'hubAiProof'],
    decisionKey: 'decisionAi',
    proofModule: 'WorkflowSnapshot',
  },
  {
    slug: 'web-dev',
    titleKey: 'webTitle',
    descKey: 'webDesc',
    hubKeys: ['hubWebTrigger', 'hubWebDesc', 'hubWebProof'],
    decisionKey: 'decisionWeb',
    proofModule: 'DeliveryBlueprint',
  },
  {
    slug: 'realtime-games',
    titleKey: 'realtimeTitle',
    descKey: 'realtimeDesc',
    hubKeys: ['hubRealtimeTrigger', 'hubRealtimeDesc', 'hubRealtimeProof'],
    decisionKey: 'decisionRealtime',
    proofModule: 'PrototypeSignals',
  },
];

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
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
  });

  it('wires public route modules through the catalog', () => {
    assert.match(read('src/app/[locale]/page.tsx'), /OFFER_TRACKS\.map/);
    assert.match(read('src/app/[locale]/services/page.tsx'), /OFFER_TRACKS\.map/);
    assert.match(read('src/components/layout/Header.tsx'), /OFFER_TRACKS\.map/);
    assert.match(read('src/app/sitemap.ts'), /OFFER_TRACKS/);
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
  it('has localized MDX content, metadata, proof module, and CTA for each offer track', () => {
    for (const locale of locales) {
      for (const track of offerTracks) {
        const filePath = `src/content/${locale}/services/${track.slug}.mdx`;
        assert.ok(existsSync(path.join(root, filePath)), `${filePath} missing`);
        const source = read(filePath);
        assert.match(source, /export const metadata = \{/, `${filePath} missing metadata`);
        assert.match(source, new RegExp(`<${track.proofModule}\\b`), `${filePath} missing ${track.proofModule}`);
        assert.match(source, /<CTA\b/, `${filePath} missing CTA`);
      }
    }
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
    const actionSource = read('src/app/[locale]/contact/actions.ts');
    assert.match(actionSource, /kind === 'spam'/);
    assert.match(actionSource, /status: 'idle'/);
    assert.doesNotMatch(actionSource, /status: 'success', message: 'OK'/);
  });

  it('routes event taxonomy through named domain actions', () => {
    const eventsSource = read('src/lib/analytics/events.ts');
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
  });

  it('keeps analytics docs aligned with runtime events and AI offer value', () => {
    const taxonomy = read('../docs/conversion-event-taxonomy.md');
    assert.match(taxonomy, /`ai` \| `web` \| `realtime` \| `unsure`/);
    assert.match(taxonomy, /`locale_switch`/);
    assert.match(taxonomy, /`service_scroll_depth`/);

    const readme = read('README.md');
    assert.match(readme, /locale_switch/);
    assert.match(readme, /service_scroll_depth/);
  });
});
