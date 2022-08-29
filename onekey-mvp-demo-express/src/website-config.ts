export interface WebSiteConfig {
  name: string;
  host: string;
  pafNodeHost?: string;
  cdnHost?: string;
}

// Regexp that exclude any file under /assets/ directory
// Examples of accepted paths:
//  /
//  /index.html
//  /some-page/under/path#anchor
// Examples of refused paths:
//  /assets/
//  /assets/favicon.ico
export const anythingButAssets = /^(?!\/assets\/).*/;
