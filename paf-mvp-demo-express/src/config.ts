import { KeyInfo } from '@core/crypto/identity';

export interface PublicConfig {
  name: string;
  host: string;
  cdnHost?: string;
}

export interface PrivateConfig {
  currentPublicKey: KeyInfo;
  privateKey: string;
  type: 'vendor' | 'operator'; // TODO should support more
}

export const pafMarketConfig: PublicConfig = {
  name: 'PAF advertiser',
  host: 'www.pafmarket.shop',
  cdnHost: 'cdn.pafmarket.shop',
};

export const pifMarketConfig: PublicConfig = {
  name: 'PIF advertiser',
  host: 'www.pifmarket.shop',
  cdnHost: 'cdn.pifmarket.shop',
};

export const pofMarketConfig: PublicConfig = {
  name: 'POF advertiser',
  host: 'www.pofmarket.shop',
  cdnHost: 'cdn.pofmarket.shop',
};

export const pafDemoPublisherConfig: PublicConfig = {
  name: 'PAF publisher',
  host: 'www.pafdemopublisher.com',
  cdnHost: 'cdn.pafdemopublisher.com',
};

export const pifDemoPublisherConfig: PublicConfig = {
  name: 'PIF publisher',
  host: 'www.pifdemopublisher.com',
  cdnHost: 'cdn.pifdemopublisher.com',
};

export const pofDemoPublisherConfig: PublicConfig = {
  name: 'POF publisher',
  host: 'www.pofdemopublisher.com',
  cdnHost: 'cdn.pofdemopublisher.com',
};

export const pafCmpConfig: PublicConfig = {
  name: 'CMP used by PAF publisher',
  host: 'cmp.pafdemopublisher.com',
};

export const pifCmpConfig: PublicConfig = {
  name: 'CMP used by PIF publisher',
  host: 'cmp.pifdemopublisher.com',
};

export const pofCmpConfig: PublicConfig = {
  name: 'CMP used by POF publisher',
  host: 'cmp.pofdemopublisher.com',
};

export const crtoOneOperatorConfig: PublicConfig = {
  name: 'Some PAF operator',
  host: 'crto-poc-1.onekey.network',
};

export const portalConfig: PublicConfig = {
  name: 'A PAF portal',
  host: 'portal.onekey.network',
};
