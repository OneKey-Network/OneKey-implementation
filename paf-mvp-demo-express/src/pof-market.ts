import express, { Request, Response } from 'express';
import { crtoOneOperatorConfig, pofMarketConfig, PrivateConfig } from './config';
import { addClientNodeEndpoints } from '@operator-client/client-node';
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

export const pofMarketApp = express();

// Both a web server serving web content
pofMarketApp.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pofMarketConfig.name,
    pafNodeHost: pofMarketConfig.host,
    cdnHost: pofMarketConfig.cdnHost,
    // True if the CMP is part of the demo page
    cmp: true,
  });
});

// ...and also a PAF node
addClientNodeEndpoints(
  pofMarketApp,
  {
    name: pofMarketConfig.name,
    currentPublicKey: pofMarketPrivateConfig.currentPublicKey,
    dpoEmailAddress: pofMarketPrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pofMarketPrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pofMarketConfig.host,
    privateKey: pofMarketPrivateConfig.privateKey,
  },
  crtoOneOperatorConfig.host,
  s2sOptions
);
