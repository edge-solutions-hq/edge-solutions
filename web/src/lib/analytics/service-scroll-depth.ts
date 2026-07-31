export function calculateScrollDepthPercent({
  scrollTop,
  scrollHeight,
  viewportHeight,
}: {
  scrollTop: number;
  scrollHeight: number;
  viewportHeight: number;
}) {
  const scrollableHeight = Math.max(scrollHeight - viewportHeight, 0);

  if (scrollableHeight <= 0) {
    return 100;
  }

  return Math.max(0, Math.min(100, Math.round((scrollTop / scrollableHeight) * 100)));
}

export function getUnfiredScrollDepthThresholds<T extends number>({
  scrollDepthPercent,
  thresholds,
  firedThresholds,
}: {
  scrollDepthPercent: number;
  thresholds: readonly T[];
  firedThresholds: ReadonlySet<number>;
}): T[] {
  return thresholds.filter((threshold) => (
    scrollDepthPercent >= threshold && !firedThresholds.has(threshold)
  ));
}
