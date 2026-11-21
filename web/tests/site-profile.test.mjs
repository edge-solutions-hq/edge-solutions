import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register('./ts-extension-resolver.mjs', import.meta.url);
const {buildLocalizedPageMetadata} = await import('../src/lib/site/seo.ts');
const {isPublicAssetApproved} = await import('../src/lib/content/asset-authority.ts');
const {site} = await import('../src/lib/site/site.ts');

describe('localized page metadata', () => {
  it('shares an absolute, approved social preview image as a large card', () => {
    const metadata = buildLocalizedPageMetadata({
      locale: 'fr',
      title: 'Title',
      description: 'Description',
    });
    const [socialImage] = metadata.openGraph.images;
    const imageUrl = new URL(socialImage.url);

    assert.equal(imageUrl.origin, new URL(site.url).origin);
    assert.equal(isPublicAssetApproved(imageUrl.pathname), true, `${imageUrl.pathname} is not an approved asset`);
    assert.equal(metadata.twitter.card, 'summary_large_image');
    assert.deepEqual(metadata.twitter.images, [socialImage.url]);
  });
});
