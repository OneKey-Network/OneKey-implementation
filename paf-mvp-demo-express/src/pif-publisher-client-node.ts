import { pifPublisherClientNodeConfig, PrivateConfig } from './old-config';
import { ClientNode } from '@operator-client/client-node';
import { s2sOptions } from './demo-utils';
import { getTimeStampInSec } from '@core/timestamp';

const pifClientNodePrivateConfig: PrivateConfig = {
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
  dpoEmailAddress: 'contact@pifdemopublisher.com',
  privacyPolicyUrl: 'https://www.pifdemopublisher.com/privacy',
};

export const pifPublisherClientNode = new ClientNode(
  {
    name: pifPublisherClientNodeConfig.name,
    publicKeys: [pifClientNodePrivateConfig.currentPublicKey],
    dpoEmailAddress: pifClientNodePrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pifClientNodePrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pifPublisherClientNodeConfig.host,
    privateKey: pifClientNodePrivateConfig.privateKey,
  },
  'crto-poc-1.onekey.network',
  s2sOptions
);
