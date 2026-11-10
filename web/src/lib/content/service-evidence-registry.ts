import type {OfferTrackSlug} from '@/lib/offer/offer-tracks';
import type {Locale} from '@/i18n/routing';
import {
  getAssetAuthorityRecord,
  type AssetAuthorityRecord,
} from './asset-authority';

export type EvidenceModuleName = 'WorkflowSnapshot' | 'PrototypeSignals';

export type EvidenceStructureKey =
  | 'checklist'
  | 'columns'
  | 'columnPoints'
  | 'phases'
  | 'reviewPoints'
  | 'signals'
  | 'steps';

export type EvidenceStructuralExpectation = {
  key: EvidenceStructureKey;
  expectedCount: number;
};

export type RequiredEvidenceSignal = {
  concept: string;
  terms: Record<Locale, readonly string[]>;
};

export type OfferTrackEvidenceProfile = {
  slug: OfferTrackSlug;
  evidenceModule: EvidenceModuleName;
  imagePath: string;
  authorityId: string;
  structuralCounts: Partial<Record<EvidenceStructureKey, number>>;
  requiredSignals: readonly RequiredEvidenceSignal[];
};

export type OfferTrackEvidenceContract = {
  slug: OfferTrackSlug;
  render: {
    module: EvidenceModuleName;
    imagePath: string;
    authorityId: string;
    assetAuthority: AssetAuthorityRecord;
  };
  structure: readonly EvidenceStructuralExpectation[];
  signals: readonly RequiredEvidenceSignal[];
};

export interface EvidenceRegistryContract {
  readonly profiles: readonly OfferTrackEvidenceProfile[];
  getProfile(slug: OfferTrackSlug): OfferTrackEvidenceProfile | null;
  getContract(slug: OfferTrackSlug): OfferTrackEvidenceContract | null;
  validate(): readonly string[];
}

const EVIDENCE_STRUCTURE_KEYS = new Set<EvidenceStructureKey>([
  'checklist',
  'columns',
  'columnPoints',
  'phases',
  'reviewPoints',
  'signals',
  'steps',
]);

export const OFFER_TRACK_EVIDENCE_PROFILES = [
  {
    slug: 'ai-automation',
    evidenceModule: 'WorkflowSnapshot',
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
          fr: ['source de vérité'],
          en: ['source of truth'],
          nl: ['bron van waarheid'],
        },
      },
      {
        concept: 'action limits',
        terms: {
          fr: ['limites d’action', 'limites'],
          en: ['action limits', 'limits'],
          nl: ['actielimieten', 'limieten'],
        },
      },
    ],
  },
  {
    slug: 'realtime-games',
    evidenceModule: 'PrototypeSignals',
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
        concept: 'first version',
        terms: {
          fr: ['première version', 'version'],
          en: ['first version', 'version'],
          nl: ['eerste versie', 'versie'],
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
] satisfies readonly OfferTrackEvidenceProfile[];

export function getEvidenceStructuralExpectations(
  profile: OfferTrackEvidenceProfile
): readonly EvidenceStructuralExpectation[] {
  return Object.entries(profile.structuralCounts).map(([key, expectedCount]) => ({
    key: key as EvidenceStructureKey,
    expectedCount,
  }));
}

export function getOfferTrackEvidenceContract(
  slug: OfferTrackSlug
): OfferTrackEvidenceContract | null {
  const profile = getOfferTrackEvidenceProfile(slug);
  if (!profile) return null;
  const assetAuthority = getAssetAuthorityRecord(profile.authorityId);
  if (!assetAuthority) return null;

  return {
    slug: profile.slug,
    render: {
      module: profile.evidenceModule,
      imagePath: profile.imagePath,
      authorityId: profile.authorityId,
      assetAuthority,
    },
    structure: getEvidenceStructuralExpectations(profile),
    signals: profile.requiredSignals,
  };
}

function validateEvidenceProfile(profile: OfferTrackEvidenceProfile): readonly string[] {
  const errors: string[] = [];

  if (!profile.evidenceModule) errors.push(`${profile.slug} missing evidence module`);
  if (!profile.imagePath) errors.push(`${profile.slug} missing evidence image`);
  if (!getAssetAuthorityRecord(profile.authorityId)) errors.push(`${profile.slug} missing asset authority`);
  if (profile.requiredSignals.length === 0) errors.push(`${profile.slug} missing evidence signals`);

  for (const [key, count] of Object.entries(profile.structuralCounts)) {
    if (!EVIDENCE_STRUCTURE_KEYS.has(key as EvidenceStructureKey)) {
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

export const serviceEvidenceRegistry: EvidenceRegistryContract = {
  profiles: OFFER_TRACK_EVIDENCE_PROFILES,
  getProfile: getOfferTrackEvidenceProfile,
  getContract: getOfferTrackEvidenceContract,
  validate() {
    return OFFER_TRACK_EVIDENCE_PROFILES.flatMap((profile) => validateEvidenceProfile(profile));
  },
};

export function getOfferTrackEvidenceProfile(slug: OfferTrackSlug) {
  return OFFER_TRACK_EVIDENCE_PROFILES.find((profile) => profile.slug === slug) ?? null;
}
