import express from 'express';
import { crtoOneOperatorConfig, PrivateConfig, PublicConfig } from './config';
import { addOperatorClientProxyEndpoints } from '@operator-client/operator-client-proxy';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

const criteoTestPAFClientPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-05-06T09:14:15.061Z')),
    // Notice: no end date
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1nJpcrd5lhTEEzckbLRt6CyQWvZd
7ro0byHSt15JpC8KgazhVC+y7o2uiGuG8PQGxsB9P/fTfpRQI05WZipY0g==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIBwYHWM6wAOwT1/+9WxZOFE59r1SI1NKuoieERp1gW7JoAoGCCqGSM49
AwEHoUQDQgAE1nJpcrd5lhTEEzckbLRt6CyQWvZd7ro0byHSt15JpC8KgazhVC+y
7o2uiGuG8PQGxsB9P/fTfpRQI05WZipY0g==
-----END EC PRIVATE KEY-----`,
  dpoEmailAddress: 'contact@www.ad-tags.de',
  privacyPolicyUrl: 'https://www.ad-tags.de/privacy',
};

export const criteoTestPAFClientPublicConfig: PublicConfig & { allowedOrigin: string } = {
  name: 'Ad Tags test',
  host: 'paf.ad-tags.de',
  // FIXME should be removed after merge of https://github.com/prebid/paf-mvp-implementation/pull/131
  allowedOrigin: 'https://www.ad-tags.de',
};

// This PAF proxy only allows calls from its clients
export const criteoTestsApp = express();
addOperatorClientProxyEndpoints(
  criteoTestsApp,
  crtoOneOperatorConfig.host,
  criteoTestPAFClientPublicConfig.host,
  criteoTestPAFClientPrivateConfig.privateKey,
  [criteoTestPAFClientPublicConfig.allowedOrigin],
  s2sOptions
);

// FIXME /!\ merge correctly with https://github.com/prebid/paf-mvp-implementation/pull/131
// Add identity endpoint
addIdentityEndpoint(
  criteoTestsApp,
  criteoTestPAFClientPublicConfig.name,
  criteoTestPAFClientPrivateConfig.type,
  [criteoTestPAFClientPrivateConfig.currentPublicKey],
  criteoTestPAFClientPrivateConfig.dpoEmailAddress,
  new URL(criteoTestPAFClientPrivateConfig.privacyPolicyUrl)
);
