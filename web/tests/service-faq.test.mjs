import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
register('./ts-extension-resolver.mjs', import.meta.url);

const {LOCALES} = await import('../src/i18n/routing.ts');
const {OFFER_TRACK_SLUGS} = await import('../src/lib/offer/offer-tracks.ts');
const {getServiceFaqItems} = await import('../src/lib/content/service-faq.ts');
const {faqPageSchema, getServiceSchemaDetails} = await import('../src/lib/site/seo.ts');
const {getServicePageModel} = await import('../src/lib/content/service-page.ts');

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
        const tags = [...read(`src/content/${locale}/services/${slug}.mdx`).matchAll(/<ServiceFaq\b([^>]*)\/>/g)];
        const attributes = tags.map(([, attrs]) =>
          Object.fromEntries([...attrs.matchAll(/(\w+)="([^"]*)"/g)].map(([, key, value]) => [key, value]))
        );

        assert.deepEqual(
          attributes,
          [{locale, slug}],
          `${locale}/${slug} must render the centralized FAQ for its own locale and slug once`
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

  it('gives every locale its own FAQ wording instead of reusing another locale', () => {
    for (const slug of OFFER_TRACK_SLUGS) {
      const questions = LOCALES.flatMap((locale) => getServiceFaqItems(locale, slug).map((item) => item.question));
      const answers = LOCALES.flatMap((locale) => getServiceFaqItems(locale, slug).map((item) => item.answer));
      assert.equal(new Set(questions).size, questions.length, `${slug} FAQ questions repeat across locales`);
      assert.equal(new Set(answers).size, answers.length, `${slug} FAQ answers repeat across locales`);
    }

    assert.notDeepEqual(
      getServiceFaqItems('en', 'ai-automation'),
      getServiceFaqItems('en', 'realtime-games')
    );
  });

  it('gives every locale its own Service schema wording', () => {
    for (const slug of OFFER_TRACK_SLUGS) {
      const audiences = LOCALES.map((locale) => getServiceSchemaDetails(locale, slug).audienceType);
      const offers = LOCALES.map((locale) => getServiceSchemaDetails(locale, slug).offer.name);
      assert.equal(new Set(audiences).size, LOCALES.length, `${slug} audienceType repeats across locales`);
      assert.equal(new Set(offers).size, LOCALES.length, `${slug} offer name repeats across locales`);
    }
  });

  it('emits the requested locale FAQ JSON-LD even when the page body falls back to FR', async () => {
    for (const locale of LOCALES) {
      const model = await getServicePageModel({
        locale,
        slug: 'ai-automation',
        loaders: {
          fr: {
            'ai-automation': async () => ({
              default: () => null,
              metadata: {title: 'FR title', description: 'FR description'},
            }),
          },
          en: {},
          nl: {},
        },
      });
      const faq = model.profile.jsonLd.find((item) => item?.['@type'] === 'FAQPage');

      assert.equal(faq.inLanguage, locale);
      assert.equal(faq.url, `https://edge-solutions.be/${locale}/services/ai-automation`);
      assert.deepEqual(
        faq.mainEntity.map((item) => item.name),
        getServiceFaqItems(locale, 'ai-automation').map((item) => item.question)
      );
    }
  });
});
