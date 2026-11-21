import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {
  getServicePageMetadata,
  getServicePageModel,
  getServicePageStaticParams,
  isServicePageLocale,
} from '@/lib/content/service-page';
import {ServiceScrollDepthTracker} from '@/components/analytics/ServiceScrollDepthTracker';
import {JsonLd} from '@/components/seo/JsonLd';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export function generateStaticParams() {
  return getServicePageStaticParams();
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  return getServicePageMetadata({locale, slug});
}

export default async function ServicePage({params}: Props) {
  const {locale, slug} = await params;

  if (!isServicePageLocale(locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations();
  const model = await getServicePageModel({locale, slug, translate: t});
  if (!model) notFound();

  const Content = model.content.module.default;

  return (
    <>
      <ServiceScrollDepthTracker offerTrackSlug={model.scrollTracking.offerTrackSlug} />
      <JsonLd data={model.profile.jsonLd} />
      <article className="prose prose-terminal max-w-none prose-headings:tracking-tight prose-headings:text-heading prose-p:text-muted-foreground">
        <Content />
      </article>
    </>
  );
}
