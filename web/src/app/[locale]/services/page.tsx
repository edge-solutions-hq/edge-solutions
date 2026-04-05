import type {Metadata} from 'next';
import {setRequestLocale} from 'next-intl/server';
import {getTranslations} from 'next-intl/server';
import {TrackedLink} from '@/components/ui/TrackedLink';
import {buildLocaleAlternates} from '@/lib/seo';

type Props = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale} = await params;

  const titleByLocale: Record<string, string> = {
    fr: 'Services IA, web et 3D/VR pour entreprises en Wallonie',
    en: 'AI, web development and 3D/VR services in Belgium',
    nl: 'AI-, webontwikkelings- en 3D/VR-diensten in België',
  };

  const descriptionByLocale: Record<string, string> = {
    fr: 'Services Edge Solutions : systèmes IA, automatisation, développement web, SEO technique et expériences temps réel 3D/VR pour PME et recruteurs en Wallonie.',
    en: 'Edge Solutions services: AI systems, automation, web development, technical SEO and real-time 3D/VR experiences for Belgian businesses and recruiters.',
    nl: 'Diensten van Edge Solutions: AI-systemen, automatisatie, webontwikkeling, technische SEO en realtime 3D/VR-ervaringen voor Belgische bedrijven en recruiters.',
  };

  return {
    title: titleByLocale[locale] || titleByLocale.en,
    description: descriptionByLocale[locale] || descriptionByLocale.en,
    alternates: buildLocaleAlternates(locale, '/services'),
  };
}

export default async function ServicesIndexPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const services = [
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

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {t('services.title')}
        </h1>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <TrackedLink
            key={service.slug}
            href={service.href}
            aria-label={service.label}
            eventName="service_card_click"
            eventParams={{
              service_slug: service.slug,
              placement: 'services_index_grid',
            }}
            className="group rounded-lg border border-border bg-surface p-6 shadow-sm transition-colors hover:bg-surface-muted hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
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

            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
              {service.description}
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
