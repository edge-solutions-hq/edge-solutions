export type AssetSourceType = 'approved_asset' | 'captured_render' | 'screenshot' | 'repo_source_fact' | 'generated_visual';

export type AssetApprovalStatus = 'approved' | 'unreviewed' | 'rejected' | 'setup_required';

export type AssetAuthorityLevel = 'authoritative' | 'non_authoritative';

export type AssetAuthorityRecord = {
  assetId: string;
  publicPath: string;
  sourceType: AssetSourceType;
  approvalStatus: AssetApprovalStatus;
  authority: AssetAuthorityLevel;
  usageScopes: readonly string[];
  sourceArtifactRefs: readonly string[];
  claimRestrictions: readonly string[];
  provenanceSummary: string;
};

export type PublicAssetMetadata = Pick<
  AssetAuthorityRecord,
  | 'assetId'
  | 'publicPath'
  | 'sourceType'
  | 'approvalStatus'
  | 'authority'
  | 'usageScopes'
  | 'claimRestrictions'
  | 'provenanceSummary'
>;

export type AssetAuthorityResolution =
  | {status: 'available'; asset: AssetAuthorityRecord; reason: null}
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

export const assetAuthorityRegistry = [
  {
    assetId: 'rusty-art-showcase',
    publicPath: '/images/work/rusty-art-showcase.jpg',
    sourceType: 'captured_render',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['homepage', 'showcase'],
    sourceArtifactRefs: ['https://rusty-art.edge-solutions.be/', 'C:/Users/ggumi/Downloads/1778837890082.jpg', '../WEBSITE.md'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Repo-approved Rusty Art visual supplied by Gil for the homepage public project panel. It does not authorize client, metric, testimonial, logo, screenshot, award, or certification claims.',
  },
  {
    assetId: 'services-ai-workflow-board',
    publicPath: '/images/work/services-ai-workflow-board.svg',
    sourceType: 'approved_asset',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'ai-automation', 'process'],
    sourceArtifactRefs: ['../WEBSITE.md', '../docs/positioning.md'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Repo-owned AI workflow board for process framing, not evidence for external client outcomes.',
  },
  {
    assetId: 'services-realtime-prototype-board',
    publicPath: '/images/work/services-realtime-prototype-board.svg',
    sourceType: 'approved_asset',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'capability'],
    sourceArtifactRefs: ['../WEBSITE.md', '../DESIGN.md'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Repo-owned realtime prototype board for capability framing, not evidence for external client outcomes.',
  },
  {
    assetId: 'realtime-gallery-silva-vr',
    publicPath: '/images/work/realtime-gallery/silva-vr.jpg',
    sourceType: 'screenshot',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'portfolio'],
    sourceArtifactRefs: ['https://www.artstation.com/artwork/lDrmzY'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Portfolio image copied from Gil Guminski ArtStation for a public visual reference to the Silva VR project. It does not authorize client logos, testimonials, outcome metrics, awards, or broader case-study claims.',
  },
  {
    assetId: 'realtime-gallery-glitch-moba',
    publicPath: '/images/work/realtime-gallery/glitch-moba-capsule.jpg',
    sourceType: 'approved_asset',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'portfolio'],
    sourceArtifactRefs: ['https://www.artstation.com/artwork/qe2EzL', 'C:/Users/ggumi/Downloads/capsule_616x353.jpg'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'User-supplied Glitch Moba capsule image approved for a public project card. It does not authorize client logos, testimonials, outcome metrics, awards, or broader case-study claims.',
  },
  {
    assetId: 'realtime-gallery-crinoid-fields',
    publicPath: '/images/work/realtime-gallery/crinoid-fields-scene.jpg',
    sourceType: 'screenshot',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'portfolio'],
    sourceArtifactRefs: [
      'https://www.artstation.com/artwork/vD9oNa',
      'https://cdna.artstation.com/p/assets/images/images/062/425/162/large/gil-guminski-capture-d-ecran-2023-05-03-110630.jpg?1683108486',
      'C:/Users/ggumi/Downloads/gil-guminski-capture-d-ecran-2023-05-03-110630.jpg',
    ],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Portfolio image copied from Gil Guminski ArtStation for a public visual reference to the Crinoid fields project. It does not authorize client logos, testimonials, outcome metrics, awards, or broader case-study claims.',
  },
  {
    assetId: 'realtime-gallery-safethigame',
    publicPath: '/images/work/realtime-gallery/safethigame.png',
    sourceType: 'screenshot',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'portfolio'],
    sourceArtifactRefs: [
      'https://www.newsroom.ethias.be/ethias-doublement-recompensee-aux-trophees-decavi-2026-une-reconnaissance-de-son-expertise-au-service-des-entreprises-et-de-leurs-enjeux',
      'https://cdn.assets.prezly.com/c22da36b-c818-4616-b7d0-cf3a7e06e85e/-/preview/2000x2000/-/resize/1200/SafeETHIgame_06.png',
    ],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Public SafETHIgame image copied from the linked Ethias newsroom asset for a public visual reference to Gil\'s project participation. It does not authorize client logos, testimonials, outcome metrics, or broader case-study claims.',
  },
  {
    assetId: 'realtime-gallery-hexocity',
    publicPath: '/images/work/realtime-gallery/hexocity.jpg',
    sourceType: 'screenshot',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'portfolio'],
    sourceArtifactRefs: ['https://store.steampowered.com/app/2820100/HexoCity/'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Steam capsule image copied from the public HexoCity Steam page for a public visual reference to the project. It does not authorize client logos, testimonials, sales or review metrics, awards, or broader case-study claims.',
  },
  {
    assetId: 'realtime-gallery-vision-it',
    publicPath: '/images/work/realtime-gallery/vision-it.jpg',
    sourceType: 'screenshot',
    approvalStatus: 'approved',
    authority: 'authoritative',
    usageScopes: ['services', 'realtime-games', 'portfolio'],
    sourceArtifactRefs: ['https://www.artstation.com/artwork/LRZzDv'],
    claimRestrictions: defaultClaimRestrictions,
    provenanceSummary: 'Portfolio image copied from Gil Guminski ArtStation for a public visual reference to the Vision-It project. It does not authorize client logos, testimonials, outcome metrics, awards, or broader case-study claims.',
  },
] as const satisfies readonly AssetAuthorityRecord[];

