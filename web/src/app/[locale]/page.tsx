import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {ButtonLink} from '@/components/ui/Button';
import {ExternalLinkButton} from '@/components/ui/ExternalLinkButton';
import {surfaceClass} from '@/components/ui/Surface';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {SectionIntro} from '@/components/studio/SectionIntro';
import {ShowcasePanel} from '@/components/ui/ShowcasePanel';
import {BryzaPanel} from '@/components/home/BryzaPanel';
import {site} from '@/lib/site/site';
import {getHomePresentationModel} from '@/lib/offer/home-presentation';
import {getHomeOfferCards} from '@/lib/offer/offer-presentation';
import {getHomePageProfile} from '@/lib/site/page-profiles';
import {JsonLd} from '@/components/seo/JsonLd';
import {HeroPanes} from '@/components/home/HeroPanes';
import {PromptLine, WindowChrome} from '@/components/ui/WindowChrome';

type HomeOfferCard = ReturnType<typeof getHomeOfferCards>[number];

type Props = {
  params: Promise<{locale: string}>;
};

function homeOfferCardFrame() {
  return surfaceClass(
    'interactive-card',
    'group relative flex w-full flex-col overflow-hidden no-underline'
  );
}

function homeOfferGridItemClass() {
  return 'flex';
}

function homeOfferTitleClass() {
  return 'font-display text-xl font-bold tracking-tight text-heading';
}

// Syntax accent per project family. Both cards share the same size and structure.
const homeOfferAccent: Record<HomeOfferCard['slug'], {text: string; bar: string}> = {
  'ai-automation': {text: 'text-syn-green', bar: 'bg-syn-green'},
  'realtime-games': {text: 'text-syn-cyan', bar: 'bg-syn-cyan'},
};

