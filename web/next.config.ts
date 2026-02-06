import createMDX from '@next/mdx';
import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const withMDX = createMDX({
  options: {
    // Turbopack requires remark/rehype plugins to be passed as serializable values.
    // Use strings instead of importing plugin functions.
    remarkPlugins: ['remark-gfm']
  }
});

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

  async headers() {
    const cacheOneDay = 'public, max-age=86400, stale-while-revalidate=604800';

    return [
      // Baseline security headers for all routes.
      {
        source: '/:path*',
        headers: [...securityHeaders]
      },

      // Light caching for SEO/static endpoints.
      {
        source: '/robots.txt',
        headers: [...securityHeaders, {key: 'Cache-Control', value: cacheOneDay}]
      },
      {
        source: '/sitemap.xml',
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
