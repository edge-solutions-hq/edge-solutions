import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {FadeIn, FadeInStagger} from '@/components/studio/FadeIn';
import {PageIntro} from '@/components/studio/PageIntro';
import {SectionIntro} from '@/components/studio/SectionIntro';
import {StatList, StatListItem} from '@/components/studio/StatList';
import {buildLocaleAlternates} from '@/lib/seo';
import {site} from '@/lib/site';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  const titleByLocale: Record<string, string> = {
    fr: 'Développement web et 3D/VR pour entreprises wallonnes',
    en: 'Web development and 3D/VR for Belgian teams',
    nl: 'Webontwikkeling en 3D/VR voor Belgische teams',
  };

  const descriptionByLocale: Record<string, string> = {
    fr: 'Edge Solutions conçoit des sites performants et des expériences 3D/VR, avec une approche SEO et conversion orientée Wallonie.',
    en: 'Edge Solutions builds high-performance websites and real-time 3D/VR experiences with a Wallonia-first SEO and conversion approach.',
    nl: 'Edge Solutions bouwt snelle websites en realtime 3D/VR-ervaringen met een lokale SEO- en conversiefocus voor België.',
  };

  return {
    title: titleByLocale[locale] || titleByLocale.en,
    description: descriptionByLocale[locale] || descriptionByLocale.en,
    alternates: buildLocaleAlternates(locale),
  };
}

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(900px_circle_at_75%_18%,rgba(37,99,235,0.20),transparent_60%),radial-gradient(800px_circle_at_20%_78%,rgba(124,58,237,0.16),transparent_60%)]"
      />

      <div className="relative z-10 space-y-24">
        <section className="relative">

        <PageIntro eyebrow={t('home.subheadline')} title={t('home.headline')}>
          <p>{t('meta.siteTagline')}</p>

          <div className="not-prose mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/contact" size="lg" trackingPlacement="home_hero_primary">
              {t('home.primaryCta')}
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg">
              {t('home.secondaryCta')}
            </ButtonLink>
          </div>
        </PageIntro>
      </section>

      <section>
        <SectionIntro title={t('services.title')} />

        <FadeInStagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <FadeIn className="flex">
            <TrackedLink
              href="/services/web-dev"
              aria-label={t('services.webTitle')}
              eventName="service_card_click"
              eventParams={{
                service_slug: 'web-dev',
                placement: 'home_services_grid',
              }}
              className="group flex w-full flex-col rounded-lg border border-border bg-surface p-6 no-underline shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-lg font-semibold">{t('services.webTitle')}</div>
                <span
                  className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {t('services.webDesc')}
              </p>

              <div className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-medium text-link">
                {t('services.cta')}
                <span
                  className="transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </TrackedLink>
          </FadeIn>

          <FadeIn className="flex">
            <TrackedLink
              href="/services/realtime-games"
              aria-label={t('services.realtimeTitle')}
              eventName="service_card_click"
              eventParams={{
                service_slug: 'realtime-games',
                placement: 'home_services_grid',
              }}
              className="group flex w-full flex-col rounded-lg border border-border bg-surface p-6 no-underline shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="text-lg font-semibold">
                  {t('services.realtimeTitle')}
                </div>
                <span
                  className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                {t('services.realtimeDesc')}
              </p>

              <div className="mt-auto pt-5 inline-flex items-center gap-1 text-sm font-medium text-link">
                {t('services.cta')}
                <span
                  className="transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                >
                  →
                </span>
              </div>
            </TrackedLink>
          </FadeIn>
        </FadeInStagger>
      </section>

      <section>
        <SectionIntro
          eyebrow={t('home.trust.eyebrow')}
          title={t('home.trust.title')}
        >
          <p>{t('home.trust.intro')}</p>
        </SectionIntro>

        <StatList className="mt-10">
          <StatListItem
            value={t('home.trust.items.direct.value')}
            label={t('home.trust.items.direct.label')}
          />
          <StatListItem
            value={t('home.trust.items.delivery.value')}
            label={t('home.trust.items.delivery.label')}
          />
          <StatListItem
            value={t('home.trust.items.quality.value')}
            label={t('home.trust.items.quality.label')}
          />
        </StatList>
      </section>

      <section id="how-we-work" aria-labelledby="how-we-work-title">
        <SectionIntro
          eyebrow={t('home.process.eyebrow')}
          title={t('home.process.title')}
          titleId="how-we-work-title"
        >
          <p>{t('home.process.intro')}</p>
        </SectionIntro>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <Card className="p-6 md:p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t('home.process.stackTitle')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.process.stackIntro')}
            </p>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              <li className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground">
                {t('home.process.stackItems.web')}
              </li>
              <li className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground">
                {t('home.process.stackItems.backend')}
              </li>
              <li className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground">
                {t('home.process.stackItems.realtime')}
              </li>
              <li className="rounded-lg border border-border bg-background/60 px-4 py-3 text-sm font-medium text-foreground">
                {t('home.process.stackItems.delivery')}
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-link">
              <a
                href={site.social.github}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 decoration-link/30 transition-colors hover:decoration-link"
              >
                {t('home.process.links.github')}
              </a>
              <a
                href={site.social.artstation}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 decoration-link/30 transition-colors hover:decoration-link"
              >
                {t('home.process.links.artstation')}
              </a>
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 decoration-link/30 transition-colors hover:decoration-link"
              >
                {t('home.process.links.linkedin')}
              </a>
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <h3 className="text-lg font-semibold tracking-tight">
              {t('home.process.workflowTitle')}
            </h3>
            <ol className="mt-6 space-y-4">
              <li>
                <div className="text-sm font-semibold text-foreground">
                  {t('home.process.workflowItems.scope.step')}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t('home.process.workflowItems.scope.body')}
                </p>
              </li>
              <li>
                <div className="text-sm font-semibold text-foreground">
                  {t('home.process.workflowItems.iterate.step')}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t('home.process.workflowItems.iterate.body')}
                </p>
              </li>
              <li>
                <div className="text-sm font-semibold text-foreground">
                  {t('home.process.workflowItems.prove.step')}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t('home.process.workflowItems.prove.body')}
                </p>
              </li>
            </ol>
          </Card>
        </div>
      </section>

      <section>
        <SectionIntro
          eyebrow={t('home.proof.eyebrow')}
          title={t('home.proof.title')}
        >
          <p>{t('home.proof.intro')}</p>
        </SectionIntro>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="text-sm font-semibold text-foreground">
              {t('home.proof.items.web.kicker')}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">
              {t('home.proof.items.web.title')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.proof.items.web.body')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold text-foreground">
              {t('home.proof.items.realtime.kicker')}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">
              {t('home.proof.items.realtime.title')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.proof.items.realtime.body')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="text-sm font-semibold text-foreground">
              {t('home.proof.items.trust.kicker')}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">
              {t('home.proof.items.trust.title')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.proof.items.trust.body')}
            </p>
          </Card>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.95fr)]">
          <Card className="p-6 md:p-8">
            <div className="text-sm font-semibold text-foreground">
              {t('home.proof.testimonials.kicker')}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">
              {t('home.proof.testimonials.title')}
            </h3>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <blockquote className="rounded-lg border border-border bg-background/60 p-5">
                <p className="text-sm leading-relaxed text-foreground">
                  “{t('home.proof.testimonials.items.first.quote')}”
                </p>
                <footer className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {t('home.proof.testimonials.items.first.author')}
                  </span>
                  <span className="block mt-1">
                    {t('home.proof.testimonials.items.first.role')}
                  </span>
                </footer>
              </blockquote>

              <blockquote className="rounded-lg border border-border bg-background/60 p-5">
                <p className="text-sm leading-relaxed text-foreground">
                  “{t('home.proof.testimonials.items.second.quote')}”
                </p>
                <footer className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {t('home.proof.testimonials.items.second.author')}
                  </span>
                  <span className="block mt-1">
                    {t('home.proof.testimonials.items.second.role')}
                  </span>
                </footer>
              </blockquote>
            </div>
          </Card>

          <Card className="p-6 md:p-8">
            <div className="text-sm font-semibold text-foreground">
              {t('home.proof.project.kicker')}
            </div>
            <h3 className="mt-3 text-lg font-semibold tracking-tight">
              {t('home.proof.project.title')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t('home.proof.project.body')}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
              <li className="rounded-lg border border-border bg-background/60 px-4 py-3">
                {t('home.proof.project.points.scope')}
              </li>
              <li className="rounded-lg border border-border bg-background/60 px-4 py-3">
                {t('home.proof.project.points.proof')}
              </li>
              <li className="rounded-lg border border-border bg-background/60 px-4 py-3">
                {t('home.proof.project.points.outcome')}
              </li>
            </ul>
            <a
              href="https://github.com/Gil-1/edge-solutions/pull/13"
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex text-sm font-medium text-link underline underline-offset-4 decoration-link/30 transition-colors hover:decoration-link"
            >
              {t('home.proof.project.linkLabel')}
            </a>
          </Card>
        </div>
      </section>

      <section>
        <Card className="relative overflow-hidden p-8 md:p-12">
          <div
            className="pointer-events-none absolute -right-28 -top-24 h-72 w-72 rounded-full bg-secondary/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />

          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('contact.title')}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {t('contact.intro')}
            </p>

            <div className="not-prose mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href="/contact"
                size="lg"
                trackingPlacement="home_bottom_primary"
              >
                {t('home.primaryCta')}
              </ButtonLink>
              <ButtonLink href="/services" variant="outline" size="lg">
                {t('home.secondaryCta')}
              </ButtonLink>
            </div>
          </FadeIn>
        </Card>
      </section>
      </div>
    </div>
  );
}


