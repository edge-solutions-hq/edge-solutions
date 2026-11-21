import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {register} from 'node:module';
import path from 'node:path';

register('./ts-extension-resolver.mjs', import.meta.url);

const {
  evaluateClaimAuthority,
  isPublicAssetApproved,
  assetAuthorityRegistry,
  resolveAssetAuthorityRecord,
} = await import('../src/lib/content/asset-authority.ts');
const {serviceEvidenceRegistry} = await import('../src/lib/content/service-evidence-registry.ts');
const {getHomePresentationModel} = await import('../src/lib/offer/home-presentation.ts');

const publicDir = path.resolve(import.meta.dirname, '../public');

function generatedVisual(overrides) {
  return {
    assetId: 'generated-concept',
    publicPath: '/images/work/generated-concept.svg',
    sourceType: 'generated_visual',
    approvalStatus: 'approved',
    usageScopes: ['concept'],
    sourceArtifactRefs: [],
    claimRestrictions: ['no_outcome_metrics'],
    provenanceSummary: 'Synthetic concept only.',
    ...overrides,
  };
}

describe('asset authority', () => {
  it('registers only approved, sourced, client-mark-free assets that exist on disk', () => {
    for (const asset of assetAuthorityRegistry) {
      assert.equal(isPublicAssetApproved(asset.assetId), true, `${asset.assetId} is not approved`);
      assert.ok(asset.claimRestrictions.includes('no_client_marks'), `${asset.assetId} allows client marks`);
      assert.ok(asset.sourceArtifactRefs.length > 0, `${asset.assetId} has no provenance`);
      assert.ok(existsSync(path.join(publicDir, asset.publicPath)), `${asset.publicPath} missing from public/`);
    }
  });

  it('only shows approved images in service evidence and the homepage public project', () => {
    assert.deepEqual(serviceEvidenceRegistry.validate(), []);
    for (const profile of serviceEvidenceRegistry.profiles) {
      const contract = serviceEvidenceRegistry.getContract(profile.slug);
      assert.ok(contract, `${profile.slug} has no evidence contract`);
      assert.equal(isPublicAssetApproved(contract.render.imagePath), true, `${profile.slug} evidence image is not approved`);
    }

    const {publicProject} = getHomePresentationModel((key) => key);
    assert.equal(isPublicAssetApproved(publicProject.imageSrc), true, 'homepage public project image is not approved');
    assert.equal(publicProject.assetAuthority.publicPath, publicProject.imageSrc);
  });

  it('forbids restricted claims without an authoritative approved source', () => {
    assert.deepEqual(resolveAssetAuthorityRecord('missing-asset'), {
      status: 'setup_required',
      asset: null,
      reason: 'missing_media_or_unregistered_asset',
    });
    assert.deepEqual(evaluateClaimAuthority({claimType: 'testimonial', sourceAssetIds: []}), {
      allowed: false,
      reason: 'missing_authoritative_source_artifact',
      sourceAssetId: null,
    });
    assert.deepEqual(evaluateClaimAuthority({claimType: 'screenshot', sourceAssetIds: ['rusty-art-showcase']}), {
      allowed: true,
      reason: 'authorized_by_verified_source_artifact',
      sourceAssetId: 'rusty-art-showcase',
    });
  });

  it('fails closed for image-backed claims without a source', () => {
    assert.deepEqual(evaluateClaimAuthority({claimType: 'process', imageBacked: true, sourceAssetIds: []}), {
      allowed: false,
      reason: 'missing_authoritative_source_artifact',
      sourceAssetId: null,
    });
  });

  for (const authority of ['non_authoritative', 'authoritative']) {
    it(`never lets a generated visual with ${authority} authority authorize a restricted claim`, () => {
      assert.deepEqual(evaluateClaimAuthority({
        claimType: 'metric',
        imageBacked: true,
        sourceAssets: [generatedVisual({authority})],
      }), {
        allowed: false,
        reason: 'generated_visual_cannot_authorize_restricted_claim',
        sourceAssetId: null,
      });
    });
  }
});
