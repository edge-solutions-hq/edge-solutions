import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register('./ts-extension-resolver.mjs', import.meta.url);
const {getHomePresentationModel} = await import('../src/lib/offer/home-presentation.ts');

function translate(key) {
  return key;
}

describe('homepage presentation model', () => {
  it('keeps Rusty Art as the homepage public project', () => {
    const model = getHomePresentationModel(translate);

    assert.equal(model.publicProject.href, 'https://rusty-art.edge-solutions.be/');
    assert.equal(model.publicProject.imageSrc, '/images/work/rusty-art-showcase.jpg');
    assert.equal(model.publicProject.assetAuthority.assetId, 'rusty-art-showcase');
    assert.equal(model.publicProject.assetAuthority.authority, 'authoritative');
    assert.equal(model.publicProject.title, 'home.showcase.publicProject.title');
    assert.equal(model.publicProject.imageAlt, 'home.showcase.publicProject.title');
    assert.equal(model.publicProject.ctaLabel, 'home.showcase.publicProject.cta');
  });
});
