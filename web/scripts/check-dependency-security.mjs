#!/usr/bin/env node

import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';

const patchedBraceExpansionVersion = '1.1.17';

export function assertPatchedBraceExpansion(packages) {
  const versions = packages
    .filter((dependency) => dependency?.name === 'brace-expansion')
    .map((dependency) => dependency.version);

  if (versions.length === 0) {
    throw new Error('Unable to verify the installed brace-expansion version.');
  }

  const unexpectedVersions = [...new Set(versions.filter((version) => version !== patchedBraceExpansionVersion))];

  if (unexpectedVersions.length > 0) {
    throw new Error(
      `GHSA-mh99-v99m-4gvg may only be ignored with brace-expansion@${patchedBraceExpansionVersion}; found ${unexpectedVersions.join(', ')}.`
    );
  }
}

function main() {
  const dependencyJson = execFileSync(
    'corepack',
    ['pnpm', 'why', 'brace-expansion', '--json'],
    {encoding: 'utf8'}
  );

  assertPatchedBraceExpansion(JSON.parse(dependencyJson));
  console.log(`Verified brace-expansion@${patchedBraceExpansionVersion} for the temporary audit exception.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
