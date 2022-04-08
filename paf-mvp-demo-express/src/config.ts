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

export const pafDemoPublisherConfig: PublicConfig = {
  name: 'PAF publisher',
  host: 'www.pafdemopublisher.com',
  cdnHost: 'cdn.pafdemopublisher.com',
};

export const cmpConfig: PublicConfig = {
  name: 'CMP used by PAF publisher',
  host: 'cmp.pafdemopublisher.com',
};

export const crtoOneOperatorConfig: PublicConfig = {
  name: 'Some PAF operator',
  host: 'crto-poc-1.onekey.network',
};

export const portalConfig: PublicConfig = {
  name: 'A PAF portal',
  host: 'portal.onekey.network',
};
