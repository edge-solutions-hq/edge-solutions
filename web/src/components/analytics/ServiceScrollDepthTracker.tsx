'use client';

import {useEffect, useRef} from 'react';
import {trackServiceScrollDepth} from '@/lib/analytics/events';
import {scrollDepthThresholds} from '@/lib/analytics/taxonomy';
import type {OfferTrackSlug} from '@/lib/offer-tracks';

type ServiceScrollDepthTrackerProps = {
  offerTrackSlug: OfferTrackSlug;
};

function getScrollDepthPercent() {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const scrollableHeight = Math.max(doc.scrollHeight - window.innerHeight, 0);

  if (scrollableHeight <= 0) {
    return 100;
  }

  return Math.min(100, Math.round((scrollTop / scrollableHeight) * 100));
}

export function ServiceScrollDepthTracker({offerTrackSlug}: ServiceScrollDepthTrackerProps) {
  const firedThresholdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    firedThresholdsRef.current.clear();

    const emitDepthEvents = () => {
      const scrollDepthPercent = getScrollDepthPercent();

      for (const threshold of scrollDepthThresholds) {
        if (scrollDepthPercent < threshold) continue;
        if (firedThresholdsRef.current.has(threshold)) continue;

        firedThresholdsRef.current.add(threshold);
        trackServiceScrollDepth({offerTrackSlug, scrollDepthPercent: threshold});
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
  }, [offerTrackSlug]);

  return null;
}
