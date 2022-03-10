export const getCookieValue = (name: string): string | undefined => document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || undefined;
