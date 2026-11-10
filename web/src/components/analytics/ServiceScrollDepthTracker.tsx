'use client';

import {useEffect, useRef} from 'react';
import {trackServiceScrollDepth} from '@/lib/analytics/events';
import {
  calculateScrollDepthPercent,
  getUnfiredScrollDepthThresholds,
} from '@/lib/analytics/service-scroll-depth';
import {scrollDepthThresholds} from '@/lib/analytics/taxonomy';
import type {OfferTrackSlug} from '@/lib/offer/offer-tracks';

type ServiceScrollDepthTrackerProps = {
  offerTrackSlug: OfferTrackSlug;
};

function getScrollDepthPercent() {
  const doc = document.documentElement;
  return calculateScrollDepthPercent({
    scrollTop: window.scrollY || doc.scrollTop || 0,
    scrollHeight: doc.scrollHeight,
    viewportHeight: window.innerHeight,
  });
}

export function ServiceScrollDepthTracker({offerTrackSlug}: ServiceScrollDepthTrackerProps) {
  const firedThresholdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    firedThresholdsRef.current.clear();

    const emitDepthEvents = () => {
      const scrollDepthPercent = getScrollDepthPercent();

      for (const threshold of getUnfiredScrollDepthThresholds({
        scrollDepthPercent,
        thresholds: scrollDepthThresholds,
        firedThresholds: firedThresholdsRef.current,
      })) {
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
