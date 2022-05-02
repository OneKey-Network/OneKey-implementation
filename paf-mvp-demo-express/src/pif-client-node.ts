import express from 'express';
import { crtoOneOperatorConfig, pifCmpConfig, pifDemoPublisherConfig, PrivateConfig } from './config';
import { addClientNodeEndpoints } from '@operator-client/client-node';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';
import { getHttpsOriginFromHostName } from '@core/express/utils';

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

addClientNodeEndpoints(
  pifCmpApp,
  {
    name: pifCmpConfig.name,
    currentPublicKey: pifCmpPrivateConfig.currentPublicKey,
    dpoEmailAddress: pifCmpPrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pifCmpPrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pifCmpConfig.host,
    privateKey: pifCmpPrivateConfig.privateKey,
  },
  crtoOneOperatorConfig.host,
  s2sOptions
);
