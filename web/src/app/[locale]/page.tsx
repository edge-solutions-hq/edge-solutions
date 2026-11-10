import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {ExternalLinkButton} from '@/components/ui/ExternalLinkButton';
import {surfaceClass} from '@/components/ui/Surface';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {Container} from '@/components/studio/Container';
import {SectionIntro} from '@/components/studio/SectionIntro';
import {ShowcasePanel} from '@/components/ui/ShowcasePanel';
import {getHomePresentationModel} from '@/lib/offer/home-presentation';
import {getHomeOfferCards} from '@/lib/offer/offer-presentation';
import {getHomePageProfile} from '@/lib/site/page-profiles';
import {JsonLd} from '@/components/seo/JsonLd';

type HomeOfferCard = ReturnType<typeof getHomeOfferCards>[number];

type Props = {
  params: Promise<{locale: string}>;
};

function homeOfferCardFrame() {
  return surfaceClass(
    'interactive-card',
    'group relative flex w-full flex-col overflow-hidden p-6 pt-8 no-underline'
  );
}

function homeOfferGridItemClass() {
  return 'flex';
}

function homeOfferTitleClass() {
  return 'text-lg font-semibold';
}

function HomeOfferBlueprintIcon({service}: {service: HomeOfferCard}) {
  const frameClass = [
    'pointer-events-none relative mb-5 flex h-14 w-14 items-center justify-center rounded-md border bg-background/55 text-foreground shadow-[inset_0_0_0_1px_rgba(194,164,91,0.25)]',
    'border-border/75 bg-background/45',
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
const homeTokenSectionGap = 'mt-12 sm:mt-16 lg:mt-20';
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
        <section className="relative overflow-hidden">
          <Container className="not-prose">
            <div
              className="relative overflow-hidden rounded-lg border border-border/70 bg-surface/90 p-4 shadow-[6px_6px_0_rgba(170,142,75,0.26)] sm:p-6 lg:rounded-none lg:border-x-0 lg:border-b lg:border-t lg:bg-transparent lg:px-0 lg:py-8 lg:shadow-none"
            >
              <div
                className="pointer-events-none absolute inset-x-4 top-4 flex items-center gap-2 opacity-60 sm:inset-x-6 lg:hidden"
                aria-hidden="true"
              >
                <span className="h-px flex-1 bg-[repeating-linear-gradient(90deg,rgba(16,43,74,0.68)_0_0.55rem,transparent_0.55rem_0.8rem)]" />
                <span className="h-2 w-2 rounded-full border border-primary bg-background/90" />
                <span className="h-px w-12 bg-primary/65" />
              </div>
              <div className="relative z-10 pt-6 sm:pt-7 lg:pt-0">
                <div>
                  <div className="grid items-start lg:grid-cols-1">
                    <p className="max-w-3xl text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                      {t('home.subheadline')}
                    </p>
                  </div>

                  <h1 className="relative z-10 mt-5 max-w-4xl text-balance font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-normal text-technical-blue sm:text-5xl sm:leading-[0.92] lg:mt-4 lg:text-6xl">
                    {t('home.headline')}
                  </h1>

                  <div className="mt-6 grid gap-5 border-t border-border/70 pt-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
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
              </div>
            </div>
          </Container>
        </section>

        <section className={homeSectionGap}>
          <SectionIntro title={t('services.title')} />

          <div className={`${homeSectionContentGap} grid grid-cols-1 gap-6 md:grid-cols-2`}>
            {serviceCards.map((service) => (
              <div key={service.slug} className={homeOfferGridItemClass()}>
                <TrackedLink
                  href={service.href}
                  trackingLabel={service.label}
                  offerTrackSlug={service.slug}
                  trackingPlacement="home_services_grid"
                  className={homeOfferCardFrame()}
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
                    <div className={homeOfferTitleClass()}>{service.label}</div>
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
              </div>
            ))}
          </div>
        </section>

        <section className={homeSectionGap}>
          <div className={surfaceClass('panel', 'grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start')}>
            <div>
              <h2 className="max-w-2xl text-balance font-display text-3xl font-bold leading-[0.98] tracking-normal text-technical-blue sm:text-4xl">
                {t('home.profile.title')}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                {t('home.profile.body')}
              </p>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {['experience', 'delivery', 'stack', 'aiStack'].map((signal) => (
                <div
                  key={signal}
                  className={surfaceClass('inset', 'p-4')}
                >
                  <dt className="text-xs font-semibold uppercase text-subtle-foreground">
                    {t(`home.profile.signals.${signal}.label`)}
                  </dt>
                  <dd className="mt-2 text-sm font-semibold leading-relaxed text-foreground">
                    {t(`home.profile.signals.${signal}.value`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className={homeTokenSectionGap}>
          <SectionIntro eyebrow={t('home.showcase.eyebrow')} title={t('home.showcase.title')}>
            <p>{t('home.showcase.intro')}</p>
          </SectionIntro>

          <ShowcasePanel
            className={homeSectionContentGap}
            eyebrow={home.publicProject.eyebrow}
            title={home.publicProject.title}
            imageSrc={home.publicProject.imageSrc}
            imageAlt={home.publicProject.imageAlt}
            imagePriority
          >
            <p>{home.publicProject.description}</p>
            {home.publicProject.supportText ? (
              <p>{home.publicProject.supportText}</p>
            ) : null}
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
            <ExternalLinkButton
              href={home.publicProject.href}
              className="!no-underline"
            >
              {home.publicProject.ctaLabel}
            </ExternalLinkButton>
          </ShowcasePanel>
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

          <div
            className={surfaceClass('panel', `${homeSectionContentGap} grid gap-8 p-6 md:p-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]`)}
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
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-technical-blue">
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
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-technical-blue">
                {t('home.finalCta.processTitle')}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {t('home.finalCta.processBody')}
              </p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="home-final-cta"
          className={homeSectionGap}
        >
          <Container
            className="not-prose"
            innerClassName="max-w-6xl px-6 lg:max-w-6xl"
          >
            <div
              className={surfaceClass('panel', 'grid gap-6 p-6 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center')}
            >
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-normal text-subtle-foreground">
                  {t('home.finalCta.eyebrow')}
                </p>
                <h2
                  id="home-final-cta"
                  className="mt-2 text-balance text-2xl font-semibold tracking-tight text-technical-blue sm:text-3xl"
                >
                  {t('home.finalCta.title')}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
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
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
