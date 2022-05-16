import { crtoOneOperatorConfig, pifMarketClientNodeConfig, PrivateConfig } from './config';
import { ClientNode } from '@operator-client/client-node';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

const pifMarketPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T12:00:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEaF2LzzUF4lEQ4KQZxVkz7Sl5KIw
0Pk2uD/k+nv9NnSZat9kQtJ8MfRbBTyw+3s7boL9UFmkpc366R8fFXZMjg==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIHdDU+4DGYLAqroSuXm3yMyd0fN3KHV+dS/14F9qOIRSoAoGCCqGSM49
AwEHoUQDQgAEEaF2LzzUF4lEQ4KQZxVkz7Sl5KIw0Pk2uD/k+nv9NnSZat9kQtJ8
MfRbBTyw+3s7boL9UFmkpc366R8fFXZMjg==
-----END EC PRIVATE KEY-----`,
  dpoEmailAddress: 'contact@www.pifmarket.shop',
  privacyPolicyUrl: 'https://www.pifmarket.shop/privacy',
};

export const pifMarketClientNode = new ClientNode(
  {
    name: pifMarketClientNodeConfig.name,
    publicKeys: [pifMarketPrivateConfig.currentPublicKey],
    dpoEmailAddress: pifMarketPrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pifMarketPrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pifMarketClientNodeConfig.host,
    privateKey: pifMarketPrivateConfig.privateKey,
  },
  crtoOneOperatorConfig.host,
  s2sOptions
);
