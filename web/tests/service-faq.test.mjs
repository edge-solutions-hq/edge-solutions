import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
register('./ts-extension-resolver.mjs', import.meta.url);

const {LOCALES} = await import('../src/i18n/routing.ts');
const {OFFER_TRACK_SLUGS} = await import('../src/lib/offer-tracks.ts');
const {getServiceFaqItems} = await import('../src/lib/content/service-faq.ts');
const {faqPageSchema} = await import('../src/lib/seo.ts');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

describe('localized service FAQ source', () => {
  it('keeps FAQ parity across locales and offer tracks', () => {
    for (const slug of OFFER_TRACK_SLUGS) {
      const counts = LOCALES.map((locale) => getServiceFaqItems(locale, slug).length);
      assert.deepEqual(counts, [counts[0], counts[0], counts[0]], `${slug} FAQ count parity`);
      assert.ok(counts[0] > 0, `${slug} must have FAQ items`);

      for (const locale of LOCALES) {
        for (const [index, item] of getServiceFaqItems(locale, slug).entries()) {
          assert.ok(item.question.trim(), `${locale}/${slug} FAQ ${index + 1} question is empty`);
          assert.ok(item.answer.trim(), `${locale}/${slug} FAQ ${index + 1} answer is empty`);
        }
      }
    }
  });

  it('has localized MDX service pages render FAQ from the centralized FAQ source', () => {
    for (const locale of LOCALES) {
      for (const slug of OFFER_TRACK_SLUGS) {
        const source = read(`src/content/${locale}/services/${slug}.mdx`);

        assert.match(
          source,
          new RegExp(`<ServiceFaq locale="${locale}" slug="${slug}" />`),
          `${locale}/${slug} must render centralized FAQ content`
        );
      }
    }
  });

  it('projects centralized FAQ items to FAQPage JSON-LD', () => {
    for (const locale of LOCALES) {
      for (const slug of OFFER_TRACK_SLUGS) {
        const items = getServiceFaqItems(locale, slug);
        const schema = faqPageSchema(locale, slug, items);

        assert.equal(schema['@type'], 'FAQPage');
        assert.equal(schema.inLanguage, locale);
        assert.equal(schema.mainEntity.length, items.length);
        assert.deepEqual(
          schema.mainEntity.map((item) => ({
            question: item.name,
            answer: item.acceptedAnswer.text,
          })),
          items
        );
      }
    }
  });
});
