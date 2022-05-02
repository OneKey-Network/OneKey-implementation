import express from 'express';
import { crtoOneOperatorConfig, pifCmpConfig, pifDemoPublisherConfig, PrivateConfig } from './config';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

const pifCmpPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-15T10:50:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKwW/bVmi/yM2QRtPMKGeKMylxBBg
Qs9+mjSaivSEXR8VCCJfxdktJyDD+ooj5HxZibrLkmoQ8klbnMaXBvkVkw==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIF4OKHOcZh3/XeLmP5yPtb0qiBc+8vuZf0bgVrOo/CbIoAoGCCqGSM49
AwEHoUQDQgAEKwW/bVmi/yM2QRtPMKGeKMylxBBgQs9+mjSaivSEXR8VCCJfxdkt
JyDD+ooj5HxZibrLkmoQ8klbnMaXBvkVkw==
-----END EC PRIVATE KEY-----`,
  dpoEmailAddress: 'contact@www.pifdemopublisher.com',
  privacyPolicyUrl: 'https://www.pifdemopublisher.com/privacy',
};

export const pifCmpApp = express();

// This PAF client node only allows calls from the corresponding publisher's website
const allowedOrigins = [getHttpsOriginFromHostName(pifDemoPublisherConfig.host)];

addClientNodeEndpoints(
  pifCmpApp,
  crtoOneOperatorConfig.host,
  pifCmpConfig.host,
  pifCmpPrivateConfig.privateKey,
  allowedOrigins,
  s2sOptions
);

// Add identity endpoint
addIdentityEndpoint(
  pifCmpApp,
  pifCmpConfig.name,
  pifCmpPrivateConfig.type,
  [pifCmpPrivateConfig.currentPublicKey],
  pifCmpPrivateConfig.dpoEmailAddress,
  new URL(pifCmpPrivateConfig.privacyPolicyUrl)
);
