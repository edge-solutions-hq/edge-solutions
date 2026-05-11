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
import {getHomePresentationModel} from '@/lib/home-presentation';
import {getHomeOfferCards} from '@/lib/offer-presentation';
import {getHomePageProfile} from '@/lib/page-profiles';
import {JsonLd} from '@/components/seo/JsonLd';

type HomeOfferCard = ReturnType<typeof getHomeOfferCards>[number];

type Props = {
  params: Promise<{locale: string}>;
};

function homeOfferCardFrame(service: HomeOfferCard) {
  return [
    'group flex w-full flex-col rounded-lg border bg-surface p-6 no-underline shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
    service.visualRole === 'primary-offer'
      ? 'border-primary/45'
      : 'border-border',
  ].join(' ');
}

function homeOfferGridItemClass(service: HomeOfferCard) {
  return [
    'flex',
    service.visualGroup === 'ai-primary' ? 'md:col-span-2 xl:col-span-2' : '',
  ].join(' ');
}

function homeOfferTitleClass(service: HomeOfferCard) {
  return service.visualEmphasis === 'high'
    ? 'text-xl font-semibold tracking-tight'
    : 'text-lg font-semibold';
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  return getHomePageProfile(locale).metadata;
}

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const profile = getHomePageProfile(locale);
  const serviceCards = getHomeOfferCards(t);
  const home = getHomePresentationModel(t);

  return (
    <div className="relative">
      <JsonLd data={profile.jsonLd} />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(900px_circle_at_75%_18%,rgba(37,99,235,0.20),transparent_60%),radial-gradient(800px_circle_at_20%_78%,rgba(124,58,237,0.16),transparent_60%)]"
      />

      <div className="relative z-10 space-y-24">
        <section className="relative">
          <PageIntro eyebrow={t('home.subheadline')} title={t('home.headline')}>
            <p>{t('meta.siteTagline')}</p>

            <div className="not-prose mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink
                href={home.ctas.heroPrimary.href}
                size="lg"
                trackingPlacement={home.ctas.heroPrimary.trackingPlacement}
              >
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

          <FadeInStagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((service) => (
              <FadeIn key={service.slug} className={homeOfferGridItemClass(service)}>
                <TrackedLink
                  href={service.href}
                  aria-label={service.label}
                  offerTrackSlug={service.slug}
                  trackingPlacement="home_services_grid"
                  className={homeOfferCardFrame(service)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className={homeOfferTitleClass(service)}>{service.label}</div>
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
            eyebrow={home.publicProof.eyebrow}
            title={home.publicProof.title}
            imageSrc={home.publicProof.imageSrc}
            imageAlt={home.publicProof.imageAlt}
          >
            <p>{home.publicProof.description}</p>
            <p>{home.publicProof.supportText}</p>
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
            <a href={home.publicProof.href} target="_blank" rel="noreferrer">
              {home.publicProof.ctaLabel} <span aria-hidden="true">↗</span>
            </a>
          </ShowcasePanel>

          <FadeIn className="mt-8 rounded-lg border border-border bg-surface/85 p-6 shadow-sm md:p-8">
            <div className="mb-6 max-w-2xl">
              <p className="text-sm font-semibold text-foreground">
                {t('home.proof.tokensHeading')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t('home.proof.tokensIntro')}
              </p>
            </div>
            <dl className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {home.proofSignals.map((signal) => (
                <div key={signal.label}>
                  <div className="mb-3 inline-flex rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-semibold text-subtle-foreground">
                    {signal.token}
                  </div>
                  <dt className="text-xs font-semibold uppercase text-subtle-foreground">
                    {signal.label}
                  </dt>
                  <dd className="mt-2 text-base font-semibold tracking-tight text-foreground">
                    {signal.value}
                  </dd>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {signal.description}
                  </dd>
                </div>
              ))}
            </dl>
          </FadeIn>

          <FadeInStagger className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {home.proofCards.map((item) => (
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
            <ButtonLink href={home.proofCta.href} variant="outline" size="lg">
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
            {home.processCards.map((card) => (
              <Card key={card.title} className="p-6 md:p-8">
                <div className="text-sm font-semibold text-foreground">
                  {card.kicker}
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {card.body}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-foreground/80">
                  {card.detail}
                </p>
              </Card>
            ))}
          </div>

          <div className="not-prose mt-8">
            <ButtonLink
              href={home.ctas.processPrimary.href}
              size="lg"
              trackingPlacement={home.ctas.processPrimary.trackingPlacement}
            >
              {t('home.process.primaryCta')}
            </ButtonLink>
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
                  href={home.ctas.bottomPrimary.href}
                  size="lg"
                  trackingPlacement={home.ctas.bottomPrimary.trackingPlacement}
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
