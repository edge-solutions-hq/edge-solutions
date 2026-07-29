import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import path from 'node:path';
import {after, before, describe, it} from 'node:test';
import {setTimeout as delay} from 'node:timers/promises';

import {getLiveSeoSourceFacts} from '../scripts/seo-source-facts.mjs';

const root = path.resolve(import.meta.dirname, '..');
const facts = getLiveSeoSourceFacts({root});
const securityHeaders = {
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};
const staticCache = 'public, max-age=86400, stale-while-revalidate=604800';
const htmlCache = 's-maxage=31536000';
const errorCache = 'private, no-cache, no-store, max-age=0, must-revalidate';

let app;
let baseUrl;

async function candidatePort() {
  const probe = createServer();
  await new Promise((resolve, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', resolve);
  });

  const address = probe.address();
  assert(address && typeof address === 'object');
  await new Promise((resolve, reject) => probe.close((error) => (error ? reject(error) : resolve())));
  return address.port;
}

async function waitForExit(child, timeout) {
  if (child.exitCode !== null || child.signalCode !== null) return true;

  let timeoutId;
  try {
    return await Promise.race([
      once(child, 'exit').then(() => true),
      new Promise((resolve) => {
        timeoutId = setTimeout(() => resolve(false), timeout);
      }),
    ]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function stopApp() {
  if (!app || app.exitCode !== null || app.signalCode !== null) return;

  app.kill('SIGTERM');
  if (!(await waitForExit(app, 5_000))) {
    app.kill('SIGKILL');
    await waitForExit(app, 5_000);
  }
}

async function startApp() {
  const nextCli = path.join(root, 'node_modules', 'next', 'dist', 'bin', 'next');
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const port = await candidatePort();
    let output = '';

    baseUrl = `http://127.0.0.1:${port}`;
    app = spawn(
      process.execPath,
      [nextCli, 'start', '--hostname', '127.0.0.1', '--port', String(port)],
      {
        cwd: root,
        env: {...process.env, NEXT_TELEMETRY_DISABLED: '1', NODE_ENV: 'production'},
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    app.stdout.on('data', (chunk) => {
      output += chunk;
    });
    app.stderr.on('data', (chunk) => {
      output += chunk;
    });

    const deadline = Date.now() + 30_000;
    try {
      while (Date.now() < deadline) {
        if (app.exitCode !== null || app.signalCode !== null) {
          throw new Error(`Production server exited before readiness.\n${output}`);
        }

        try {
          const response = await fetch(`${baseUrl}/robots.txt`, {
            redirect: 'manual',
            signal: AbortSignal.timeout(1_000),
          });
          if (response.status === 200) {
            await response.arrayBuffer();
            return;
          }
        } catch {}

        await delay(100);
      }

      throw new Error(`Production server was not ready within 30 seconds.\n${output}`);
    } catch (error) {
      await stopApp();
      if (attempt === 0 && output.includes('EADDRINUSE')) continue;
      throw error;
    }
  }
}

function request(pathname, options = {}) {
  const url = new URL(pathname, baseUrl);
  assert.equal(url.origin, baseUrl, `HTTP contracts may only request ${baseUrl}`);
  return fetch(url, {
    ...options,
    redirect: 'manual',
    signal: options.signal ?? AbortSignal.timeout(10_000),
  });
}

function assertSecurityHeaders(response, label) {
  for (const [name, value] of Object.entries(securityHeaders)) {
    assert.equal(response.headers.get(name), value, `${label} ${name}`);
  }
}

describe('built site HTTP contracts', () => {
  before(startApp);
  after(stopApp);

  it('negotiates supported locale preferences', async () => {
    for (const [preference, expectedLocation] of [
      ['fr-BE,fr;q=0.9', '/fr'],
      ['en-US,en;q=0.9', '/en'],
      ['nl-BE,nl;q=0.9', '/nl'],
    ]) {
      const response = await request('/', {headers: {'accept-language': preference}});
      assert.equal(response.status, 307, preference);
      assert.equal(response.headers.get('location'), expectedLocation, preference);
      await response.arrayBuffer();
    }
  });

  it('falls back for unsupported locales and preserves query strings', async () => {
    const fallback = await request('/', {headers: {'accept-language': 'de-DE,de;q=0.9'}});
    assert.equal(fallback.status, 307);
    assert.equal(fallback.headers.get('location'), '/fr');
    await fallback.arrayBuffer();

    const query = await request('/contact?service=ai&source=http-contract', {
      headers: {'accept-language': 'en-US,en;q=0.9'},
    });
    assert.equal(query.status, 307);
    assert.equal(query.headers.get('location'), '/en/contact?service=ai&source=http-contract');
    await query.arrayBuffer();

    const unsupportedPath = await request('/de?source=http-contract');
    assert.equal(unsupportedPath.status, 307);
    assert.equal(unsupportedPath.headers.get('location'), '/fr/de?source=http-contract');
    await unsupportedPath.arrayBuffer();

    const finalResponse = await request(unsupportedPath.headers.get('location'));
    assert.equal(finalResponse.status, 404);
    await finalResponse.arrayBuffer();
  });

  it('serves every source-derived localized page', async () => {
    for (const pathname of facts.expectedPaths) {
      const response = await request(pathname);
      assert.equal(response.status, 200, pathname);
      assert.match(response.headers.get('content-type') ?? '', /^text\/html\b/i, pathname);
      const body = await response.text();
      assert.match(body, new RegExp(`<html[^>]+lang=["']${pathname.slice(1, 3)}["']`), pathname);
    }
  });

  it('returns 404 for invalid routes and service slugs', async () => {
    for (const pathname of ['/fr/not-a-route', '/fr/services/not-a-service']) {
      const response = await request(pathname);
      assert.equal(response.status, 404, pathname);
      await response.arrayBuffer();
    }
  });

  it('applies security and cache headers by response class', async () => {
    const responseClasses = [
      {path: '/fr', cache: htmlCache, type: /^text\/html\b/i},
      {path: '/favicon.ico', cache: staticCache, type: /^image\/x-icon\b/i},
      {path: '/robots.txt', cache: staticCache, type: /^text\/plain\b/i},
      {path: '/fr/not-a-route', cache: errorCache, type: /^text\/html\b/i},
    ];

    for (const contract of responseClasses) {
      const response = await request(contract.path);
      assertSecurityHeaders(response, contract.path);
      assert.equal(response.headers.get('cache-control'), contract.cache, contract.path);
      assert.match(response.headers.get('content-type') ?? '', contract.type, contract.path);
      await response.arrayBuffer();
    }
  });

  it('serves robots.txt with its crawl and sitemap facts', async () => {
    const response = await request('/robots.txt');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /^text\/plain\b/i);
    assert.equal(response.headers.get('cache-control'), staticCache);

    const body = await response.text();
    assert.match(body, /^User-Agent: \*$/m);
    assert.match(body, /^Allow: \/$/m);
    assert.match(body, new RegExp(`^Sitemap: ${facts.siteUrl}/sitemap\\.xml$`, 'm'));
  });

  it('serves sitemap.xml with every source-derived canonical URL', async () => {
    const response = await request('/sitemap.xml');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /^application\/xml\b/i);
    assert.equal(response.headers.get('cache-control'), staticCache);

    const body = await response.text();
    assert.match(body, /^<\?xml version="1\.0" encoding="UTF-8"\?>/);
    assert.match(body, /<urlset\b/);
    const urls = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
    assert.deepEqual([...urls].sort(), [...facts.expectedUrls].sort());
  });

  it('serves llms.txt with noindex and localized discovery facts', async () => {
    const response = await request('/llms.txt');
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /^text\/plain; charset=utf-8$/i);
    assert.equal(response.headers.get('cache-control'), staticCache);
    assert.equal(response.headers.get('x-robots-tag'), 'noindex');

    const body = await response.text();
    assert.match(body, /^# Edge Solutions$/m);
    assert.match(body, /^## Canonical Localized Pages$/m);
    for (const url of facts.expectedUrls) assert.ok(body.includes(url), url);
  });
});
