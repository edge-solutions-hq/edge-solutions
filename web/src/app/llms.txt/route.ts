import {buildLlmsTxt} from '@/lib/site/ai-discovery';

export const dynamic = 'force-static';
export const revalidate = 86400;

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex',
    },
  });
}
