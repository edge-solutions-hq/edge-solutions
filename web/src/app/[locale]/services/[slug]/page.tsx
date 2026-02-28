import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from '@/i18n/routing';
import {getServiceMdx, SERVICE_SLUGS} from '@/lib/content/services';
import {buildLocaleAlternates} from '@/lib/seo';

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

  return {
    ...mdx.metadata,
    alternates: buildLocaleAlternates(locale, `/services/${slug}`),
  };
}

export default async function ServicePage({params}: Props) {
  const {locale, slug} = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const mdx = await getServiceMdx(locale, slug);
  if (!mdx) notFound();

  const Content = mdx.default;

  return (
    <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground">
      <Content />
    </article>
  );
}


