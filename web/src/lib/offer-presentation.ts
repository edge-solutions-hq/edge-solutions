import {OFFER_TRACKS, type OfferTrackSlug} from '@/lib/offer-tracks';

type Translate = (key: string) => string;

export type OfferPresentationRole = 'primary' | 'supporting';
export type OfferVisualRole = 'primary-offer' | 'supporting-offer';
export type OfferVisualEmphasis = 'high' | 'supporting';
export type OfferVisualGroup = 'ai-primary' | 'execution-depth';

type OfferVisualPresentation = {
  priorityRole: OfferPresentationRole;
  visualRole: OfferVisualRole;
  visualEmphasis: OfferVisualEmphasis;
  visualGroup: OfferVisualGroup;
  isPrimary: boolean;
};

export type HeaderOfferNavItem = {
  href: string;
  label: string;
  slug: OfferTrackSlug;
} & OfferVisualPresentation;

export type HomeOfferCard = {
  href: string;
  label: string;
  description: string;
  slug: OfferTrackSlug;
} & OfferVisualPresentation;

export type ServicesHubOfferCard = {
  href: string;
  label: string;
  triggerLabel: string;
  description: string;
  proofCue: string;
  slug: OfferTrackSlug;
} & OfferVisualPresentation;

export type ServicesDecisionItem = {
  slug: OfferTrackSlug;
  label: string;
} & OfferVisualPresentation;

function offerVisualPresentation(priorityRole: OfferPresentationRole): OfferVisualPresentation {
  if (priorityRole === 'primary') {
    return {
      priorityRole,
      visualRole: 'primary-offer',
      visualEmphasis: 'high',
      visualGroup: 'ai-primary',
      isPrimary: true,
    };
  }

  return {
    priorityRole,
    visualRole: 'supporting-offer',
    visualEmphasis: 'supporting',
    visualGroup: 'execution-depth',
    isPrimary: false,
  };
}

function assertSinglePrimaryOfferTrack() {
  const primaryCount = OFFER_TRACKS.filter((track) => track.priorityRole === 'primary').length;

  if (primaryCount !== 1) {
    throw new Error(`Expected exactly one primary offer track, found ${primaryCount}.`);
  }
}

export function getHeaderOfferNavItems(translate: Translate): HeaderOfferNavItem[] {
  assertSinglePrimaryOfferTrack();

  return OFFER_TRACKS.map((track) => ({
    href: track.path,
    label: translate(track.navKey),
    slug: track.slug,
    ...offerVisualPresentation(track.priorityRole),
  }));
}

export function getHomeOfferCards(translate: Translate): HomeOfferCard[] {
  assertSinglePrimaryOfferTrack();

  return OFFER_TRACKS.map((track) => ({
    href: track.path,
    label: translate(track.titleKey),
    description: translate(track.descriptionKey),
    slug: track.slug,
    ...offerVisualPresentation(track.priorityRole),
  }));
}

export function getServicesHubOfferCards(translate: Translate): ServicesHubOfferCard[] {
  assertSinglePrimaryOfferTrack();

  return OFFER_TRACKS.map((track) => ({
    href: track.path,
    label: translate(track.titleKey),
    triggerLabel: translate(track.hubTriggerKey),
    description: translate(track.hubDescriptionKey),
    proofCue: translate(track.hubProofKey),
    slug: track.slug,
    ...offerVisualPresentation(track.priorityRole),
  }));
}

export function getServicesDecisionItems(translate: Translate): ServicesDecisionItem[] {
  assertSinglePrimaryOfferTrack();

  return OFFER_TRACKS.map((track) => ({
    slug: track.slug,
    label: translate(track.decisionKey),
    ...offerVisualPresentation(track.priorityRole),
  }));
}
