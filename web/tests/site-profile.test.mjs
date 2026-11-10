import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register('./ts-extension-resolver.mjs', import.meta.url);
const {buildLocalizedPageMetadata} = await import('../src/lib/site/seo.ts');

describe('global site profile ownership', () => {
  it('keeps localized metadata wired to an approved social preview image', () => {
    const metadata = buildLocalizedPageMetadata({
      locale: 'fr',
      title: 'Title',
      description: 'Description',
    });
    const [socialImage] = metadata.openGraph.images;

    assert.match(socialImage.url, /^https:\/\/.+\/images\/work\/rusty-art-showcase\.jpg$/);
    assert.equal(socialImage.alt, 'Title');
    assert.equal(metadata.twitter.card, 'summary_large_image');
    assert.deepEqual(metadata.twitter.images, [socialImage.url]);
  });
});
