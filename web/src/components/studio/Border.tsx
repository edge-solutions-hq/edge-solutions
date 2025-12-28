import type {ComponentPropsWithoutRef, ElementType} from 'react';
import {cn} from '@/lib/cn';

type BorderProps<T extends ElementType> = {
  as?: T;
  className?: string;
  position?: 'top' | 'left';
  /**
   * Use a higher-contrast border on dark backgrounds (e.g. inside a dark section).
   */
  invert?: boolean;
};

export function Border<T extends ElementType = 'div'>({
  as,
  className,
  position = 'top',
  invert = false,
  ...props
}: Omit<ComponentPropsWithoutRef<T>, keyof BorderProps<T>> & BorderProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component
      className={cn(
        className,
        'relative before:absolute after:absolute',
        invert
          ? 'before:bg-foreground after:bg-foreground/20'
          : 'before:bg-foreground after:bg-border',
        position === 'top' &&
          'before:top-0 before:left-0 before:h-px before:w-6 after:top-0 after:right-0 after:left-8 after:h-px',
        position === 'left' &&
          'before:top-0 before:left-0 before:h-6 before:w-px after:top-8 after:bottom-0 after:left-0 after:w-px'
      )}
      {...props}
    />
  );
}


