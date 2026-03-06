'use client';

import {useEffect, useRef} from 'react';
import {trackConversionEvent} from '@/lib/analytics/events';

type ServiceScrollDepthTrackerProps = {
  serviceSlug: string;
};

const SCROLL_DEPTH_THRESHOLDS = [25, 50, 75, 90, 100] as const;

function getScrollDepthPercent() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const scrollableHeight = Math.max(doc.scrollHeight - window.innerHeight, 0);

  if (scrollableHeight <= 0) {
    return 100;
  }

  return Math.min(100, Math.round((scrollTop / scrollableHeight) * 100));
}

export function ServiceScrollDepthTracker({serviceSlug}: ServiceScrollDepthTrackerProps) {
  const firedThresholdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    firedThresholdsRef.current.clear();

    const emitDepthEvents = () => {
      const scrollDepthPercent = getScrollDepthPercent();

      for (const threshold of SCROLL_DEPTH_THRESHOLDS) {
        if (scrollDepthPercent < threshold) continue;
        if (firedThresholdsRef.current.has(threshold)) continue;

        firedThresholdsRef.current.add(threshold);
        trackConversionEvent('service_scroll_depth', {
          service_slug: serviceSlug,
          scroll_depth_percent: threshold,
        });
      }
    };

    const onScroll = () => {
      emitDepthEvents();
    };

    emitDepthEvents();

    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [serviceSlug]);

  return null;
}
