import {resolveLocale, type Locale} from '@/i18n/routing';
import {
  isOfferTrackSlug,
  OFFER_TRACK_SLUGS,
  type OfferTrackSlug,
} from '@/lib/offer-tracks';

export type ServiceSlug = OfferTrackSlug;
export const SERVICE_SLUGS = OFFER_TRACK_SLUGS;

type MdxModule = {
  default: React.ComponentType;
  metadata?: {
    title?: string;
    description?: string;
  };
};

type Loader = () => Promise<MdxModule>;

export type ServiceContentResult = {
  slug: ServiceSlug;
  requestedLocale: Locale;
  contentLocale: Locale;
  didFallback: boolean;
  module: MdxModule;
  metadata: {
    title?: string;
    description?: string;
  };
};

const loaders: Record<Locale, Partial<Record<ServiceSlug, Loader>>> = {
  fr: {
    'ai-automation': () => import('@/content/fr/services/ai-automation.mdx'),
    'web-dev': () => import('@/content/fr/services/web-dev.mdx'),
    'realtime-games': () => import('@/content/fr/services/realtime-games.mdx'),
  },
  en: {
    'ai-automation': () => import('@/content/en/services/ai-automation.mdx'),
    'web-dev': () => import('@/content/en/services/web-dev.mdx'),
    'realtime-games': () => import('@/content/en/services/realtime-games.mdx'),
  },
  nl: {
    'ai-automation': () => import('@/content/nl/services/ai-automation.mdx'),
    'web-dev': () => import('@/content/nl/services/web-dev.mdx'),
    'realtime-games': () => import('@/content/nl/services/realtime-games.mdx'),
  },
};

export async function getServiceContent(locale: string, slug: string): Promise<ServiceContentResult | null> {
  const safeLocale = resolveLocale(locale);

  if (!isOfferTrackSlug(slug)) return null;

  const typedSlug = slug;

  const preferred = loaders[safeLocale][typedSlug];
  const fallback = loaders.fr[typedSlug];
  if (!fallback) return null;

  const preferredModule = preferred ? await preferred().catch(() => null) : null;
  const shouldTryFallback = !preferredModule && safeLocale !== 'fr';
  const fallbackModule = shouldTryFallback ? await fallback().catch(() => null) : null;
  const mod = preferredModule ?? fallbackModule;

  if (!mod) return null;

  const didFallback = !preferredModule && safeLocale !== 'fr';

  return {
    slug: typedSlug,
    requestedLocale: safeLocale,
    contentLocale: didFallback ? 'fr' : safeLocale,
    didFallback,
    module: mod,
    metadata: mod.metadata ?? {},
  };
}

export async function getServiceMdx(locale: string, slug: string) {
  const result = await getServiceContent(locale, slug);
  return result?.module ?? null;
}
