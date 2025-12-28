import type {ComponentPropsWithoutRef, ElementType, ReactNode} from 'react';
import {cn} from '@/lib/cn';

type ContainerProps<T extends ElementType> = {
  as?: T;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

export function Container<T extends ElementType = 'div'>({
  as,
  className,
  innerClassName,
  children,
  ...props
}: Omit<ComponentPropsWithoutRef<T>, keyof ContainerProps<T>> &
  ContainerProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component className={cn('w-full', className)} {...props}>
      <div className={cn('mx-auto max-w-3xl lg:max-w-none', innerClassName)}>
        {children}
      </div>
    </Component>
  );
}


