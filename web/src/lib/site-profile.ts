import type {Metadata} from 'next';
import {resolveLocale, type Locale} from '../i18n/routing';
import {site} from './site';
import {buildLocalizedPageMetadata, organizationSchema} from './seo';

type LocalizedCopy = Record<Locale, string>;

export type RootLayoutProfile = {
  metadata: Metadata;
  organizationSchema: typeof organizationSchema;
};

const rootDescription: LocalizedCopy = {
  fr: 'Systèmes IA, automatisation, développement web et technologies temps réel en Belgique. Workflows utiles, sites performants et expériences 3D/VR.',
  en: 'AI systems, automation, web development and real-time technology in Belgium. Useful workflows, high-performance websites and 3D/VR experiences.',
  nl: 'AI-systemen, automatisatie, webontwikkeling en realtime technologie in België. Nuttige workflows, performante websites en 3D/VR-ervaringen.',
};

export function getRootLayoutProfile(locale: string): RootLayoutProfile {
  const safeLocale = resolveLocale(locale);
  const title = `${site.personalBrand} · ${site.companyName}`;

  return {
    metadata: {
      metadataBase: new URL(site.url),
      ...buildLocalizedPageMetadata({
        locale: safeLocale,
        title,
        description: rootDescription[safeLocale],
      }),
      title: {
        default: title,
        template: `%s · ${site.companyName}`,
      },
    },
    organizationSchema,
  };
}
