import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';
import {cn} from '@/lib/cn';

/**
 * Lightweight content wrappers.
 *
 * This replaces framer-motion to reduce first-load JS.
 * Content stays visible by default so no-JS rendering, screenshots, and LCP text
 * do not depend on hydration.
 */

type FadeInProps = HTMLAttributes<HTMLDivElement> & {
  /** Optional delay (ms) used by FadeInStagger. */
  delayMs?: number;
  /** Kept for compatibility with older callers; content is always visible. */
  initiallyVisible?: boolean;
};

export function FadeIn({className, style, delayMs, initiallyVisible, ...props}: FadeInProps) {
  void initiallyVisible;

  return (
    <div
      className={cn(
        'opacity-100 transition-opacity duration-500 motion-reduce:transition-none',
        className
      )}
      style={{
        ...style,
        transitionDelay: delayMs != null ? `${delayMs}ms` : style?.transitionDelay
      }}
      {...props}
    />
  );
}

type FadeInStaggerProps = HTMLAttributes<HTMLDivElement> & {
  faster?: boolean;
  children: ReactNode;
};

function reactComponentName(type: ReactElement['type']) {
  if (typeof type === 'string') return '';
  const component = type as {displayName?: string; name?: string};
  return component.displayName || component.name || '';
}

export function FadeInStagger({faster = false, className, children, ...props}: FadeInStaggerProps) {
  const step = faster ? 120 : 200;

  const staggered = Children.map(children, (child, index) => {
    if (!isValidElement(child)) return child;

    // Only inject delay into our FadeIn wrapper.
    const isFadeIn = reactComponentName(child.type) === 'FadeIn';

    if (!isFadeIn) return child;

    return cloneElement(child as ReactElement<FadeInProps>, {
      delayMs: index * step
    });
  });

  return (
    <div className={cn(className)} {...props}>
      {staggered}
    </div>
  );
}

