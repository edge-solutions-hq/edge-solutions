import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {FadeIn, FadeInStagger} from '@/components/studio/FadeIn';
import {Container} from '@/components/studio/Container';
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
    'group relative flex w-full flex-col overflow-hidden rounded-lg border bg-surface p-6 pt-8 no-underline shadow-[6px_6px_0_rgba(170,142,75,0.34)] transition-colors hover:bg-surface-muted hover:shadow-[4px_4px_0_rgba(170,142,75,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
    service.visualRole === 'primary-offer'
      ? 'border-primary/70'
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

const homeSectionGap = 'mt-10 sm:mt-12 lg:mt-16';
const homeTokenSectionGap = 'mt-10 sm:mt-12 lg:mt-16';
const homeSectionContentGap = 'mt-8 lg:mt-10';

function HeroTechnicalAccent() {
  return (
    <div
      className="pointer-events-none relative h-24 w-24 shrink-0 sm:h-32 sm:w-32 lg:h-56 lg:w-56"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-lg border border-border/70 bg-[linear-gradient(135deg,rgba(200,210,204,0.7),rgba(244,238,214,0.28)_48%,rgba(170,142,75,0.42))] shadow-[6px_6px_0_rgba(170,142,75,0.3)]" />
      <div className="absolute inset-3 rotate-45 rounded-md border border-border bg-surface/70 shadow-inner sm:inset-4" />
      <div className="absolute inset-7 rotate-45 rounded-sm border border-primary/80 bg-primary/45 sm:inset-9 lg:inset-16" />
      <div className="absolute left-2 top-1/2 h-px w-10 -translate-y-1/2 bg-border/70 sm:w-14 lg:w-24" />
      <div className="absolute right-2 top-1/2 h-px w-10 -translate-y-1/2 bg-border/70 sm:w-14 lg:w-24" />
      <div className="absolute left-1/2 top-2 h-10 w-px -translate-x-1/2 bg-border/70 sm:h-14 lg:h-24" />
      <div className="absolute bottom-2 left-1/2 h-10 w-px -translate-x-1/2 bg-border/70 sm:h-14 lg:h-24" />
      <div className="absolute -right-2 bottom-3 h-8 w-8 rounded-full border border-primary bg-background/80 shadow-[3px_3px_0_rgba(170,142,75,0.32)] sm:h-10 sm:w-10 lg:h-14 lg:w-14" />
    </div>
  );
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

      <div className="relative z-10">
        <section className="relative overflow-hidden">
          <Container className="not-prose">
            <FadeIn
              initiallyVisible
              className="relative overflow-hidden border-y border-border py-6 sm:py-8 lg:py-10"
            >
              <div
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(16,43,74,0.09)_1px,transparent_1px),linear-gradient(180deg,rgba(16,43,74,0.06)_1px,transparent_1px)] bg-[length:3rem_3rem]"
                aria-hidden="true"
              />
              <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-10">
                <div>
                  <div className="grid grid-cols-[minmax(0,1fr)_6rem] items-start gap-4 sm:grid-cols-[minmax(0,1fr)_8rem] lg:grid-cols-1">
                    <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                      {t('home.subheadline')}
                    </p>
                    <div className="justify-self-end lg:hidden">
                      <HeroTechnicalAccent />
                    </div>
                  </div>

                  <h1 className="mt-4 max-w-5xl text-balance font-display text-5xl font-extrabold uppercase leading-[0.86] tracking-normal text-foreground sm:text-7xl sm:leading-[0.84] lg:text-8xl">
                    {t('home.headline')}
                  </h1>

                  <div className="mt-6 grid gap-5 border-t border-border pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                    <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                      {t('meta.siteTagline')}
                    </p>

                    <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
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
                  </div>
                </div>

                <div className="hidden justify-end lg:flex">
                  <HeroTechnicalAccent />
                </div>
              </div>
            </FadeIn>
          </Container>
        </section>

        <section className={homeSectionGap}>
          <SectionIntro title={t('services.title')} />

          <FadeInStagger className={`${homeSectionContentGap} grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4`}>
            {serviceCards.map((service) => (
              <FadeIn key={service.slug} className={homeOfferGridItemClass(service)}>
                <TrackedLink
                  href={service.href}
                  aria-label={service.label}
                  offerTrackSlug={service.slug}
                  trackingPlacement="home_services_grid"
                  className={homeOfferCardFrame(service)}
                >
                  <div
                    className="pointer-events-none absolute inset-x-5 top-4 flex items-center gap-2"
                    aria-hidden="true"
                  >
                    <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,rgba(194,164,91,0.82)_0_0.38rem,transparent_0.38rem_0.62rem)]" />
                    <span className="h-2 w-2 rounded-full border border-primary/70 bg-background" />
                    <span className="h-px w-10 bg-primary/55" />
                  </div>

                  <div
                    className="pointer-events-none absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2 opacity-45"
                    aria-hidden="true"
                  >
                    <span className="h-1.5 rounded-full bg-primary/60" />
                    <span className="h-1.5 rounded-full border border-border/70 bg-background/50" />
                    <span className="h-1.5 rounded-full bg-border/50" />
                  </div>

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className={homeOfferTitleClass(service)}>{service.label}</div>
                    <span
                      className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>

                  <p className="relative z-10 mt-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="relative z-10 mt-auto inline-flex items-center gap-1 pt-8 text-sm font-medium text-link">
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

        <section className={homeTokenSectionGap}>
          <SectionIntro eyebrow={t('home.proof.eyebrow')} title={t('home.proof.title')}>
            <p>{t('home.proof.intro')}</p>
          </SectionIntro>

          <ShowcasePanel
            className={homeSectionContentGap}
            eyebrow={home.publicProof.eyebrow}
            title={home.publicProof.title}
            imageSrc={home.publicProof.imageSrc}
            imageAlt={home.publicProof.imageAlt}
            imagePriority
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

          <FadeIn className="mt-6 grid gap-6 rounded-lg border border-border bg-surface/90 p-6 shadow-sm md:mt-8 md:p-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,0.55fr)]">
            <div>
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-foreground">
                  {t('home.proof.tokensHeading')}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t('home.proof.tokensIntro')}
                </p>
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
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
            </div>

            <div className="flex flex-col justify-between border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-sm font-semibold text-foreground">
                {t('services.aiTitle')}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t('services.aiDesc')}
              </p>
              <div className="not-prose mt-5">
                <ButtonLink href={home.proofCta.href} variant="outline" size="lg">
                  {t('home.proof.cta')}
                </ButtonLink>
              </div>
            </div>
          </FadeIn>
        </section>

        <section
          id="how-we-work"
          aria-labelledby="how-we-work-title"
          className={homeTokenSectionGap}
        >
          <SectionIntro
            eyebrow={t('home.process.eyebrow')}
            title={t('home.process.title')}
            titleId="how-we-work-title"
          >
            <p>{t('home.process.intro')}</p>
          </SectionIntro>

          <FadeIn
            initiallyVisible
            className={`${homeSectionContentGap} grid gap-8 rounded-lg border border-border bg-surface p-6 shadow-sm md:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]`}
          >
            <ol className="divide-y divide-border">
              {home.processCards.map((card, index) => (
                <li
                  key={card.title}
                  className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[3rem_1fr]"
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-subtle-foreground"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {card.kicker}
                    </div>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {card.body}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-foreground/80">
                      {card.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex flex-col justify-center border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-sm font-semibold text-foreground">
                {t('home.finalCta.eyebrow')}
              </p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                {t('home.finalCta.processTitle')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('home.finalCta.processBody')}
              </p>
            </div>
          </FadeIn>
        </section>

        <section aria-labelledby="home-final-cta" className={`${homeSectionGap} pb-10 sm:pb-12`}>
          <Container className="not-prose">
            <FadeIn
              initiallyVisible
              className="flex flex-col gap-5 rounded-lg border border-primary/25 bg-surface/95 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('home.finalCta.eyebrow')}
                </p>
                <h2
                  id="home-final-cta"
                  className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
                >
                  {t('home.finalCta.title')}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t('home.finalCta.body')}
                </p>
              </div>

              <ButtonLink
                href={home.ctas.bottomPrimary.href}
                size="lg"
                trackingPlacement={home.ctas.bottomPrimary.trackingPlacement}
                className="w-full shrink-0 sm:w-auto"
              >
                {t('home.finalCta.cta')}
              </ButtonLink>
            </FadeIn>
          </Container>
        </section>
      </div>
    </div>
  );
}
