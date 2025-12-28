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

const nextConfig: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true
};

export default withNextIntl(withMDX(nextConfig));
