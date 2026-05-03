import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {getServicesDecisionItems, getServicesHubOfferCards} from '@/lib/offer-presentation';
import {getServicesPageProfile} from '@/lib/page-profiles';
import {JsonLd} from '@/components/seo/JsonLd';

type Props = {
  params: Promise<{locale: string}>;
};

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
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('services.hubTitle')}
        </h1>

        <p className="text-base leading-7 text-muted-foreground">
          {t('services.hubIntro')}
        </p>
      </header>

      <section
        aria-labelledby="services-decision-strip"
        className="rounded-lg border border-border bg-surface p-5"
      >
        <h2
          id="services-decision-strip"
          className="text-sm font-semibold uppercase tracking-wide text-subtle-foreground"
        >
          {t('services.decisionTitle')}
        </h2>

        <div className="mt-4 grid gap-3 text-sm leading-6 text-foreground md:grid-cols-3">
          {decisionItems.map((item) => (
            <p key={item.slug} className="rounded-md bg-surface-muted px-4 py-3">
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
            className="group rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="text-xs font-medium uppercase tracking-wide text-subtle-foreground">
                  {service.triggerLabel}
                </div>
                <div className="text-lg font-semibold">{service.label}</div>
              </div>
              <span
                className="mt-0.5 text-sm text-subtle-foreground transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                aria-hidden="true"
              >
                →
              </span>
            </div>

            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {service.description}
            </p>

            <p className="mt-4 border-t border-border pt-4 text-sm leading-6 text-foreground">
              {service.proofCue}
            </p>

            <div className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-link">
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
