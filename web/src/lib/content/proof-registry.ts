import type {OfferTrackSlug} from '@/lib/offer-tracks';
import type {Locale} from '@/i18n/routing';
import {
  getProofAssetAuthority,
  type ProofAssetAuthority,
} from './proof-asset-authority';

export type ProofModuleName = 'WorkflowSnapshot' | 'DeliveryBlueprint' | 'PrototypeSignals';

export type ProofStructureKey =
  | 'checklist'
  | 'columns'
  | 'columnPoints'
  | 'phases'
  | 'reviewPoints'
  | 'signals'
  | 'steps';

export type ProofStructuralExpectation = {
  key: ProofStructureKey;
  expectedCount: number;
};

export type RequiredProofSignal = {
  concept: string;
  terms: Record<Locale, readonly string[]>;
};

export type OfferTrackProofProfile = {
  slug: OfferTrackSlug;
  proofModule: ProofModuleName;
  imagePath: string;
  authorityId: string;
  structuralCounts: Partial<Record<ProofStructureKey, number>>;
  requiredSignals: readonly RequiredProofSignal[];
};

export type OfferTrackProofContract = {
  slug: OfferTrackSlug;
  render: {
    module: ProofModuleName;
    imagePath: string;
    authorityId: string;
    assetAuthority: ProofAssetAuthority;
  };
  structure: readonly ProofStructuralExpectation[];
  signals: readonly RequiredProofSignal[];
};

export interface ProofRegistryContract {
  readonly profiles: readonly OfferTrackProofProfile[];
  getProfile(slug: OfferTrackSlug): OfferTrackProofProfile | null;
  getContract(slug: OfferTrackSlug): OfferTrackProofContract | null;
  validate(): readonly string[];
}

const PROOF_STRUCTURE_KEYS = new Set<ProofStructureKey>([
  'checklist',
  'columns',
  'columnPoints',
  'phases',
  'reviewPoints',
  'signals',
  'steps',
]);

export const OFFER_TRACK_PROOF_PROFILES = [
  {
    slug: 'ai-automation',
    proofModule: 'WorkflowSnapshot',
    imagePath: 'services-ai-workflow-board.svg',
    authorityId: 'services-ai-workflow-board',
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
    authorityId: 'web-delivery-board',
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
    authorityId: 'services-realtime-prototype-board',
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
] satisfies readonly OfferTrackProofProfile[];

export function getProofStructuralExpectations(
  profile: OfferTrackProofProfile
): readonly ProofStructuralExpectation[] {
  return Object.entries(profile.structuralCounts).map(([key, expectedCount]) => ({
    key: key as ProofStructureKey,
    expectedCount,
  }));
}

export function getOfferTrackProofContract(
  slug: OfferTrackSlug
): OfferTrackProofContract | null {
  const profile = getOfferTrackProofProfile(slug);
  if (!profile) return null;
  const assetAuthority = getProofAssetAuthority(profile.authorityId);
  if (!assetAuthority) return null;

  return {
    slug: profile.slug,
    render: {
      module: profile.proofModule,
      imagePath: profile.imagePath,
      authorityId: profile.authorityId,
      assetAuthority,
    },
    structure: getProofStructuralExpectations(profile),
    signals: profile.requiredSignals,
  };
}

function validateProofProfile(profile: OfferTrackProofProfile): readonly string[] {
  const errors: string[] = [];

  if (!profile.proofModule) errors.push(`${profile.slug} missing proof module`);
  if (!profile.imagePath) errors.push(`${profile.slug} missing proof image`);
  if (!getProofAssetAuthority(profile.authorityId)) errors.push(`${profile.slug} missing proof asset authority`);
  if (profile.requiredSignals.length === 0) errors.push(`${profile.slug} missing proof signals`);

  for (const [key, count] of Object.entries(profile.structuralCounts)) {
    if (!PROOF_STRUCTURE_KEYS.has(key as ProofStructureKey)) {
      errors.push(`${profile.slug} has unsupported structural expectation: ${key}`);
    }
    if (!Number.isInteger(count) || count < 1) {
      errors.push(`${profile.slug} has invalid structural count for ${key}`);
    }
  }

  for (const signal of profile.requiredSignals) {
    for (const locale of ['fr', 'en', 'nl'] as const) {
      if (!signal.terms[locale]?.length) {
        errors.push(`${profile.slug} missing ${locale} terms for ${signal.concept}`);
      }
    }
  }

  return errors;
}

export const proofRegistry: ProofRegistryContract = {
  profiles: OFFER_TRACK_PROOF_PROFILES,
  getProfile: getOfferTrackProofProfile,
  getContract: getOfferTrackProofContract,
  validate() {
    return OFFER_TRACK_PROOF_PROFILES.flatMap((profile) => validateProofProfile(profile));
  },
};

export function getOfferTrackProofProfile(slug: OfferTrackSlug) {
  return OFFER_TRACK_PROOF_PROFILES.find((profile) => profile.slug === slug) ?? null;
}
