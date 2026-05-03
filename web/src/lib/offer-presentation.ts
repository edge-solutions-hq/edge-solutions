import {OFFER_TRACKS, type OfferTrackSlug} from '@/lib/offer-tracks';

type Translate = (key: string) => string;

export type OfferPresentationRole = 'primary' | 'supporting';

export type HeaderOfferNavItem = {
  href: string;
  label: string;
  slug: OfferTrackSlug;
  priorityRole: OfferPresentationRole;
};

export type HomeOfferCard = {
  href: string;
  label: string;
  description: string;
  slug: OfferTrackSlug;
  priorityRole: OfferPresentationRole;
};

export type ServicesHubOfferCard = {
  href: string;
  label: string;
  triggerLabel: string;
  description: string;
  proofCue: string;
  slug: OfferTrackSlug;
  priorityRole: OfferPresentationRole;
};

export type ServicesDecisionItem = {
  slug: OfferTrackSlug;
  label: string;
  priorityRole: OfferPresentationRole;
};

export function getHeaderOfferNavItems(translate: Translate): HeaderOfferNavItem[] {
  return OFFER_TRACKS.map((track) => ({
    href: track.path,
    label: translate(track.navKey),
    slug: track.slug,
    priorityRole: track.priorityRole,
  }));
}

export function getHomeOfferCards(translate: Translate): HomeOfferCard[] {
  return OFFER_TRACKS.map((track) => ({
    href: track.path,
    label: translate(track.titleKey),
    description: translate(track.descriptionKey),
    slug: track.slug,
    priorityRole: track.priorityRole,
  }));
}

export function getServicesHubOfferCards(translate: Translate): ServicesHubOfferCard[] {
  return OFFER_TRACKS.map((track) => ({
    href: track.path,
    label: translate(track.titleKey),
    triggerLabel: translate(track.hubTriggerKey),
    description: translate(track.hubDescriptionKey),
    proofCue: translate(track.hubProofKey),
    slug: track.slug,
    priorityRole: track.priorityRole,
  }));
}

export function getServicesDecisionItems(translate: Translate): ServicesDecisionItem[] {
  return OFFER_TRACKS.map((track) => ({
    slug: track.slug,
    label: translate(track.decisionKey),
    priorityRole: track.priorityRole,
  }));
}
