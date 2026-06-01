import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function extractStringProperties(source, propertyName) {
  const regex = new RegExp(`${propertyName}\\s*:\\s*'([^']+)'`, 'g');
  return [...source.matchAll(regex)].map((item) => item[1]);
}

describe('global site profile ownership', () => {
  it('keeps root layout metadata behind the site profile seam', () => {
    const profileSource = read('src/lib/site-profile.ts');
    const layoutSource = read('src/app/[locale]/layout.tsx');

    assert.match(profileSource, /getRootLayoutProfile/);
    assert.match(profileSource, /buildLocalizedPageMetadata/);
    assert.match(profileSource, /rootDescription/);
    assert.match(profileSource, /personSchema/);
    assert.match(profileSource, /jsonLd: \[organizationSchema, personSchema\]/);
    assert.match(layoutSource, /getRootLayoutProfile/);
    assert.match(layoutSource, /profile\.jsonLd/);
    assert.doesNotMatch(layoutSource, /descriptionByLocale/);
  });

  it('derives organization schema service types from the offer-track catalog', () => {
    const offerTrackSource = read('src/lib/offer-tracks.ts');
    const seoSource = read('src/lib/seo.ts');
    const schemaServiceTypes = extractStringProperties(offerTrackSource, 'schemaServiceType');

    assert.deepEqual(schemaServiceTypes, [
      'AI systems & automation',
      'Real-time 3D / XR',
    ]);
    assert.match(seoSource, /serviceType: OFFER_TRACKS\.map\(\(track\) => track\.schemaServiceType\)/);
  });

  it('keeps localized metadata wired to an approved social preview image', () => {
    const seoSource = read('src/lib/seo.ts');

    assert.match(seoSource, /DEFAULT_SOCIAL_IMAGE/);
    assert.match(seoSource, /\/images\/work\/rusty-art-showcase\.jpg/);
    assert.match(seoSource, /images: \[socialImage\]/);
    assert.match(seoSource, /summary_large_image/);
    assert.match(seoSource, /images: \[socialImage\.url\]/);
  });

  it('emits a standalone Person schema for Gil without unsupported authority claims', () => {
    const seoSource = read('src/lib/seo.ts');

    assert.match(seoSource, /export const personSchema/);
    assert.match(seoSource, /'@type': 'Person'/);
    assert.match(seoSource, /'@id': `\$\{site\.url\}#gil-guminski`/);
    assert.match(seoSource, /sameAs: Object\.values\(site\.social\)/);
    assert.match(seoSource, /'AI automation'/);
    assert.match(seoSource, /'Real-time 3D applications'/);
    assert.doesNotMatch(seoSource, /aggregateRating/);
    assert.doesNotMatch(seoSource, /award/);
  });
});
