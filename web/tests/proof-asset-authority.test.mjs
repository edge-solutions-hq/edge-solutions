import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register('./ts-extension-resolver.mjs', import.meta.url);

const {
  evaluateProofClaimAuthority,
  getProofAssetAuthority,
  isPublicProofAssetApproved,
  proofAssetAuthorityRegistry,
  publicProofAssetMetadata,
  resolveProofAssetAuthority,
} = await import('../src/lib/content/proof-asset-authority.ts');
const {proofRegistry} = await import('../src/lib/content/proof-registry.ts');
const {getHomePresentationModel} = await import('../src/lib/home-presentation.ts');

function translate(key) {
  return key;
}

describe('proof asset authority', () => {
  it('keeps public proof assets approved, scoped, and non-leaky', () => {
    assert.ok(proofAssetAuthorityRegistry.length >= 3);
    for (const asset of proofAssetAuthorityRegistry) {
      assert.equal(asset.approvalStatus, 'approved');
      assert.equal(asset.authority, 'authoritative');
      assert.ok(asset.publicPath.startsWith('/images/proof/'));
      assert.ok(asset.claimRestrictions.includes('no_client_marks'));
      assert.ok(asset.sourceArtifactRefs.length > 0);

      const metadata = publicProofAssetMetadata(asset);
      assert.deepEqual(
        Object.keys(metadata).sort(),
        ['approvalStatus', 'assetId', 'authority', 'claimRestrictions', 'provenanceSummary', 'publicPath', 'sourceType', 'usageScopes'].sort()
      );
      assert.equal(metadata.internalDebug, undefined);
      assert.equal(metadata.promptDiagnostics, undefined);
      assert.equal(metadata.cachePath, undefined);
    }
  });

  it('wires service proof contracts and homepage proof through approved authority records', () => {
    assert.deepEqual(proofRegistry.validate(), []);
    for (const profile of proofRegistry.profiles) {
      const contract = proofRegistry.getContract(profile.slug);
      assert.ok(contract.render.assetAuthority, `${profile.slug} missing proof authority`);
      assert.equal(contract.render.assetAuthority.approvalStatus, 'approved');
      assert.equal(isPublicProofAssetApproved(contract.render.assetAuthority.publicPath), true);
    }

    const home = getHomePresentationModel(translate);
    assert.equal(home.publicProof.assetAuthority.assetId, 'edge-proof-board');
    assert.equal(home.publicProof.assetAuthority.authority, 'authoritative');
  });

  it('forbids restricted proof claims without an authoritative approved source', () => {
    assert.equal(getProofAssetAuthority('missing-asset'), null);
    assert.deepEqual(resolveProofAssetAuthority('missing-asset'), {
      status: 'setup_required',
      asset: null,
      reason: 'missing_media_or_unregistered_asset',
    });
    assert.deepEqual(evaluateProofClaimAuthority({claimType: 'testimonial', sourceAssetIds: []}), {
      allowed: false,
      reason: 'missing_authoritative_source_artifact',
      sourceAssetId: null,
    });
    assert.deepEqual(evaluateProofClaimAuthority({claimType: 'screenshot', sourceAssetIds: ['edge-proof-board']}), {
      allowed: true,
      reason: 'authorized_by_verified_source_artifact',
      sourceAssetId: 'edge-proof-board',
    });
  });

  it('fails closed for image-backed claims and generated visual support', () => {
    assert.deepEqual(evaluateProofClaimAuthority({claimType: 'process', imageBacked: true, sourceAssetIds: []}), {
      allowed: false,
      reason: 'missing_authoritative_source_artifact',
      sourceAssetId: null,
    });
    assert.deepEqual(evaluateProofClaimAuthority({
      claimType: 'metric',
      imageBacked: true,
      sourceAssets: [{
        assetId: 'generated-concept',
        publicPath: '/images/proof/generated-concept.svg',
        sourceType: 'generated_visual',
        approvalStatus: 'approved',
        authority: 'non_authoritative',
        usageScopes: ['concept'],
        sourceArtifactRefs: [],
        claimRestrictions: ['no_outcome_metrics'],
        provenanceSummary: 'Synthetic concept only.',
      }],
    }), {
      allowed: false,
      reason: 'generated_visual_cannot_authorize_restricted_claim',
      sourceAssetId: null,
    });
    assert.deepEqual(evaluateProofClaimAuthority({
      claimType: 'metric',
      imageBacked: true,
      sourceAssets: [{
        assetId: 'misconfigured-generated-concept',
        publicPath: '/images/proof/misconfigured-generated-concept.svg',
        sourceType: 'generated_visual',
        approvalStatus: 'approved',
        authority: 'authoritative',
        usageScopes: ['concept'],
        sourceArtifactRefs: [],
        claimRestrictions: ['no_outcome_metrics'],
        provenanceSummary: 'Synthetic concept only.',
      }],
    }), {
      allowed: false,
      reason: 'generated_visual_cannot_authorize_restricted_claim',
      sourceAssetId: null,
    });
  });
});
