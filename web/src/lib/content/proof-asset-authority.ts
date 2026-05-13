export type ProofAssetSourceType = 'approved_asset' | 'captured_render' | 'screenshot' | 'repo_source_fact' | 'generated_visual';

export type ProofAssetApprovalStatus = 'approved' | 'unreviewed' | 'rejected' | 'setup_required';

export type ProofAssetAuthorityLevel = 'authoritative' | 'non_authoritative';

export type ProofAssetAuthority = {
  assetId: string;
  publicPath: string;
  sourceType: ProofAssetSourceType;
  approvalStatus: ProofAssetApprovalStatus;
  authority: ProofAssetAuthorityLevel;
  usageScopes: readonly string[];
  sourceArtifactRefs: readonly string[];
  claimRestrictions: readonly string[];
  provenanceSummary: string;
};

export type PublicProofAssetMetadata = Pick<
  ProofAssetAuthority,
  | 'assetId'
  | 'publicPath'
  | 'sourceType'
  | 'approvalStatus'
  | 'authority'
  | 'usageScopes'
  | 'claimRestrictions'
  | 'provenanceSummary'
>;

export type ProofAssetResolution =
  | {status: 'available'; asset: ProofAssetAuthority; reason: null}
  | {status: 'setup_required'; asset: null; reason: 'missing_media_or_unregistered_asset'};

const restrictedClaims = new Set([
  'client',
  'logo',
  'testimonial',
  'case-study',
  'metric',
  'award',
  'certification',
  'screenshot',
  'named-project',
  'outcome',
]);

const defaultClaimRestrictions = [
  'no_client_marks',
  'no_testimonials',
  'no_case_studies',
  'no_outcome_metrics',
  'no_certifications_or_awards',
  'no_unverified_screenshots',
] as const;

export const proofAssetAuthorityRegistry = [
  {
    assetId: 'edge-proof-board',
    publicPath: '/images/proof/edge-proof-board.svg',
    sourceType: 'approved_asset',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['homepage', 'proof'],
    sourceArtifactRefs: ['https://rusty-art.edge-solutions.be/', '../WEBSITE.md'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Repo-owned proof board for public Rusty Art/OpenClaw process proof. It does not authorize client, metric, testimonial, logo, screenshot, award, or certification claims.',
  },
  {
    assetId: 'services-ai-workflow-board',
    publicPath: '/images/proof/services-ai-workflow-board.svg',
    sourceType: 'approved_asset',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'ai-automation', 'proof'],
    sourceArtifactRefs: ['../WEBSITE.md', '../docs/positioning.md'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Repo-owned AI workflow board for process-proof framing, not evidence for external client outcomes.',
  },
  {
    assetId: 'web-delivery-board',
    publicPath: '/images/proof/web-delivery-board.svg',
    sourceType: 'approved_asset',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'web-dev', 'proof'],
    sourceArtifactRefs: ['../WEBSITE.md', '../docs/architecture.md'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Repo-owned web delivery board for process-proof framing, not evidence for external client outcomes.',
  },
  {
    assetId: 'services-realtime-prototype-board',
    publicPath: '/images/proof/services-realtime-prototype-board.svg',
    sourceType: 'approved_asset',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'proof'],
    sourceArtifactRefs: ['../WEBSITE.md', '../docs/design-baseline.md'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Repo-owned realtime prototype board for capability framing, not evidence for external client outcomes.',
  },
] as const satisfies readonly ProofAssetAuthority[];

export function getProofAssetAuthority(assetIdOrPublicPath: string): ProofAssetAuthority | null {
  return proofAssetAuthorityRegistry.find((asset) => (
    asset.assetId === assetIdOrPublicPath
    || asset.publicPath === assetIdOrPublicPath
    || asset.publicPath.endsWith(`/${assetIdOrPublicPath}`)
  )) ?? null;
}

export function resolveProofAssetAuthority(assetIdOrPublicPath: string): ProofAssetResolution {
  const asset = getProofAssetAuthority(assetIdOrPublicPath);
  if (asset) return {status: 'available', asset, reason: null};
  return {status: 'setup_required', asset: null, reason: 'missing_media_or_unregistered_asset'};
}

export function publicProofAssetMetadata(asset: ProofAssetAuthority): PublicProofAssetMetadata {
  return {
    assetId: asset.assetId,
    publicPath: asset.publicPath,
    sourceType: asset.sourceType,
    approvalStatus: asset.approvalStatus,
    authority: asset.authority,
    usageScopes: asset.usageScopes,
    claimRestrictions: asset.claimRestrictions,
    provenanceSummary: asset.provenanceSummary,
  };
}

export function evaluateProofClaimAuthority({
  claimType,
  sourceAssetIds,
  sourceAssets = [],
  imageBacked = false,
}: {
  claimType: string;
  sourceAssetIds?: readonly string[];
  sourceAssets?: readonly ProofAssetAuthority[];
  imageBacked?: boolean;
}) {
  const normalizedClaim = claimType.trim().toLowerCase();
  const registryAssets = (sourceAssetIds ?? [])
    .map((assetId) => getProofAssetAuthority(assetId))
    .filter((asset): asset is ProofAssetAuthority => Boolean(asset));
  const allSourceAssets = [...registryAssets, ...sourceAssets];
  const authoritativeAsset = allSourceAssets.find((asset) => asset.sourceType !== 'generated_visual' && asset.authority === 'authoritative' && asset.approvalStatus === 'approved');
  const generatedAsset = allSourceAssets.find((asset) => asset.sourceType === 'generated_visual');

  if ((restrictedClaims.has(normalizedClaim) || imageBacked) && !authoritativeAsset) {
    return {
      allowed: false,
      reason: generatedAsset ? 'generated_visual_cannot_authorize_restricted_claim' : 'missing_authoritative_source_artifact',
      sourceAssetId: null,
    };
  }

  if (generatedAsset && !authoritativeAsset) {
    return {
      allowed: false,
      reason: 'generated_visual_is_non_authoritative_support_only',
      sourceAssetId: null,
    };
  }

  return {
    allowed: true,
    reason: authoritativeAsset ? 'authorized_by_verified_source_artifact' : 'non_restricted_claim',
    sourceAssetId: authoritativeAsset?.assetId ?? null,
  };
}

export function isPublicProofAssetApproved(assetIdOrPublicPath: string): boolean {
  const asset = getProofAssetAuthority(assetIdOrPublicPath);
  return Boolean(asset && asset.approvalStatus === 'approved' && asset.authority === 'authoritative');
}