export function getAssetAuthorityRecord(assetIdOrPublicPath: string): AssetAuthorityRecord | null {
  return assetAuthorityRegistry.find((asset) => (
    asset.assetId === assetIdOrPublicPath
    || asset.publicPath === assetIdOrPublicPath
    || asset.publicPath.endsWith(`/${assetIdOrPublicPath}`)
  )) ?? null;
}

export function resolveAssetAuthorityRecord(assetIdOrPublicPath: string): AssetAuthorityResolution {
  const asset = getAssetAuthorityRecord(assetIdOrPublicPath);
  if (asset) return {status: 'available', asset, reason: null};
  return {status: 'setup_required', asset: null, reason: 'missing_media_or_unregistered_asset'};
}

export function publicAssetMetadata(asset: AssetAuthorityRecord): PublicAssetMetadata {
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

export function evaluateClaimAuthority({
  claimType,
  sourceAssetIds,
  sourceAssets = [],
  imageBacked = false,
}: {
  claimType: string;
  sourceAssetIds?: readonly string[];
  sourceAssets?: readonly AssetAuthorityRecord[];
  imageBacked?: boolean;
}) {
  const normalizedClaim = claimType.trim().toLowerCase();
  const registryAssets = (sourceAssetIds ?? [])
    .map((assetId) => getAssetAuthorityRecord(assetId))
    .filter((asset): asset is AssetAuthorityRecord => Boolean(asset));
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

export function isPublicAssetApproved(assetIdOrPublicPath: string): boolean {
  const asset = getAssetAuthorityRecord(assetIdOrPublicPath);
  return Boolean(asset && asset.approvalStatus === 'approved' && asset.authority === 'authoritative');
}
