// FIXME Should be more elaborate. For the moment just consider Safari doesn't support 3PC
import { Browser } from 'detect-browser';

export const isBrowserKnownToSupport3PC = (browser: Browser) => {
  return browser && browser !== 'safari';
};
