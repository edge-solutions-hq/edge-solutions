import type {CSSProperties, ReactNode} from 'react';
import {cn} from '@/lib/cn';

/**
 * Editor/terminal title bar: three window dots, a mono title and an optional
 * right slot. Purely decorative by default (aria-hidden) so that the real
 * copy underneath stays the accessible signal.
 */
export function WindowChrome({
  title,
  right,
  className,
  decorative = true,
}: {
  title?: ReactNode;
  right?: ReactNode;
  className?: string;
  decorative?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex h-10 shrink-0 items-center gap-3 border-b border-border bg-secondary/70 px-4 font-mono text-xs text-subtle-foreground',
        className
      )}
      aria-hidden={decorative ? 'true' : undefined}
    >
      <WindowDots />
      {title ? <span className="min-w-0 truncate">{title}</span> : null}
      {right ? <span className="ml-auto flex shrink-0 items-center gap-2">{right}</span> : null}
    </div>
  );
}

export function WindowDots({className}: {className?: string}) {
  return (
    <span className={cn('flex shrink-0 items-center gap-1.5', className)} aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full bg-syn-red/85" />
      <span className="h-2.5 w-2.5 rounded-full bg-primary/85" />
      <span className="h-2.5 w-2.5 rounded-full bg-syn-green/85" />
    </span>
  );
}

/** Decorative prompt line such as `$ ls ./services`, placed above a real heading. */
export function PromptLine({
  command,
  typed = false,
  caret = false,
  className,
}: {
  command: string;
  typed?: boolean;
  caret?: boolean;
  className?: string;
}) {
  return (
    <p className={cn('prompt-line', className)} aria-hidden="true">
      <span className="prompt-sigil">$</span>
      <span
        className={typed ? 'typed' : undefined}
        style={typed ? ({'--chars': command.length} as CSSProperties) : undefined}
      >
        {command}
      </span>
      {caret ? <span className="caret" /> : null}
    </p>
  );
}
