import type {MDXComponents} from 'mdx/types';
import {CTA} from '@/components/mdx/CTA';
import {Callout} from '@/components/mdx/Callout';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    // Custom components available in MDX without imports
    CTA,
    Callout,

    // Optional: tighten default rendering
    h1: (props) => (
      <h1
        className="scroll-m-20 text-4xl font-semibold tracking-tight"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mt-10 scroll-m-20 text-2xl font-semibold tracking-tight"
        {...props}
      />
    ),
    a: (props) => <a className="underline underline-offset-4" {...props} />
  };
}


