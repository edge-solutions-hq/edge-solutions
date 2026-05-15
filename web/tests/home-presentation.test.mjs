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
  it('owns homepage proof and process facts', () => {
    const model = getHomePresentationModel(translate);

    assert.equal(model.proofCards.length, 3);
    assert.equal(model.proofSignals.length, 3);
    assert.equal(model.processCards.length, 3);
    assert.deepEqual(model.finalCta, {
      eyebrow: 'home.finalCta.eyebrow',
      title: 'home.finalCta.title',
      body: 'home.finalCta.body',
    });

    assert.deepEqual(
      model.proofSignals.map((signal) => signal.token),
      [
        'home.proof.tokens.publicWork',
        'home.proof.tokens.tools',
        'home.proof.tokens.process',
      ]
    );
    assert.deepEqual(
      model.proofCards.map((card) => card.title),
      [
        'home.proof.items.method.title',
        'home.proof.items.execution.title',
        'home.proof.items.trust.title',
      ]
    );
    assert.deepEqual(
      model.processCards.map((card) => card.title),
      [
        'home.process.discovery.title',
        'home.process.build.title',
        'home.process.launch.title',
      ]
    );
  });

  it('keeps Rusty Art as the homepage public proof', () => {
    const model = getHomePresentationModel(translate);

    assert.equal(model.publicProof.href, 'https://rusty-art.edge-solutions.be/');
    assert.equal(model.publicProof.imageSrc, '/images/proof/edge-proof-board.svg');
    assert.equal(model.publicProof.assetAuthority.assetId, 'edge-proof-board');
    assert.equal(model.publicProof.assetAuthority.authority, 'authoritative');
    assert.equal(model.publicProof.title, 'home.proof.items.openclaw.title');
    assert.equal(model.publicProof.ctaLabel, 'home.proof.publicProject.cta');
  });

  it('owns homepage CTA intents and keeps the proof CTA AI-first', () => {
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
    assert.equal(model.proofCta.href, '/services/ai-automation');
  });

  it('keeps homepage route as a renderer of the presentation model', () => {
    const route = read('src/app/[locale]/page.tsx');

    assert.match(route, /getHomePresentationModel/);
    assert.doesNotMatch(route, /const proofCards = \[/);
    assert.doesNotMatch(route, /const proofSignals = \[/);
    assert.doesNotMatch(route, /home_process_primary/);
    assert.doesNotMatch(route, /home\.ctas\.processPrimary/);
    assert.doesNotMatch(route, /https:\/\/rusty-art\.edge-solutions\.be\//);
    assert.match(route, /home\.processCards\.map/);
    assert.doesNotMatch(route, /home\.proofCards\.map/);
    assert.match(route, /home\.proofSignals\.map/);
    assert.match(route, /home\.ctas\.bottomPrimary/);
  });
});
