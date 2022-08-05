export const getCookieValue = (name: string): string | undefined =>
  document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || undefined;

// default value : 24h
export const DEFAULT_TTL_IN_SECONDS = 24 * 3600;

// maximum value : 1 week
export const MAXIMUM_TTL_IN_SECONDS = 7 * 24 * 3600;
