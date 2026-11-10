import {resolveLocale, type Locale} from '../../i18n/routing';
import {
  isOfferTrackSlug,
  type OfferTrackSlug,
} from '../offer/offer-tracks';
import {
  getOfferTrackEvidenceContract,
  getOfferTrackEvidenceProfile,
  type OfferTrackEvidenceContract,
  type OfferTrackEvidenceProfile,
} from './service-evidence-registry';

type MdxModule = {
  default: React.ComponentType;
  metadata?: {
    title?: string;
    description?: string;
  };
};

type Loader = () => Promise<MdxModule>;

export type ServiceContentLoaderMap = Record<Locale, Partial<Record<OfferTrackSlug, Loader>>>;

type ServiceContentAvailabilityBase = {
  slug: OfferTrackSlug;
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
  evidence: OfferTrackEvidenceProfile;
  evidenceContract: OfferTrackEvidenceContract;
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
    'realtime-games': () => import('@/content/fr/services/realtime-games.mdx'),
  },
  en: {
    'ai-automation': () => import('@/content/en/services/ai-automation.mdx'),
    'realtime-games': () => import('@/content/en/services/realtime-games.mdx'),
  },
  nl: {
    'ai-automation': () => import('@/content/nl/services/ai-automation.mdx'),
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

  const evidence = getOfferTrackEvidenceProfile(typedSlug);
  const evidenceContract = getOfferTrackEvidenceContract(typedSlug);
  if (!evidence || !evidenceContract) {
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
      evidence,
      evidenceContract,
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
    evidence,
    evidenceContract,
    module: loadedFallback.module,
    metadata: loadedFallback.module.metadata ?? {},
  };
}
