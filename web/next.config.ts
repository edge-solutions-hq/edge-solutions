import createMDX from '@next/mdx';
import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import path from 'node:path';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm']
  }
});

const repoRoot = path.join(process.cwd(), '..');

const securityHeaders = [
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'X-Frame-Options', value: 'DENY'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  }
] as const;

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
  outputFileTracingRoot: repoRoot,
  turbopack: {
    root: repoRoot
  },

  async headers() {
    const cacheOneDay = 'public, max-age=86400, stale-while-revalidate=604800';

    return [
      {
        source: '/:path*',
        headers: [...securityHeaders]
      },

      {
        source: '/robots.txt',
        headers: [...securityHeaders, {key: 'Cache-Control', value: cacheOneDay}]
      },
      {
        source: '/sitemap.xml',
        headers: [...securityHeaders, {key: 'Cache-Control', value: cacheOneDay}]
      },
      {
        source: '/llms.txt',
        headers: [...securityHeaders, {key: 'Cache-Control', value: cacheOneDay}]
      },
      {
        source: '/favicon.ico',
        headers: [...securityHeaders, {key: 'Cache-Control', value: cacheOneDay}]
      }
    ];
  }
};

export default withNextIntl(withMDX(nextConfig));
