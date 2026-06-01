import type {Metadata} from 'next';
import {resolveLocale, type Locale} from '../i18n/routing';
import {site} from './site';
import {buildLocalizedPageMetadata, organizationSchema, personSchema} from './seo';

type LocalizedCopy = Record<Locale, string>;

export type RootLayoutProfile = {
  jsonLd: unknown[];
  metadata: Metadata;
  organizationSchema: typeof organizationSchema;
  personSchema: typeof personSchema;
};

const rootDescription: LocalizedCopy = {
  fr: 'Automatisations IA et technologies temps réel en Belgique. Audit de tâches répétitives, assistants internes et applications 3D / XR.',
  en: 'AI automation and real-time technology in Belgium. Repeated-task audits, internal assistants and 3D / XR applications.',
  nl: 'AI-automatisatie en realtime technologie in België. Audit van repetitieve taken, interne assistenten en 3D / XR-applicaties.',
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
    jsonLd: [organizationSchema, personSchema],
    organizationSchema,
    personSchema,
  };
}
