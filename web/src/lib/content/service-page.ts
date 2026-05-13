import type {Metadata} from 'next';
import {isLocale, routing, type Locale} from '../../i18n/routing';
import {OFFER_TRACK_SLUGS, type OfferTrackSlug} from '../offer-tracks';
import {getOfferTrackPageProfile} from '../page-profiles';
import {getServiceFaqItems} from './service-faq';
import {
  getServiceContentAvailability,
  type ServiceContentLoaderMap,
  type ServiceContentResult,
} from './services';

type Translate = (key: string) => string;

export type ServicePageProofPolicy = {
  offerTrackSlug: OfferTrackSlug;
  renderModule: ServiceContentResult['proofContract']['render']['module'];
  imagePath: ServiceContentResult['proofContract']['render']['imagePath'];
  assetAuthority: ServiceContentResult['proofContract']['render']['assetAuthority'];
  structuralExpectations: ServiceContentResult['proofContract']['structure'];
  requiredSignals: ServiceContentResult['proofContract']['signals'];
};

export type ServicePageStaticParam = {
  locale: Locale;
  slug: OfferTrackSlug;
};

export type ServicePageModel = {
  content: ServiceContentResult;
  profile: ReturnType<typeof getOfferTrackPageProfile>;
  proofPolicy: ServicePageProofPolicy;
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
  loaders,
}: {
  locale: string;
  slug: string;
  translate?: Translate;
  loaders?: ServiceContentLoaderMap;
}): Promise<ServicePageModel | null> {
  if (!isServicePageLocale(locale)) return null;

  const availability = await getServiceContentAvailability(locale, slug, {loaders});
  if (availability.status !== 'localized' && availability.status !== 'fallback') return null;

  const content = availability;

  const title = content.metadata.title || content.slug;
  const description = content.metadata.description || '';
  const faqItems = getServiceFaqItems(content.renderPolicy.requestedLocale, content.slug);
  const profile = getOfferTrackPageProfile({
    locale: content.renderPolicy.requestedLocale,
    slug: content.slug,
    title,
    description,
    translate,
    faqItems,
  });

  return {
    content,
    profile,
    proofPolicy: {
      offerTrackSlug: content.proofContract.slug,
      renderModule: content.proofContract.render.module,
      imagePath: content.proofContract.render.imagePath,
      assetAuthority: content.proofContract.render.assetAuthority,
      structuralExpectations: content.proofContract.structure,
      requiredSignals: content.proofContract.signals,
    },
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
