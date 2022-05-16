import { PublicKeyInfo } from '@core/crypto/identity';

// FIXME get rid of everything below this line
export interface PublicConfig {
  name: string;
  host: string;
  cdnHost?: string;
}

export interface PrivateConfig {
  currentPublicKey: PublicKeyInfo;
  privateKey: string;
  type: 'vendor' | 'operator';
  dpoEmailAddress: string;
  privacyPolicyUrl: string;
}

export const pafMarketWebSiteConfig: PublicConfig = {
  name: 'PAF advertiser',
  host: 'www.pafmarket.shop',
  cdnHost: 'cdn.pafmarket.shop',
};

export const pafMarketClientNodeConfig: PublicConfig = {
  name: 'PAF advertiser',
  host: 'paf.pafmarket.shop',
};

export const pifMarketWebSiteConfig: PublicConfig = {
  name: 'PIF advertiser',
  host: 'www.pifmarket.shop',
  cdnHost: 'cdn.pifmarket.shop',
};

export const pifMarketClientNodeConfig: PublicConfig = {
  name: 'PIF advertiser',
  host: 'paf.pifmarket.shop',
};

export const pofMarketWebSiteConfig: PublicConfig = {
  name: 'POF advertiser',
  host: 'www.pofmarket.shop',
  cdnHost: 'cdn.pofmarket.shop',
};

export const pofMarketClientNodeConfig: PublicConfig = {
  name: 'POF advertiser',
  host: 'paf.pofmarket.shop',
};

export const pafPublisherWebSiteConfig: PublicConfig = {
  name: 'PAF publisher',
  host: 'www.pafdemopublisher.com',
  cdnHost: 'cdn.pafdemopublisher.com',
};

export const pifPublisherWebSiteConfig: PublicConfig = {
  name: 'PIF publisher',
  host: 'www.pifdemopublisher.com',
  cdnHost: 'cdn.pifdemopublisher.com',
};

export const pofPublisherWebSiteConfig: PublicConfig = {
  name: 'POF publisher',
  host: 'www.pofdemopublisher.com',
  cdnHost: 'cdn.pofdemopublisher.com',
};

export const pafPublisherClientNodeConfig: PublicConfig = {
  name: 'PAF publisher',
  host: 'cmp.pafdemopublisher.com',
};

export const pifPublisherClientNodeConfig: PublicConfig = {
  name: 'PIF publisher',
  host: 'cmp.pifdemopublisher.com',
};

export const pofPublisherClientNodeConfig: PublicConfig = {
  name: 'POF publisher',
  host: 'cmp.pofdemopublisher.com',
};

export const portalConfig: PublicConfig = {
  name: 'A PAF portal',
  host: 'portal.onekey.network',
};
