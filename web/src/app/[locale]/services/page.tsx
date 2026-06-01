import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {surfaceClass} from '@/components/ui/Surface';
import {getServicesDecisionItems, getServicesHubOfferCards} from '@/lib/offer-presentation';
import {getServicesPageProfile} from '@/lib/page-profiles';
import {JsonLd} from '@/components/seo/JsonLd';

type ServicesHubOfferCard = ReturnType<typeof getServicesHubOfferCards>[number];
type ServicesDecisionItem = ReturnType<typeof getServicesDecisionItems>[number];

type Props = {
  params: Promise<{locale: string}>;
};

function servicesDecisionItemClass(item: ServicesDecisionItem) {
  return [
    'rounded-md px-4 py-3',
    item.visualEmphasis === 'high'
      ? 'border border-primary/35 bg-background text-foreground'
      : 'bg-surface-muted text-foreground',
  ].join(' ');
}

function servicesOfferCardClass(service: ServicesHubOfferCard) {
  return [
    surfaceClass('interactive-card', 'group relative overflow-hidden p-6 pt-8'),
    service.visualRole === 'primary-offer'
      ? 'border-primary/65 md:col-span-2 xl:col-span-2'
      : undefined,
  ].join(' ');
}

function servicesOfferTitleClass(service: ServicesHubOfferCard) {
  return service.visualEmphasis === 'high'
    ? 'text-xl font-semibold tracking-tight text-technical-blue'
    : 'text-lg font-semibold text-technical-blue';
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
    <div className="space-y-8">
      <JsonLd
        data={profile.jsonLd}
      />

      <header className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-technical-blue">
          {t('services.hubTitle')}
        </h1>

        <p className="text-base leading-7 text-muted-foreground">
          {t('services.hubIntro')}
        </p>
      </header>

      <section
        aria-labelledby="services-decision-strip"
        className={surfaceClass('card', 'p-5')}
      >
        <h2
          id="services-decision-strip"
          className="text-sm font-semibold uppercase tracking-wide text-subtle-foreground"
        >
          {t('services.decisionTitle')}
        </h2>

        <div className="mt-4 grid gap-3 text-sm leading-6 text-foreground md:grid-cols-2">
          {decisionItems.map((item) => (
            <p key={item.slug} className={servicesDecisionItemClass(item)}>
              {item.label}
            </p>
          ))}
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <TrackedLink
            key={service.slug}
            href={service.href}
            aria-label={service.label}
            offerTrackSlug={service.slug}
            trackingPlacement="services_index_grid"
            className={servicesOfferCardClass(service)}
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
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                  {service.triggerLabel}
                </div>
                <div className={servicesOfferTitleClass(service)}>{service.label}</div>
              </div>
              <span
                className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </div>

            <p className="relative z-10 mt-2 line-clamp-3 text-sm text-muted-foreground">
              {service.description}
            </p>

            <p className="relative z-10 mt-4 border-t border-border pt-4 text-sm leading-6 text-foreground">
              {service.checkCue}
            </p>

            <div className="relative z-10 mt-5 inline-flex items-center gap-1 text-sm font-medium text-link">
              {t('services.cta')}
              <span
                className="transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </div>
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}
