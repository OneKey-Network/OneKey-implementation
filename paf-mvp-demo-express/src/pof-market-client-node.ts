import { crtoOneOperatorConfig, pofMarketClientNodeConfig, PrivateConfig } from './config';
import { ClientNode } from '@operator-client/client-node';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

const pofMarketPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T12:00:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAETKe8WSDJmxoVWLgHk3F2Q0vtewqn
cNqOUrKuGEU+7iwJPiQVkdL1hshouUEPI2C2ti8j0s3K3JY2imY3DxKigw==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEINYQ3rZ6+TUBN1IYOE1jpfFXGIjl1kDfFxy4AqqvYpFzoAoGCCqGSM49
AwEHoUQDQgAETKe8WSDJmxoVWLgHk3F2Q0vtewqncNqOUrKuGEU+7iwJPiQVkdL1
hshouUEPI2C2ti8j0s3K3JY2imY3DxKigw==
-----END EC PRIVATE KEY-----`,
  dpoEmailAddress: 'contact@www.pofmarket.shop',
  privacyPolicyUrl: 'https://www.pofmarket.shop/privacy',
};

export const pofMarketClientNode = new ClientNode(
  {
    name: pofMarketClientNodeConfig.name,
    publicKeys: [pofMarketPrivateConfig.currentPublicKey],
    dpoEmailAddress: pofMarketPrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pofMarketPrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pofMarketClientNodeConfig.host,
    privateKey: pofMarketPrivateConfig.privateKey,
  },
  crtoOneOperatorConfig.host,
  s2sOptions
);
