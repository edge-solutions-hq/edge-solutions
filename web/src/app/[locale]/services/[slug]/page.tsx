import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {getServiceMdx, SERVICE_SLUGS} from '@/lib/content/services';
import {
  breadcrumbSchema,
  buildLocalizedPageMetadata,
  serviceSchema,
  webPageSchema,
} from '@/lib/seo';
import {ServiceScrollDepthTracker} from '@/components/analytics/ServiceScrollDepthTracker';
import {JsonLd} from '@/components/seo/JsonLd';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SERVICE_SLUGS.map((slug) => ({locale, slug}))
  );
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const mdx = await getServiceMdx(locale, slug);
  if (!mdx?.metadata) return {};

  return buildLocalizedPageMetadata({
    locale,
    pathSuffix: `/services/${slug}`,
    title: mdx.metadata.title || slug,
    description: mdx.metadata.description || '',
  });
}

export default async function ServicePage({params}: Props) {
  const {locale, slug} = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const mdx = await getServiceMdx(locale, slug);
  if (!mdx) notFound();

  const t = await getTranslations();
  const Content = mdx.default;
  const title = mdx.metadata?.title || slug;
  const description = mdx.metadata?.description || '';

  return (
    <>
      <ServiceScrollDepthTracker serviceSlug={slug} />
      <JsonLd
        data={[
          webPageSchema(locale, `/services/${slug}`, title, description),
          serviceSchema(locale, slug, title, description),
          breadcrumbSchema(locale, [
            {name: t('nav.home'), path: ''},
            {name: t('services.title'), path: '/services'},
            {name: title, path: `/services/${slug}`},
          ]),
        ]}
      />
      <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground">
        <Content />
      </article>
    </>
  );
}

