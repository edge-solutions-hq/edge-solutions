import type {MDXComponents} from 'mdx/types';
import {CTA} from '@/components/mdx/CTA';
import {GridList, GridListItem} from '@/components/studio/GridList';
import {List, ListItem} from '@/components/studio/List';
import {PageIntro} from '@/components/studio/PageIntro';
import {PrototypeSignals} from '@/components/mdx/PrototypeSignals';
import {ProjectGallery} from '@/components/mdx/ProjectGallery';
import {SectionIntro} from '@/components/studio/SectionIntro';
import {ServiceFaq} from '@/components/mdx/ServiceFaq';
import {ShowcasePanel} from '@/components/ui/ShowcasePanel';
import {WorkflowSnapshot} from '@/components/mdx/WorkflowSnapshot';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    CTA,
    PageIntro,
    PrototypeSignals,
    ProjectGallery,
    SectionIntro,
    ServiceFaq,
    GridList,
    GridListItem,
    List,
    ListItem,
    ShowcasePanel,
    WorkflowSnapshot,

    h1: (props) => (
      <h1
        className="scroll-m-20 font-display text-4xl font-extrabold tracking-tight"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mt-10 scroll-m-20 font-display text-2xl font-bold tracking-tight"
        {...props}
      />
    ),
    a: (props) => (
      <a
        className="text-link underline underline-offset-4 decoration-primary/70 transition-colors hover:decoration-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
        {...props}
      />
    )
  };
}
