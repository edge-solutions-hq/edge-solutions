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
        'inline-flex items-center justify-center gap-1 rounded-md border border-primary/80 bg-primary/18 px-3 py-2 text-sm font-semibold text-technical-blue no-underline shadow-[3px_3px_0_rgba(170,142,75,0.2)] transition-[background-color,box-shadow] duration-300 ease-out hover:bg-primary/25 hover:shadow-[2px_2px_0_rgba(170,142,75,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none',
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
