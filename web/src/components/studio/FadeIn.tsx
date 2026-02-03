'use client';

import * as React from 'react';
import {cn} from '@/lib/cn';

/**
 * Lightweight reveal-on-scroll components.
 *
 * This replaces framer-motion to reduce first-load JS.
 * Uses IntersectionObserver + CSS transitions.
 */

type FadeInProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Optional delay (ms) used by FadeInStagger. */
  delayMs?: number;
};

export function FadeIn({className, style, delayMs, ...props}: FadeInProps) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    // If IO isn't available, just show.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            return;
          }
        }
      },
      // Match the previous framer viewport margin.
      {root: null, rootMargin: '0px 0px -200px 0px', threshold: 0.01}
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-500 will-change-transform motion-reduce:transition-none',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-6 motion-reduce:translate-y-0',
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

type FadeInStaggerProps = React.HTMLAttributes<HTMLDivElement> & {
  faster?: boolean;
  children: React.ReactNode;
};

export function FadeInStagger({faster = false, className, children, ...props}: FadeInStaggerProps) {
  const step = faster ? 120 : 200;

  const staggered = React.Children.map(children, (child, index) => {
    if (!React.isValidElement(child)) return child;

    // Only inject delay into our FadeIn wrapper.
    const isFadeIn =
      typeof child.type !== 'string' &&
      // @ts-expect-error - name is not in the type, but is safe to inspect.
      (child.type?.name === 'FadeIn' || child.type?.displayName === 'FadeIn');

    if (!isFadeIn) return child;

    return React.cloneElement(child, {
      // @ts-expect-error - delayMs is our prop; cloneElement typing is conservative.
      delayMs: index * step
    });
  });

  return (
    <div className={cn(className)} {...props}>
      {staggered}
    </div>
  );
}


