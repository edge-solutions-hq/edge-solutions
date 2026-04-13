import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {Card} from '@/components/ui/Card';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {FadeIn, FadeInStagger} from '@/components/studio/FadeIn';
import {PageIntro} from '@/components/studio/PageIntro';
import {SectionIntro} from '@/components/studio/SectionIntro';
import {ShowcasePanel} from '@/components/ui/ShowcasePanel';
import {buildLocaleAlternates} from '@/lib/seo';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  const titleByLocale: Record<string, string> = {
    fr: 'Systèmes IA pragmatiques et delivery fiable pour équipes wallonnes',
    en: 'Pragmatic AI systems and delivery hardening for Belgian teams',
    nl: 'Pragmatische AI-systemen en betrouwbare delivery voor Belgische teams',
  };

  const descriptionByLocale: Record<string, string> = {
    fr: 'Edge Solutions aide les équipes à rendre leurs usages IA réellement exploitables, avec revue humaine, garde-fous, intégration web et exécution temps réel quand le produit le demande.',
    en: 'Edge Solutions helps teams turn AI usage into something truly usable, with human review, guardrails, web integration and real-time execution when the product needs it.',
    nl: 'Edge Solutions helpt teams om AI-gebruik echt bruikbaar te maken, met menselijke review, guardrails, webintegratie en realtime uitvoering wanneer het product dat vraagt.',
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
  const serviceCards = [
    {
      href: '/services/ai-automation',
      label: t('services.aiTitle'),
      description: t('services.aiDesc'),
      slug: 'ai-automation',
    },
    {
      href: '/services/web-dev',
      label: t('services.webTitle'),
      description: t('services.webDesc'),
      slug: 'web-dev',
    },
    {
      href: '/services/realtime-games',
      label: t('services.realtimeTitle'),
      description: t('services.realtimeDesc'),
      slug: 'realtime-games',
    },
  ];
  const proofCards = [
    {
      title: t('home.proof.items.method.title'),
      description: t('home.proof.items.method.description'),
    },
    {
      title: t('home.proof.items.execution.title'),
      description: t('home.proof.items.execution.description'),
    },
    {
      title: t('home.proof.items.trust.title'),
      description: t('home.proof.items.trust.body'),
    },
  ];

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

          <FadeInStagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {serviceCards.map((service) => (
              <FadeIn key={service.slug} className="flex">
                <TrackedLink
                  href={service.href}
                  aria-label={service.label}
                  eventName="service_card_click"
                  eventParams={{
                    service_slug: service.slug,
                    placement: 'home_services_grid',
                  }}
                  className="group flex w-full flex-col rounded-lg border border-border bg-surface p-6 no-underline shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="text-lg font-semibold">{service.label}</div>
                    <span
                      className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {service.description}
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
            ))}
          </FadeInStagger>
        </section>

        <section>
          <SectionIntro eyebrow={t('home.proof.eyebrow')} title={t('home.proof.title')}>
            <p>{t('home.proof.intro')}</p>
          </SectionIntro>

          <ShowcasePanel
            className="mt-10"
            eyebrow={t('home.proof.publicProject.title')}
            title={t('home.proof.items.openclaw.title')}
            imageSrc="/images/proof/edge-proof-board.svg"
            imageAlt={t('home.proof.items.openclaw.title')}
          >
            <p>{t('home.proof.items.openclaw.description')}</p>
            <p>{t('home.proof.publicProject.description')}</p>
            <div className="flex flex-wrap gap-2">
              {serviceCards.map((service) => (
                <span
                  key={service.slug}
                  className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground"
                >
                  {service.label}
                </span>
              ))}
            </div>
            <a href="https://rusty-art.edge-solutions.be/" target="_blank" rel="noreferrer">
              {t('home.proof.publicProject.cta')} <span aria-hidden="true">↗</span>
            </a>
          </ShowcasePanel>

          <FadeInStagger className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {proofCards.map((item) => (
              <FadeIn key={item.title}>
                <Card className="h-full p-6">
                  <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </Card>
              </FadeIn>
            ))}
          </FadeInStagger>

          <div className="not-prose mt-8">
            <ButtonLink href="/services/ai-automation" variant="outline" size="lg">
              {t('home.proof.cta')}
            </ButtonLink>
          </div>
        </section>

        <section id="how-we-work" aria-labelledby="how-we-work-title">
          <SectionIntro
            eyebrow={t('home.process.eyebrow')}
            title={t('home.process.title')}
            titleId="how-we-work-title"
          >
            <p>{t('home.process.intro')}</p>
          </SectionIntro>

          <div className="mt-10 grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="p-6 md:p-8">
              <div className="text-sm font-semibold text-foreground">
                {t('home.process.discovery.kicker')}
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {t('home.process.discovery.title')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('home.process.discovery.body')}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                {t('home.process.discovery.points.plan')}
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="text-sm font-semibold text-foreground">
                {t('home.process.build.kicker')}
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {t('home.process.build.title')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('home.process.build.body')}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                {t('home.process.build.stackItems.delivery')}
              </p>
            </Card>

            <Card className="p-6 md:p-8">
              <div className="text-sm font-semibold text-foreground">
                {t('home.process.launch.kicker')}
              </div>
              <h3 className="mt-3 text-lg font-semibold tracking-tight">
                {t('home.process.launch.title')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('home.process.launch.body')}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                {t('home.process.launch.items.measure.body')}
              </p>
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
