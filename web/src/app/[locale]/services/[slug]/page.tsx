import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {Card} from '@/components/ui/Card';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {routing} from '@/i18n/routing';
import {getServiceMdx, SERVICE_SLUGS} from '@/lib/content/services';
import {buildLocaleAlternates} from '@/lib/seo';
import {ServiceScrollDepthTracker} from '@/components/analytics/ServiceScrollDepthTracker';

type Props = {
  params: Promise<{locale: string; slug: string}>;
};

type ServiceNavCardProps = {
  active: boolean;
  href: '/services/web-dev' | '/services/realtime-games';
  title: string;
  description: string;
  badge: string;
  placement: string;
  kind: 'web' | 'realtime';
};

function ServiceThumbnail({kind}: {kind: 'web' | 'realtime'}) {
  if (kind === 'web') {
    return (
      <div className="relative h-24 overflow-hidden rounded-2xl border border-border/70 bg-[linear-gradient(135deg,rgba(59,130,246,0.18),rgba(14,165,233,0.08))]">
        <div className="absolute inset-x-4 top-4 h-3 rounded-full bg-foreground/10" />
        <div className="absolute left-4 right-12 top-10 h-3 rounded-full bg-foreground/15" />
        <div className="absolute left-4 right-20 top-16 h-3 rounded-full bg-foreground/10" />
        <div className="absolute bottom-4 right-4 h-8 w-14 rounded-xl border border-border/80 bg-background/80" />
      </div>
    );
  }

  return (
    <div className="relative h-24 overflow-hidden rounded-2xl border border-border/70 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.08))]">
      <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border/80 bg-background/75" />
      <div className="absolute left-6 top-6 h-4 w-10 rounded-full bg-foreground/10" />
      <div className="absolute bottom-5 right-5 h-5 w-16 rounded-full bg-foreground/10" />
    </div>
  );
}

function ServiceNavCard({
  active,
  href,
  title,
  description,
  badge,
  placement,
  kind,
}: ServiceNavCardProps) {
  const content = (
    <Card
      className={`p-4 transition-colors md:p-5 ${
        active
          ? 'border-link/40 bg-link/5 shadow-[0_0_0_1px_rgba(59,130,246,0.12)]'
          : 'hover:border-link/30 hover:bg-background/80'
      }`}
    >
      <ServiceThumbnail kind={kind} />
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-link">
          {badge}
        </span>
        {active ? (
          <span className="text-xs font-medium text-foreground/70">•</span>
        ) : null}
      </div>
      <h2 className="mt-3 text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </Card>
  );

  if (active) {
    return <div aria-current="page">{content}</div>;
  }

  return (
    <TrackedLink
      href={href}
      aria-label={title}
      className="block"
      eventName="service_navigation_click"
      eventParams={{placement, service_target: href.replace('/services/', '')}}
    >
      {content}
    </TrackedLink>
  );
}

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

  const t = await getTranslations();
  const mdx = await getServiceMdx(locale, slug);
  if (!mdx) notFound();

  const Content = mdx.default;

  return (
    <>
      <ServiceScrollDepthTracker serviceSlug={slug} />
      <section className="mb-12">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-link">
            {t('services.serviceNav.eyebrow')}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t('services.serviceNav.intro')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ServiceNavCard
            active={slug === 'web-dev'}
            href="/services/web-dev"
            title={t('services.webTitle')}
            description={t('services.serviceNav.webThumb')}
            badge={t('services.serviceNav.webBadge')}
            placement="service_subnav"
            kind="web"
          />
          <ServiceNavCard
            active={slug === 'realtime-games'}
            href="/services/realtime-games"
            title={t('services.realtimeTitle')}
            description={t('services.serviceNav.realtimeThumb')}
            badge={t('services.serviceNav.realtimeBadge')}
            placement="service_subnav"
            kind="realtime"
          />
        </div>
      </section>
      <article className="prose prose-slate max-w-none dark:prose-invert prose-headings:tracking-tight prose-headings:text-foreground prose-p:text-muted-foreground">
        <Content />
      </article>
    </>
  );
}


