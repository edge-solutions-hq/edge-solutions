import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {register} from 'node:module';

register('./ts-extension-resolver.mjs', import.meta.url);

const {
  evaluateClaimAuthority,
  getAssetAuthorityRecord,
  isPublicAssetApproved,
  assetAuthorityRegistry,
  publicAssetMetadata,
  resolveAssetAuthorityRecord,
} = await import('../src/lib/content/asset-authority.ts');
const {serviceEvidenceRegistry} = await import('../src/lib/content/service-evidence-registry.ts');
const {getHomePresentationModel} = await import('../src/lib/offer/home-presentation.ts');

function translate(key) {
  return key;
}

describe('asset authority', () => {
  it('keeps public source assets approved, scoped, and non-leaky', () => {
    assert.ok(assetAuthorityRegistry.length >= 3);
    for (const asset of assetAuthorityRegistry) {
      assert.equal(asset.approvalStatus, 'approved');
      assert.equal(asset.authority, 'authoritative');
      assert.ok(asset.publicPath.startsWith('/images/work/'));
      assert.ok(asset.claimRestrictions.includes('no_client_marks'));
      assert.ok(asset.sourceArtifactRefs.length > 0);

      const metadata = publicAssetMetadata(asset);
      assert.deepEqual(
        Object.keys(metadata).sort(),
        ['approvalStatus', 'assetId', 'authority', 'claimRestrictions', 'provenanceSummary', 'publicPath', 'sourceType', 'usageScopes'].sort()
      );
      assert.equal(metadata.internalDebug, undefined);
      assert.equal(metadata.promptDiagnostics, undefined);
      assert.equal(metadata.cachePath, undefined);
    }
  });

  it('wires service evidence contracts and homepage public project through approved authority records', () => {
    assert.deepEqual(serviceEvidenceRegistry.validate(), []);
    for (const profile of serviceEvidenceRegistry.profiles) {
      const contract = serviceEvidenceRegistry.getContract(profile.slug);
      assert.ok(contract.render.assetAuthority, `${profile.slug} missing asset authority`);
      assert.equal(contract.render.assetAuthority.approvalStatus, 'approved');
      assert.equal(isPublicAssetApproved(contract.render.assetAuthority.publicPath), true);
    }

    const home = getHomePresentationModel(translate);
    assert.equal(home.publicProject.assetAuthority.assetId, 'rusty-art-showcase');
    assert.equal(home.publicProject.assetAuthority.authority, 'authoritative');
  });

  it('forbids restricted claims without an authoritative approved source', () => {
    assert.equal(getAssetAuthorityRecord('missing-asset'), null);
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

  it('fails closed for image-backed claims and generated visual support', () => {
    assert.deepEqual(evaluateClaimAuthority({claimType: 'process', imageBacked: true, sourceAssetIds: []}), {
      allowed: false,
      reason: 'missing_authoritative_source_artifact',
      sourceAssetId: null,
    });
    assert.deepEqual(evaluateClaimAuthority({
      claimType: 'metric',
      imageBacked: true,
      sourceAssets: [{
        assetId: 'generated-concept',
        publicPath: '/images/work/generated-concept.svg',
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
    assert.deepEqual(evaluateClaimAuthority({
      claimType: 'metric',
      imageBacked: true,
      sourceAssets: [{
        assetId: 'misconfigured-generated-concept',
        publicPath: '/images/work/misconfigured-generated-concept.svg',
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
