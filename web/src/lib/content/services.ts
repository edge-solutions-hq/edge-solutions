import {resolveLocale, type Locale} from '../../i18n/routing';
import {
  isOfferTrackSlug,
  OFFER_TRACK_SLUGS,
  type OfferTrackSlug,
} from '../offer-tracks';
import {
  getOfferTrackProofContract,
  getOfferTrackProofProfile,
  type OfferTrackProofContract,
  type OfferTrackProofProfile,
} from './proof-registry';

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

export type ServiceContentLoaderMap = Record<Locale, Partial<Record<ServiceSlug, Loader>>>;

type ServiceContentAvailabilityBase = {
  slug: ServiceSlug;
  requestedLocale: Locale;
};

export type ServiceContentAvailabilityHit = ServiceContentAvailabilityBase & {
  status: 'localized' | 'fallback';
  contentLocale: Locale;
  didFallback: boolean;
  renderPolicy: {
    kind: 'localized' | 'fallback';
    requestedLocale: Locale;
    contentLocale: Locale;
  };
  proof: OfferTrackProofProfile;
  proofContract: OfferTrackProofContract;
  module: MdxModule;
  metadata: {
    title?: string;
    description?: string;
  };
};

export type ServiceContentAvailability =
  | ServiceContentAvailabilityHit
  | {
      status: 'invalid_slug';
      requestedLocale: Locale;
      slug: string;
    }
  | (ServiceContentAvailabilityBase & {
      status: 'missing_fallback';
      fallbackLocale: Locale;
    })
  | (ServiceContentAvailabilityBase & {
      status: 'loader_failure';
      attemptedLocale: Locale;
      error: unknown;
    });

export type ServiceContentResult = ServiceContentAvailabilityHit;

const serviceContentLoaders: ServiceContentLoaderMap = {
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

async function loadServiceModule(loader: Loader): Promise<{module: MdxModule} | {error: unknown}> {
  try {
    return {module: await loader()};
  } catch (error) {
    return {error};
  }
}

export async function getServiceContentAvailability(
  locale: string,
  slug: string,
  options: {loaders?: ServiceContentLoaderMap} = {}
): Promise<ServiceContentAvailability> {
  const safeLocale = resolveLocale(locale);

  if (!isOfferTrackSlug(slug)) {
    return {
      status: 'invalid_slug',
      requestedLocale: safeLocale,
      slug,
    };
  }

  const typedSlug = slug;
  const activeLoaders = options.loaders ?? serviceContentLoaders;
  const preferred = activeLoaders[safeLocale][typedSlug];
  const fallback = activeLoaders.fr[typedSlug];

  if (!fallback) {
    return {
      status: 'missing_fallback',
      slug: typedSlug,
      requestedLocale: safeLocale,
      fallbackLocale: 'fr',
    };
  }

  const proof = getOfferTrackProofProfile(typedSlug);
  const proofContract = getOfferTrackProofContract(typedSlug);
  if (!proof || !proofContract) {
    return {
      status: 'missing_fallback',
      slug: typedSlug,
      requestedLocale: safeLocale,
      fallbackLocale: 'fr',
    };
  }

  if (preferred) {
    const loaded = await loadServiceModule(preferred);
    if ('error' in loaded) {
      return {
        status: 'loader_failure',
        slug: typedSlug,
        requestedLocale: safeLocale,
        attemptedLocale: safeLocale,
        error: loaded.error,
      };
    }

    return {
      status: 'localized',
      slug: typedSlug,
      requestedLocale: safeLocale,
      contentLocale: safeLocale,
      didFallback: false,
      renderPolicy: {
        kind: 'localized',
        requestedLocale: safeLocale,
        contentLocale: safeLocale,
      },
      proof,
      proofContract,
      module: loaded.module,
      metadata: loaded.module.metadata ?? {},
    };
  }

  if (safeLocale === 'fr') {
    return {
      status: 'missing_fallback',
      slug: typedSlug,
      requestedLocale: safeLocale,
      fallbackLocale: 'fr',
    };
  }

  const loadedFallback = await loadServiceModule(fallback);
  if ('error' in loadedFallback) {
    return {
      status: 'loader_failure',
      slug: typedSlug,
      requestedLocale: safeLocale,
      attemptedLocale: 'fr',
      error: loadedFallback.error,
    };
  }

  return {
    status: 'fallback',
    slug: typedSlug,
    requestedLocale: safeLocale,
    contentLocale: 'fr',
    didFallback: true,
    renderPolicy: {
      kind: 'fallback',
      requestedLocale: safeLocale,
      contentLocale: 'fr',
    },
    proof,
    proofContract,
    module: loadedFallback.module,
    metadata: loadedFallback.module.metadata ?? {},
  };
}

export async function getServiceContent(locale: string, slug: string): Promise<ServiceContentResult | null> {
  const availability = await getServiceContentAvailability(locale, slug);
  if (availability.status !== 'localized' && availability.status !== 'fallback') return null;
  return availability;
}
