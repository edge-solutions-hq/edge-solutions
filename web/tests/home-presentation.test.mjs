import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
register('./ts-extension-resolver.mjs', import.meta.url);
const {getHomePresentationModel} = await import('../src/lib/home-presentation.ts');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function translate(key) {
  return key;
}

describe('homepage presentation model', () => {
  it('owns homepage public project and process facts', () => {
    const model = getHomePresentationModel(translate);

    assert.equal(model.processCards.length, 3);

    assert.equal(model.publicProject.href, 'https://rusty-art.edge-solutions.be/');
    assert.equal(model.publicProject.title, 'home.showcase.publicProject.title');
    assert.equal(model.publicProject.description, 'home.showcase.publicProject.description');
    assert.deepEqual(
      model.processCards.map((card) => card.title),
      [
        'home.process.discovery.title',
        'home.process.build.title',
        'home.process.launch.title',
      ]
    );
  });

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

  it('owns homepage CTA intents', () => {
    const model = getHomePresentationModel(translate);

    assert.deepEqual(model.ctas, {
      heroPrimary: {
        href: '/contact',
        trackingPlacement: 'home_hero_primary',
      },
      processPrimary: {
        href: '/contact',
        trackingPlacement: 'home_process_primary',
      },
      bottomPrimary: {
        href: '/contact',
        trackingPlacement: 'home_bottom_primary',
      },
    });
  });

  it('keeps homepage route as a renderer of the presentation model', () => {
    const route = read('src/app/[locale]/page.tsx');

    assert.match(route, /getHomePresentationModel/);
    assert.doesNotMatch(route, /const showcaseCards = \[/);
    assert.doesNotMatch(route, /const showcaseSignals = \[/);
    assert.doesNotMatch(route, /home_process_primary/);
    assert.doesNotMatch(route, /home\.ctas\.processPrimary/);
    assert.doesNotMatch(route, /https:\/\/rusty-art\.edge-solutions\.be\//);
    assert.match(route, /home\.processCards\.map/);
    assert.doesNotMatch(route, /home\.showcaseCards\.map/);
    assert.doesNotMatch(route, /home\.showcaseSignals\.map/);
    assert.doesNotMatch(route, /home\.showcaseCta/);
    assert.match(route, /home\.ctas\.bottomPrimary/);
  });
});
