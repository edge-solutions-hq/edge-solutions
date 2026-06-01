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
    assert.match(layoutSource, /getRootLayoutProfile/);
    assert.doesNotMatch(layoutSource, /descriptionByLocale/);
  });

  it('derives organization schema service types from the offer-track catalog', () => {
    const offerTrackSource = read('src/lib/offer-tracks.ts');
    const seoSource = read('src/lib/seo.ts');
    const schemaServiceTypes = extractStringProperties(offerTrackSource, 'schemaServiceType');

    assert.deepEqual(schemaServiceTypes, [
      'AI systems & automation',
      'Real-time 3D/VR',
    ]);
    assert.match(seoSource, /serviceType: OFFER_TRACKS\.map\(\(track\) => track\.schemaServiceType\)/);
  });
});
