import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

describe('service page model ownership', () => {
  it('derives static params from locale routing and offer-track slugs', () => {
    const source = read('src/lib/content/service-page.ts');

    assert.match(source, /export function getServicePageStaticParams/);
    assert.match(source, /routing\.locales\.flatMap/);
    assert.match(source, /OFFER_TRACK_SLUGS\.map/);
  });

  it('keeps service route validity, profile creation, and tracking identity behind the model seam', () => {
    const modelSource = read('src/lib/content/service-page.ts');
    const routeSource = read('src/app/[locale]/services/[slug]/page.tsx');

    assert.match(modelSource, /export function isServicePageLocale/);
    assert.match(modelSource, /if \(!isServicePageLocale\(locale\)\) return null/);
    assert.match(modelSource, /getOfferTrackPageProfile/);
    assert.match(modelSource, /renderPolicy\.requestedLocale/);
    assert.match(modelSource, /scrollTracking/);
    assert.match(routeSource, /getServicePageStaticParams/);
    assert.match(routeSource, /getServicePageMetadata/);
    assert.match(routeSource, /getServicePageModel/);
    assert.doesNotMatch(routeSource, /getOfferTrackPageProfile/);
  });
});
