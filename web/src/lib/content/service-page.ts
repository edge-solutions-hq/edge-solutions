import type {Metadata} from 'next';
import {isLocale, routing, type Locale} from '../../i18n/routing';
import {OFFER_TRACK_SLUGS, type OfferTrackSlug} from '../offer-tracks';
import {getOfferTrackPageProfile} from '../page-profiles';
import {getServiceContent, type ServiceContentResult} from './services';

type Translate = (key: string) => string;

export type ServicePageStaticParam = {
  locale: Locale;
  slug: OfferTrackSlug;
};

export type ServicePageModel = {
  content: ServiceContentResult;
  profile: ReturnType<typeof getOfferTrackPageProfile>;
  title: string;
  description: string;
  scrollTracking: {
    offerTrackSlug: OfferTrackSlug;
  };
};

export function isServicePageLocale(locale: string): locale is Locale {
  return isLocale(locale);
}

export function getServicePageStaticParams(): ServicePageStaticParam[] {
  return routing.locales.flatMap((locale) =>
    OFFER_TRACK_SLUGS.map((slug) => ({locale, slug}))
  );
}

export async function getServicePageModel({
  locale,
  slug,
  translate,
}: {
  locale: string;
  slug: string;
  translate?: Translate;
}): Promise<ServicePageModel | null> {
  if (!isServicePageLocale(locale)) return null;

  const content = await getServiceContent(locale, slug);
  if (!content) return null;

  const title = content.metadata.title || content.slug;
  const description = content.metadata.description || '';
  const profile = getOfferTrackPageProfile({
    locale: content.renderPolicy.requestedLocale,
    slug: content.slug,
    title,
    description,
    translate,
  });

  return {
    content,
    profile,
    title,
    description,
    scrollTracking: {
      offerTrackSlug: content.slug,
    },
  };
}

export async function getServicePageMetadata({
  locale,
  slug,
}: {
  locale: string;
  slug: string;
}): Promise<Metadata> {
  const model = await getServicePageModel({locale, slug});
  return model?.profile.metadata ?? {};
}