function HomeOfferIcon({service}: {service: HomeOfferCard}) {
  return (
    <span
      className={`pointer-events-none flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-background ${homeOfferAccent[service.slug].text}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        className="h-9 w-9"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        {service.slug === 'ai-automation' ? (
          <>
            <circle cx="24" cy="24" r="7" />
            <path d="M24 9v8M24 31v8M9 24h8M31 24h8M13.5 13.5l5.5 5.5M34.5 13.5 29 19M13.5 34.5 19 29M34.5 34.5 29 29" />
            <circle cx="24" cy="24" r="2.7" className="fill-primary stroke-primary" />
          </>
        ) : null}

        {service.slug === 'realtime-games' ? (
          <>
            <path d="m24 8 14 8-14 8-14-8 14-8Z" />
            <path d="M10 16v16l14 8 14-8V16M24 24v16" />
            <path d="m17 20 7 4 7-4" className="stroke-primary" />
          </>
        ) : null}
      </svg>
    </span>
  );
}

const homeSectionGap = 'mt-16 sm:mt-20 lg:mt-24';
const homeSectionContentGap = 'mt-8';
const profileSignals = ['experience', 'delivery', 'stack', 'aiStack'] as const;

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

      {/* Hero: one terminal window. The command is decoration, the copy is the message. */}
      <section className={surfaceClass('feature', 'not-prose overflow-hidden')}>
        <WindowChrome
          title="gil@edge-solutions: ~"
          right={<span className="hidden sm:inline">{locale}.UTF-8</span>}
        />

        <div className="grid lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.7fr)]">
          <div className="px-5 py-8 sm:px-8 sm:py-10 lg:py-12">
            <PromptLine command="whoami" typed caret />
            <p className="mt-3 max-w-2xl border-l-2 border-syn-green/70 pl-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('home.subheadline')}
            </p>

            <h1 className="mt-8 max-w-3xl text-balance font-display text-[1.75rem] leading-[1.14] font-extrabold tracking-tight text-heading sm:text-4xl sm:leading-[1.12] lg:text-[2.85rem]">
              {t('home.headline')}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('meta.siteTagline')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
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

          <HeroPanes
            className="hidden border-l border-border bg-background/40 lg:grid"
            aiLabel={serviceCards[0]?.label ?? ''}
            realtimeLabel={serviceCards[1]?.label ?? ''}
          />
        </div>

        {/* Status line */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border bg-secondary/70 px-4 py-2 font-mono text-xs text-muted-foreground">
          <span className="rounded-sm bg-primary px-2 py-0.5 font-bold text-primary-foreground">
            {t('home.status.role')}
          </span>
          <span>{t('home.status.location')}</span>
          <span className="text-syn-green sm:ml-auto">{t('home.status.focus')}</span>
        </div>
      </section>

      <section className={homeSectionGap}>
        <SectionIntro title={t('services.title')} command="ls ./services" />

        <div className={`${homeSectionContentGap} grid grid-cols-1 gap-5 md:grid-cols-2`}>
          {serviceCards.map((service, index) => (
            <div key={service.slug} className={homeOfferGridItemClass()}>
              <TrackedLink
                href={service.href}
                trackingLabel={service.label}
                offerTrackSlug={service.slug}
                trackingPlacement="home_services_grid"
                className={homeOfferCardFrame()}
              >
                <span
                  className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 ${homeOfferAccent[service.slug].bar}`}
                  aria-hidden="true"
                />

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex items-start gap-4">
                    <HomeOfferIcon service={service} />
                    <div className="min-w-0 flex-1">
                      <div className={homeOfferTitleClass()}>{service.label}</div>
                      <div
                        className={`mt-1 truncate font-mono text-xs ${homeOfferAccent[service.slug].text}`}
                        aria-hidden="true"
                      >
                        {`0${index + 1}  .${service.href}`}
                      </div>
                    </div>
                  </div>

                  <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mt-auto flex items-center gap-2 pt-7 font-mono text-[0.8125rem] font-bold text-accent">
                    {t('services.cta')}
                    <span
                      className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      -&gt;
                    </span>
                  </div>
                </div>
              </TrackedLink>
            </div>
          ))}
        </div>
      </section>

      <section className={homeSectionGap}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-12">
          <div>
            <PromptLine command="cat ./profile.yml" />
            <h2 className="mt-3 max-w-2xl text-balance font-display text-2xl leading-[1.15] font-bold tracking-tight text-heading sm:text-3xl">
              {t('home.profile.title')}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t('home.profile.body')}
            </p>
          </div>

          <div className={surfaceClass('panel', 'overflow-hidden')}>
            <WindowChrome title="profile.yml" />
            <dl className="divide-y divide-border/70">
              {profileSignals.map((signal, index) => (
                <div
                  key={signal}
                  className="grid grid-cols-[2.25rem_minmax(0,1fr)] sm:grid-cols-[2.75rem_9.5rem_minmax(0,1fr)]"
                >
                  <span
                    className="row-span-2 border-r border-border/70 bg-background/50 py-3.5 pr-2.5 text-right font-mono text-xs leading-6 text-subtle-foreground sm:row-span-1"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                  <dt className="px-4 pt-3.5 font-mono text-xs leading-6 font-bold text-syn-cyan sm:pb-3.5">
                    {t(`home.profile.signals.${signal}.label`)}
                    <span className="text-subtle-foreground" aria-hidden="true">
                      :
                    </span>
                  </dt>
                  <dd className="px-4 pb-3.5 text-sm leading-6 text-foreground sm:pt-3.5 sm:pl-0">
                    {t(`home.profile.signals.${signal}.value`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className={homeSectionGap}>
        <SectionIntro
          eyebrow={t('home.showcase.eyebrow')}
          title={t('home.showcase.title')}
          command="ls ./work"
        >
          <p>{t('home.showcase.intro')}</p>
        </SectionIntro>

        <BryzaPanel
          className={homeSectionContentGap}
          eyebrow={t('home.showcase.bryza.eyebrow')}
          title={t('home.showcase.bryza.title')}
          description={t('home.showcase.bryza.description')}
          supportText={t('home.showcase.bryza.supportText')}
          pipelineLabel={t('home.showcase.bryza.pipelineLabel')}
          ctaLabel={t('home.showcase.bryza.cta')}
          href={site.bryzaUrl}
        />

        <ShowcasePanel
          className="mt-6"
          title={home.publicProject.title}
          imageSrc={home.publicProject.imageSrc}
          imageAlt={home.publicProject.imageAlt}
        >
          <p className="text-base">{home.publicProject.description}</p>
          {home.publicProject.supportText ? (
            <p>{home.publicProject.supportText}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {serviceCards.map((service) => (
              <span
                key={service.slug}
                className={`rounded-sm border border-border bg-background px-2.5 py-1 font-mono text-xs ${homeOfferAccent[service.slug].text}`}
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
        className={homeSectionGap}
      >
        <SectionIntro
          eyebrow={t('home.process.eyebrow')}
          title={t('home.process.title')}
          titleId="how-we-work-title"
          command="cat ./process.md"
        >
          <p>{t('home.process.intro')}</p>
        </SectionIntro>

        <div
          className={surfaceClass('panel', `${homeSectionContentGap} grid overflow-hidden lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)]`)}
        >
          <ol className="divide-y divide-border">
            {home.processCards.map((card, index) => (
              <li
                key={card.title}
                className="grid grid-cols-[3rem_minmax(0,1fr)] sm:grid-cols-[4.5rem_minmax(0,1fr)]"
              >
                <div
                  className="border-r border-border bg-background/50 px-2 py-6 text-center font-mono text-lg font-extrabold text-primary sm:text-2xl"
                  aria-hidden="true"
                >
                  {`0${index + 1}`}
                </div>
                <div className="px-5 py-6 sm:px-7">
                  <div className="font-mono text-xs text-syn-purple">
                    <span aria-hidden="true">{'# '}</span>
                    {card.kicker}
                  </div>
                  <h3 className="mt-2 font-display text-lg leading-snug font-bold tracking-tight text-heading">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {card.body}
                  </p>
                  <p className="mt-4 flex gap-2.5 text-sm leading-relaxed text-syn-green">
                    <span className="font-mono font-bold" aria-hidden="true">
                      =&gt;
                    </span>
                    <span>{card.detail}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col justify-center border-t border-border bg-secondary/60 p-6 sm:p-7 lg:border-l lg:border-t-0">
            <p className="font-mono text-xs text-syn-green">
              <span aria-hidden="true">{'// '}</span>
              {t('home.finalCta.eyebrow')}
            </p>
            <h3 className="mt-3 font-display text-xl leading-snug font-bold tracking-tight text-heading">
              {t('home.finalCta.processTitle')}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {t('home.finalCta.processBody')}
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="home-final-cta" className={homeSectionGap}>
        <div className={surfaceClass('feature', 'not-prose overflow-hidden border-primary/50')}>
          <WindowChrome title="contact" />
          <div className="grid gap-7 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="max-w-3xl">
              <PromptLine command="./contact.sh" caret />
              <h2
                id="home-final-cta"
                className="mt-3 text-balance font-display text-2xl leading-[1.15] font-extrabold tracking-tight text-heading sm:text-3xl"
              >
                {t('home.finalCta.title')}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
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
        </div>
      </section>
    </div>
  );
}
