import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {FadeIn, FadeInStagger} from '@/components/studio/FadeIn';
import {Container} from '@/components/studio/Container';
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

function HomeOfferBlueprintIcon({service}: {service: HomeOfferCard}) {
  const frameClass = [
    'pointer-events-none relative mb-5 flex h-14 w-14 items-center justify-center rounded-md border bg-background/55 text-foreground shadow-[inset_0_0_0_1px_rgba(194,164,91,0.25)]',
    service.visualRole === 'primary-offer'
      ? 'border-primary/75 bg-primary/10'
      : 'border-border/75 bg-background/45',
  ].join(' ');

  return (
    <span className={frameClass} aria-hidden="true">
      <span className="absolute inset-1 rounded-[0.35rem] border border-primary/25" />
      <span className="absolute left-2 top-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
      <svg
        viewBox="0 0 48 48"
        className="relative h-10 w-10"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {service.slug === 'ai-automation' ? (
          <>
            <circle cx="24" cy="24" r="7" className="fill-background/70" />
            <path d="M24 9v8M24 31v8M9 24h8M31 24h8M13.5 13.5l5.5 5.5M34.5 13.5 29 19M13.5 34.5 19 29M34.5 34.5 29 29" />
            <circle cx="24" cy="24" r="2.7" className="fill-primary stroke-primary" />
            <circle cx="8.5" cy="24" r="2.2" className="fill-background" />
            <circle cx="39.5" cy="24" r="2.2" className="fill-background" />
            <circle cx="24" cy="8.5" r="2.2" className="fill-background" />
            <circle cx="24" cy="39.5" r="2.2" className="fill-background" />
          </>
        ) : null}

        {service.slug === 'web-dev' ? (
          <>
            <rect x="8" y="11" width="32" height="27" rx="2.5" className="fill-background/70" />
            <path d="M8 18h32M14 14.5h.1M19 14.5h.1M24 14.5h.1" />
            <path d="M14 24h12M14 29h20M14 34h14" />
            <path d="M31 23h5v5h-5z" className="fill-primary/20 stroke-primary" />
          </>
        ) : null}

        {service.slug === 'realtime-games' ? (
          <>
            <path d="m24 8 14 8-14 8-14-8 14-8Z" className="fill-background/70" />
            <path d="M10 16v16l14 8 14-8V16M24 24v16" />
            <path d="m16 13 14 8M32 20v8M18 31l6 3.5 6-3.5" className="stroke-primary" />
            <path d="M13 24h-4M39 24h-4M24 4v4M24 40v4" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

const homeSectionGap = 'mt-10 sm:mt-12 lg:mt-16';
const homeTokenSectionGap = 'mt-10 sm:mt-12 lg:mt-16';
const homeSectionContentGap = 'mt-8 lg:mt-10';

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

                  <HomeOfferBlueprintIcon service={service} />

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
