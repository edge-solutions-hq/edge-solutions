import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function extractObjectBlocks(source, arrayName) {
  const start = source.indexOf(`export const ${arrayName}`);
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

describe('offer presentation hierarchy', () => {
  it('keeps exactly one primary AI offer with supporting execution-depth tracks', () => {
    const tracks = extractObjectBlocks(read('src/lib/offer-tracks.ts'), 'OFFER_TRACKS').map((block) => ({
      slug: extractStringProperty(block, 'slug'),
      priorityRole: extractStringProperty(block, 'priorityRole'),
    }));

    assert.deepEqual(
      tracks.map((track) => track.slug),
      ['ai-automation', 'realtime-games']
    );
    assert.equal(tracks.filter((track) => track.priorityRole === 'primary').length, 1);
    assert.equal(tracks[0].priorityRole, 'primary');
    assert.ok(tracks.slice(1).every((track) => track.priorityRole === 'supporting'));
  });

  it('projects visual role, emphasis, and grouping from offer priority role', () => {
    const presentation = read('src/lib/offer-presentation.ts');

    assert.match(presentation, /visualRole: 'primary-offer'/);
    assert.match(presentation, /visualRole: 'supporting-offer'/);
    assert.match(presentation, /visualEmphasis: 'high'/);
    assert.match(presentation, /visualEmphasis: 'supporting'/);
    assert.match(presentation, /visualGroup: 'ai-primary'/);
    assert.match(presentation, /visualGroup: 'execution-depth'/);
    assert.match(presentation, /assertSinglePrimaryOfferTrack/);
  });

  it('keeps homepage cards equal while services hub consumes role-aware presentation fields', () => {
    const home = read('src/app/[locale]/page.tsx');
    const services = read('src/app/[locale]/services/page.tsx');

    assert.match(home, /getHomeOfferCards/);
    assert.match(home, /homeOfferGridItemClass/);
    assert.doesNotMatch(home, /service\.visualGroup === 'ai-primary'/);
    assert.doesNotMatch(home, /md:col-span-2 xl:col-span-2/);

    assert.match(services, /getServicesHubOfferCards/);
    assert.match(services, /getServicesDecisionItems/);
    assert.match(services, /service\.visualRole/);
    assert.match(services, /service\.visualEmphasis/);
    assert.match(services, /item\.visualEmphasis/);
  });
});
