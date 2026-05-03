import type {OfferTrackSlug} from '@/lib/offer-tracks';
import type {Locale} from '@/i18n/routing';

export type ProofModuleName = 'WorkflowSnapshot' | 'DeliveryBlueprint' | 'PrototypeSignals';

export type RequiredProofSignal = {
  concept: string;
  terms: Record<Locale, readonly string[]>;
};

export type OfferTrackProofProfile = {
  slug: OfferTrackSlug;
  proofModule: ProofModuleName;
  imagePath: string;
  structuralCounts: Record<string, number>;
  requiredSignals: readonly RequiredProofSignal[];
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
    requiredSignals: [
      {
        concept: 'human review',
        terms: {
          fr: ['validation humaine', 'humain'],
          en: ['human review'],
          nl: ['menselijke review'],
        },
      },
      {
        concept: 'source of truth',
        terms: {
          fr: ['source de verite'],
          en: ['source of truth'],
          nl: ['bron van waarheid'],
        },
      },
      {
        concept: 'guardrails',
        terms: {
          fr: ['garde-fous'],
          en: ['guardrails', 'limits'],
          nl: ['guardrails', 'limieten'],
        },
      },
    ],
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
    requiredSignals: [
      {
        concept: 'SEO',
        terms: {
          fr: ['SEO'],
          en: ['SEO'],
          nl: ['SEO'],
        },
      },
      {
        concept: 'performance',
        terms: {
          fr: ['performance'],
          en: ['performance'],
          nl: ['performance'],
        },
      },
      {
        concept: 'handover',
        terms: {
          fr: ['handover', 'reprise future'],
          en: ['handover'],
          nl: ['handover'],
        },
      },
    ],
  },
  {
    slug: 'realtime-games',
    proofModule: 'PrototypeSignals',
    imagePath: 'services-realtime-prototype-board.svg',
    structuralCounts: {
      signals: 3,
      phases: 3,
    },
    requiredSignals: [
      {
        concept: 'performance',
        terms: {
          fr: ['performance'],
          en: ['performance'],
          nl: ['performance'],
        },
      },
      {
        concept: 'prototype',
        terms: {
          fr: ['prototype'],
          en: ['prototype'],
          nl: ['prototype'],
        },
      },
      {
        concept: 'decision',
        terms: {
          fr: ['decision', 'decisions'],
          en: ['decision', 'decisions'],
          nl: ['beslissing', 'beslissingen'],
        },
      },
    ],
  },
];

export function getOfferTrackProofProfile(slug: OfferTrackSlug) {
  return OFFER_TRACK_PROOF_PROFILES.find((profile) => profile.slug === slug) ?? null;
}
