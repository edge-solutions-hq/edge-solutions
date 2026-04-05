export type Locale = 'fr' | 'en' | 'nl';

export type ServiceSlug = 'ai-automation' | 'web-dev' | 'realtime-games';
export const SERVICE_SLUGS: ServiceSlug[] = [
  'ai-automation',
  'web-dev',
  'realtime-games',
];

type MdxModule = {
  default: React.ComponentType;
  metadata?: {
    title?: string;
    description?: string;
  };
};

type Loader = () => Promise<MdxModule>;

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

const LOCALES: Locale[] = ['fr', 'en', 'nl'];

export async function getServiceMdx(locale: string, slug: string) {
  const safeLocale: Locale = (LOCALES.includes(locale as Locale)
    ? (locale as Locale)
    : 'fr') as Locale;

  if (!SERVICE_SLUGS.includes(slug as ServiceSlug)) return null;

  const typedSlug = slug as ServiceSlug;

  const preferred = loaders[safeLocale][typedSlug];
  const fallback = loaders.fr[typedSlug];
  if (!fallback) return null;

  const load = preferred ?? fallback;

  const mod =
    (await load().catch(() => null)) ??
    (safeLocale === 'fr' ? null : await fallback().catch(() => null));

  return mod;
}

