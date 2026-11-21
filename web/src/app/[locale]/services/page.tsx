import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {surfaceClass} from '@/components/ui/Surface';
import {getServicesDecisionItems, getServicesHubOfferCards} from '@/lib/offer/offer-presentation';
import {getServicesPageProfile} from '@/lib/site/page-profiles';
import {JsonLd} from '@/components/seo/JsonLd';
import {PromptLine} from '@/components/ui/WindowChrome';

type ServicesHubOfferCard = ReturnType<typeof getServicesHubOfferCards>[number];
type ServicesDecisionItem = ReturnType<typeof getServicesDecisionItems>[number];

type Props = {
  params: Promise<{locale: string}>;
};

function servicesDecisionItemClass(item: ServicesDecisionItem) {
  return [
    'flex gap-3 rounded-md border bg-background/70 px-4 py-3',
    item.visualEmphasis === 'high'
      ? 'border-syn-green/50 text-foreground'
      : 'border-syn-cyan/50 text-foreground',
  ].join(' ');
}

function servicesOfferCardClass(service: ServicesHubOfferCard) {
  return [
    surfaceClass('interactive-card', 'group relative flex flex-col overflow-hidden p-6 sm:p-7'),
    service.visualRole === 'primary-offer' ? 'order-first' : undefined,
  ].join(' ');
}

function servicesOfferAccentClass(service: ServicesHubOfferCard) {
  return service.visualRole === 'primary-offer'
    ? {text: 'text-syn-green', bar: 'bg-syn-green'}
    : {text: 'text-syn-cyan', bar: 'bg-syn-cyan'};
}

function servicesOfferTitleClass(service: ServicesHubOfferCard) {
  // Same size for both families; emphasis only picks the syntax accent.
  return [
    'font-display text-xl font-bold tracking-tight text-heading decoration-2 underline-offset-4 group-hover:underline',
    service.visualEmphasis === 'high' ? 'decoration-syn-green' : 'decoration-syn-cyan',
  ].join(' ');
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;
  return getServicesPageProfile(locale).metadata;
}

export default async function ServicesIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const decisionItems = getServicesDecisionItems(t);
  const services = getServicesHubOfferCards(t);
  const profile = getServicesPageProfile(locale, {translate: t});

  return (
    <div className="space-y-10">
      <JsonLd
        data={profile.jsonLd}
      />

      <header className="max-w-3xl">
        <PromptLine command="ls ./services" typed caret />
        <h1 className="mt-4 text-balance font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-heading sm:text-4xl">
          {t('services.hubTitle')}
        </h1>

        <p className="mt-6 border-l-2 border-primary/60 pl-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
          {t('services.hubIntro')}
        </p>
      </header>

      <section
        aria-labelledby="services-decision-strip"
        className={surfaceClass('card', 'overflow-hidden')}
      >
        <h2
          id="services-decision-strip"
          className="border-b border-border bg-secondary/70 px-5 py-2.5 font-mono text-xs text-syn-green"
        >
          <span aria-hidden="true">{'// '}</span>
          {t('services.decisionTitle')}
        </h2>

        <div className="grid gap-3 p-5 text-sm leading-6 text-foreground md:grid-cols-2">
          {decisionItems.map((item) => (
            <p key={item.slug} className={servicesDecisionItemClass(item)}>
              <span className="font-mono font-bold text-primary" aria-hidden="true">
                &gt;
              </span>
              <span>{item.label}</span>
            </p>
          ))}
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {services.map((service) => (
          <TrackedLink
            key={service.slug}
            href={service.href}
            trackingLabel={service.label}
            offerTrackSlug={service.slug}
            trackingPlacement="services_index_grid"
            className={servicesOfferCardClass(service)}
          >
            <span
              className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 ${servicesOfferAccentClass(service).bar}`}
              aria-hidden="true"
            />

            <div className={`font-mono text-xs ${servicesOfferAccentClass(service).text}`}>
              <span aria-hidden="true">{'// '}</span>
              {service.triggerLabel}
            </div>
            <div className={`mt-2 ${servicesOfferTitleClass(service)}`}>{service.label}</div>

            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {service.description}
            </p>

            <p className="mt-5 border-t border-border pt-4 text-sm leading-6 text-foreground">
              {service.checkCue}
            </p>

            <div className="mt-auto flex items-center gap-2 pt-6 font-mono text-[0.8125rem] font-bold text-accent">
              {t('services.cta')}
              <span
                className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                aria-hidden="true"
              >
                -&gt;
              </span>
            </div>
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}
