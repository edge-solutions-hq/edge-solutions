import type {AnchorHTMLAttributes, ReactNode} from 'react';
import {cn} from '@/lib/cn';

export type ExternalLinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
};

export function ExternalLinkButton({
  children,
  className,
  ...props
}: ExternalLinkButtonProps) {
  return (
    <a
      target="_blank"
      rel="noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-md border border-primary/70 bg-primary/10 px-3.5 py-2 font-mono text-[0.8125rem] font-bold text-accent no-underline transition-[background-color,border-color] duration-200 ease-out hover:border-primary hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
        className
      )}
      {...props}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      >
        <path d="M6 4h6v6" />
        <path d="m5 11 7-7" />
      </svg>
    </a>
  );
}
