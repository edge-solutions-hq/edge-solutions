import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {isLocale, routing} from '@/i18n/routing';
import {getServiceContent} from '@/lib/content/services';
import {OFFER_TRACK_SLUGS} from '@/lib/offer-tracks';
import {getOfferTrackPageProfile} from '@/lib/page-profiles';
import {ServiceScrollDepthTracker} from '@/components/analytics/ServiceScrollDepthTracker';
import {JsonLd} from '@/components/seo/JsonLd';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    OFFER_TRACK_SLUGS.map((slug) => ({locale, slug}))
  );
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const content = await getServiceContent(locale, slug);
  if (!content?.metadata) return {};

  return getOfferTrackPageProfile({
    locale: content.renderPolicy.requestedLocale,
    slug: content.slug,
    title: content.metadata.title || slug,
    description: content.metadata.description || '',
  }).metadata;
}

export default async function ServicePage({params}: Props) {
  const {locale, slug} = await params;

  if (!isLocale(locale)) notFound();

  setRequestLocale(locale);

  const content = await getServiceContent(locale, slug);
  if (!content) notFound();

  const t = await getTranslations();
  const Content = content.module.default;
  const title = content.metadata.title || slug;
  const description = content.metadata.description || '';
  const profile = getOfferTrackPageProfile({
    locale: content.renderPolicy.requestedLocale,
    slug: content.slug,
    title,
    description,
    translate: t,
  });

  return (
    <>
      <ServiceScrollDepthTracker offerTrackSlug={content.slug} />
      <JsonLd data={profile.jsonLd} />
      <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground">
        <Content />
      </article>
    </>
  );
}
