function queryValueToStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(queryValueToStrings);
  }

  if (value === undefined || value === null) {
    return [];
  }

  return [String(value)];
}

function queryToSearch(query: Record<string, unknown> | undefined): string {
  if (!query) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    queryValueToStrings(value).forEach((item) => {
      searchParams.append(key, item);
    });
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

function normalizeHash(hash: unknown): string {
  if (typeof hash !== 'string' || hash.length === 0) {
    return '';
  }

  return hash.startsWith('#') ? hash : `#${hash}`;
}

export function hrefToTrackedTarget(href: unknown) {
  if (typeof href === 'string') return href;
  if (typeof href === 'object' && href && 'pathname' in href) {
    const pathname = typeof href.pathname === 'string' ? href.pathname : '';
    const query = 'query' in href ? queryToSearch(href.query as Record<string, unknown>) : '';
    const hash = 'hash' in href ? normalizeHash(href.hash) : '';

    return `${pathname}${query}${hash}`;
  }

  return '';
}

export function isContactTarget(target: string): boolean {
  const cleanPath = target.split(/[?#]/, 1)[0] ?? '';
  return cleanPath.endsWith('/contact') || cleanPath === '/contact';
}
