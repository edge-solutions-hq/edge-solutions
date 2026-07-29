import assert from 'node:assert/strict';
import {describe, it} from 'node:test';

import {assertPatchedBraceExpansion} from '../scripts/check-dependency-security.mjs';

describe('dependency security guard', () => {
  it('accepts the patched brace-expansion version', () => {
    assert.doesNotThrow(() =>
      assertPatchedBraceExpansion([{name: 'brace-expansion', version: '1.1.17'}])
    );
  });

  it('rejects any other brace-expansion version', () => {
    assert.throws(
      () =>
        assertPatchedBraceExpansion([
          {name: 'brace-expansion', version: '1.1.17'},
          {name: 'brace-expansion', version: '2.0.1'},
        ]),
      /may only be ignored with brace-expansion@1\.1\.17; found 2\.0\.1/
    );
  });

  it('fails when brace-expansion cannot be found', () => {
    assert.throws(
      () => assertPatchedBraceExpansion([]),
      /Unable to verify the installed brace-expansion version/
    );
  });
});
