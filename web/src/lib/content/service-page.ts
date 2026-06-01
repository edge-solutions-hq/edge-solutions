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

export type ServicePageEvidencePolicy = {
  offerTrackSlug: OfferTrackSlug;
  renderModule: ServiceContentResult['evidenceContract']['render']['module'];
  imagePath: ServiceContentResult['evidenceContract']['render']['imagePath'];
  assetAuthority: ServiceContentResult['evidenceContract']['render']['assetAuthority'];
  structuralExpectations: ServiceContentResult['evidenceContract']['structure'];
  requiredSignals: ServiceContentResult['evidenceContract']['signals'];
};

export type ServicePageStaticParam = {
  locale: Locale;
  slug: OfferTrackSlug;
};

export type ServicePageModel = {
  content: ServiceContentResult;
  profile: ReturnType<typeof getOfferTrackPageProfile>;
  evidencePolicy: ServicePageEvidencePolicy;
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
    evidencePolicy: {
      offerTrackSlug: content.evidenceContract.slug,
      renderModule: content.evidenceContract.render.module,
      imagePath: content.evidenceContract.render.imagePath,
      assetAuthority: content.evidenceContract.render.assetAuthority,
      structuralExpectations: content.evidenceContract.structure,
      requiredSignals: content.evidenceContract.signals,
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
