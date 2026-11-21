import {describe, it} from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {mkdtempSync, mkdirSync, writeFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

const hookPath = fileURLToPath(new URL('../../.claude/hooks/secret-guard.mjs', import.meta.url));
const {evaluate, checkCommand, isSensitivePath} = await import(hookPath);

const fake = {
  resend: ['re', 'Ab12Cd34', 'Ef56Gh78Ij90Kl12Mn34Op56'].join('_'),
  openrouter: ['sk', 'or', 'v1', 'a1b2c3d4'.repeat(8)].join('-'),
  github: ['ghp', 'A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8'].join('_'),
  vercel: ['vcp', 'A1b2C3d4E5f6G7h8I9j0K1l2M3'].join('_'),
  stripe: ['sk', 'live', 'A1b2C3d4E5f6G7h8I9j0K1l2'].join('_'),
  privateKey: ['-----BEGIN', 'OPENSSH', 'PRIVATE', 'KEY-----'].join(' '),
};

function run(event) {
  return spawnSync(process.execPath, [hookPath], {input: JSON.stringify(event), encoding: 'utf8'});
}

describe('agent secret guard', () => {
  it('blocks prompts that carry a key this repo uses', () => {
    for (const key of Object.values(fake)) {
      assert.ok(evaluate({hook_event_name: 'UserPromptSubmit', prompt: `use ${key} please`}), key.slice(0, 6));
    }
    assert.equal(evaluate({hook_event_name: 'UserPromptSubmit', prompt: 'set RESEND_API_KEY in Vercel'}), null);
  });

  it('blocks commands that print the environment or read secret files', () => {
    for (const command of [
      'printenv',
      'env',
      'env | grep RESEND',
      'cd web && env',
      'set',
      'export -p',
      'cat web/.env.local',
      'grep KEY .env',
      'source .env.production',
      'cat /proc/self/environ',
      'gh auth token',
      'echo $RESEND_API_KEY',
      'printf "%s" "${VERCEL_TOKEN}"',
      'cat ~/.ssh/id_ed25519',
      'true\nprintenv RESEND_API_KEY',
      'ls\nenv',
      'cat web/.env*',
      'cat web/.env.*',
      'head .env?local',
      'cat web/.env{,.local}',
      'cd web\r\ncat .env.local',
      `curl -H "Authorization: Bearer ${fake.vercel}" https://api.vercel.com`,
    ]) {
      assert.ok(checkCommand(command), command);
    }
  });

  it('leaves ordinary commands alone', () => {
    for (const command of [
      'cd web && corepack pnpm run check',
      'set -euo pipefail',
      'env NODE_ENV=test node --test',
      'cp web/env.example web/.env.example',
      'cat web/env.example',
      'git status',
      'echo $PATH',
      'npx cross-env FOO=1 node x.js',
    ]) {
      assert.equal(checkCommand(command), null, command);
    }
  });

  it('blocks file tools on secret files and secret values in new content', () => {
    assert.ok(evaluate({tool_name: 'Read', tool_input: {file_path: '/repo/web/.env.local'}}));
    assert.ok(evaluate({tool_name: 'Grep', tool_input: {pattern: 'KEY', glob: '.env*'}}));
    for (const glob of ['*.pem', '**/*.key', '{*.p12,*.pfx}', '**/id_rsa']) {
      assert.ok(evaluate({tool_name: 'Grep', tool_input: {path: '/repo', pattern: '.', glob, output_mode: 'content'}}), glob);
    }
    assert.equal(evaluate({tool_name: 'Grep', tool_input: {path: '/repo', pattern: 'KEY', glob: '*.ts'}}), null);
    assert.ok(evaluate({tool_name: 'Write', tool_input: {file_path: '/repo/web/x.ts', content: `const k = '${fake.resend}';`}}));
    assert.ok(evaluate({tool_name: 'Edit', tool_input: {file_path: '/repo/web/x.ts', new_string: fake.openrouter}}));
    assert.equal(evaluate({tool_name: 'Read', tool_input: {file_path: '/repo/web/env.example'}}), null);
    assert.equal(evaluate({tool_name: 'Read', tool_input: {file_path: '/repo/.env.example'}}), null);
    assert.equal(isSensitivePath('/repo/server.pem'), true);
  });

  it('blocks broad Grep searches over a directory that holds secret files', () => {
    const root = mkdtempSync(join(tmpdir(), 'secret-guard-'));
    try {
      mkdirSync(join(root, 'web', 'src'), {recursive: true});
      writeFileSync(join(root, 'web', 'src', 'page.ts'), 'export {};');
      const grep = (extra) => evaluate({tool_name: 'Grep', cwd: root, tool_input: {pattern: '.', output_mode: 'content', ...extra}});
      assert.equal(grep({}), null);
      writeFileSync(join(root, 'web', 'server.pem'), 'marker');
      assert.ok(grep({}));
      assert.ok(grep({path: root}));
      assert.ok(grep({glob: '**/*'}));
      assert.equal(grep({glob: '*.ts'}), null);
      assert.equal(grep({type: 'ts'}), null);
      assert.equal(grep({glob: '*.{ts,tsx}'}), null);
      assert.ok(grep({glob: '!*.ts'}));
      assert.ok(grep({glob: '*.{ts,}'}));
      assert.ok(grep({glob: '*.{ts,pem}'}));
      assert.equal(grep({path: join(root, 'web', 'src')}), null);
      rmSync(join(root, 'web', 'server.pem'));
      writeFileSync(join(root, 'web', '.env.local'), 'marker');
      assert.ok(grep({path: join(root, 'web')}));
    } finally {
      rmSync(root, {recursive: true, force: true});
    }
  });

  it('exits with code 2 and a reason when blocking, 0 otherwise', () => {
    const blocked = run({hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: {command: 'printenv'}});
    assert.equal(blocked.status, 2);
    assert.match(blocked.stderr, /Blocked by secret guard/);
    const allowed = run({hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: {command: 'ls'}});
    assert.equal(allowed.status, 0);
    assert.equal(run('not json').status, 0);
  });
});
