#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {basename, resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const secretValuePatterns = [
  ['Resend API key', /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{16,}/],
  ['OpenRouter API key', /\bsk-or-(?:v1-)?[A-Za-z0-9]{32,}/],
  ['Anthropic API key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['OpenAI API key', /\bsk-(?:proj|svcacct|admin)-[A-Za-z0-9_-]{20,}/],
  ['Stripe secret key', /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{16,}/],
  ['Stripe webhook secret', /\bwhsec_[A-Za-z0-9+/=]{16,}/],
  ['GitHub token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],
  ['Vercel token', /\bvc[aikpr]_[A-Za-z0-9]{24,}/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['private key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
];

const allowedEnvFiles = new Set(['.env.example', '.env.sample', '.env.template']);

export function isSensitivePath(path) {
  if (typeof path !== 'string' || path === '') return false;
  const name = basename(path.replace(/[\\/]+$/, ''));
  if (allowedEnvFiles.has(name)) return false;
  if (name === '.env' || name.startsWith('.env.')) return true;
  if (/^id_(?:rsa|dsa|ecdsa|ed25519)$/.test(name)) return true;
  return /\.(?:pem|p12|pfx|key)$/i.test(name);
}

const envFileInCommand = /(?:^|[\s/'"=<>(])(\.env(?:\.[\w.-]+)?)(?=$|[\s'";|&)<>])/g;

const printingCommands = [
  ['printenv', /(?:^|[;&|(`]|\$\()\s*(?:sudo\s+)?printenv\b/],
  ['env', /(?:^|[;&|(`]|\$\()\s*(?:sudo\s+)?env(?:\s+-[-\w]+)*\s*(?:$|[|;&>)`])/],
  ['set', /(?:^|[;&|(`]|\$\()\s*set\s*(?:$|[|;&>)`])/],
  ['export -p', /(?:^|[;&|(`]|\$\()\s*export\s+-p\b/],
  ['declare -x/-p', /(?:^|[;&|(`]|\$\()\s*(?:declare|typeset)\s+-[a-zA-Z]*[xp]/],
  ['/proc environ', /\/proc\/[^\s/]+\/environ\b/],
  ['gh auth token', /\bgh\s+auth\s+token\b/],
  ['git credential fill', /\bgit\s+credential(?:-\w+)?\s+(?:fill|get)\b/],
  ['vercel env pull to stdout', /\bvercel\s+env\s+pull\s+(?:\S+\s+)*(?:-|\/dev\/stdout)\b/],
  [
    'echoing a secret variable',
    /\b(?:echo|printf|print)\b[^|;&]*\$\{?[A-Za-z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD|PASSWD|CREDENTIALS?|DSN)\b/i,
  ],
];

export function findSecretValue(text) {
  if (typeof text !== 'string' || text === '') return null;
  for (const [label, pattern] of secretValuePatterns) {
    if (pattern.test(text)) return label;
  }
  return null;
}

export function checkCommand(command) {
  if (typeof command !== 'string' || command === '') return null;
  const secret = findSecretValue(command);
  if (secret) return `the command contains what looks like a ${secret}`;
  for (const [label, pattern] of printingCommands) {
    if (pattern.test(command)) return `\`${label}\` can print secrets into the transcript`;
  }
  for (const match of command.matchAll(envFileInCommand)) {
    if (isSensitivePath(match[1])) return `the command touches \`${match[1]}\`, which holds secrets`;
  }
  for (const token of command.split(/[\s'"=<>|;&()]+/)) {
    if (token && !token.startsWith('-') && isSensitivePath(token) && !basename(token).startsWith('.env')) {
      return `the command touches \`${token}\`, which looks like a private key file`;
    }
  }
  return null;
}

function editedTexts(input) {
  const texts = [input.content, input.new_string, input.new_source];
  if (Array.isArray(input.edits)) {
    for (const edit of input.edits) texts.push(edit?.new_string);
  }
  return texts.filter((text) => typeof text === 'string');
}

export function evaluate(event) {
  if (!event || typeof event !== 'object') return null;
  if (event.hook_event_name === 'UserPromptSubmit' || (event.prompt && !event.tool_name)) {
    const secret = findSecretValue(event.prompt);
    return secret
      ? `Your message contains what looks like a ${secret}, so it was not sent. Remove it, and rotate that key since it was pasted.`
      : null;
  }
  const tool = event.tool_name;
  const input = event.tool_input ?? {};
  if (tool === 'Bash') return checkCommand(input.command);
  if (['Read', 'Edit', 'MultiEdit', 'Write', 'NotebookEdit'].includes(tool)) {
    const path = input.file_path ?? input.notebook_path;
    if (isSensitivePath(path)) return `\`${basename(path)}\` holds secrets and is off limits to the agent`;
    for (const text of editedTexts(input)) {
      const secret = findSecretValue(text);
      if (secret) return `the new content contains what looks like a ${secret}; read it from an environment variable instead`;
    }
    return null;
  }
  if (tool === 'Grep') {
    if (isSensitivePath(input.path)) return `\`${basename(input.path)}\` holds secrets and is off limits to the agent`;
    if (typeof input.glob === 'string' && /(?:^|\/)\.env/.test(input.glob)) return 'searching `.env` files is off limits to the agent';
    return null;
  }
  return null;
}

function main() {
  let event;
  try {
    event = JSON.parse(readFileSync(0, 'utf8'));
  } catch {
    process.exit(0);
  }
  const reason = evaluate(event);
  if (!reason) process.exit(0);
  process.stderr.write(`Blocked by secret guard: ${reason}.\n`);
  process.exit(2);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) main();
