import type {OfferTrackSlug} from '@/lib/offer-tracks';

export type ProofModuleName = 'WorkflowSnapshot' | 'DeliveryBlueprint' | 'PrototypeSignals';

export type OfferTrackProofProfile = {
  slug: OfferTrackSlug;
  proofModule: ProofModuleName;
  imagePath: string;
  structuralCounts: Record<string, number>;
  requiredSignals: readonly string[];
};

export const OFFER_TRACK_PROOF_PROFILES: readonly OfferTrackProofProfile[] = [
  {
    slug: 'ai-automation',
    proofModule: 'WorkflowSnapshot',
    imagePath: 'services-ai-workflow-board.svg',
    structuralCounts: {
      reviewPoints: 3,
      steps: 3,
    },
    requiredSignals: ['human review', 'source of truth', 'guardrails'],
  },
  {
    slug: 'web-dev',
    proofModule: 'DeliveryBlueprint',
    imagePath: 'web-delivery-board.svg',
    structuralCounts: {
      checklist: 3,
      columns: 3,
      columnPoints: 9,
    },
    requiredSignals: ['SEO', 'performance', 'handover'],
  },
  {
    slug: 'realtime-games',
    proofModule: 'PrototypeSignals',
    imagePath: 'services-realtime-prototype-board.svg',
    structuralCounts: {
      signals: 3,
      phases: 3,
    },
    requiredSignals: ['performance', 'prototype', 'decision'],
  },
];

export function getOfferTrackProofProfile(slug: OfferTrackSlug) {
  return OFFER_TRACK_PROOF_PROFILES.find((profile) => profile.slug === slug) ?? null;
}
