import express, { Request, Response } from 'express';
import { crtoOneOperatorConfig, pofMarketConfig, PrivateConfig } from './config';
import { addOperatorClientProxyEndpoints } from '@operator-client/operator-client-proxy';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import { s2sOptions } from './server-config';

const pofMarketPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    start: new Date('2022-01-01T12:00:00.000Z'),
    end: new Date('2022-12-31T12:00:00.000Z'),
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
};

export const pofMarketApp = express();

pofMarketApp.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pofMarketConfig.name,
    host: pofMarketConfig.host,
    cdnHost: pofMarketConfig.cdnHost,
  });
});

// Setup a JS proxy
addOperatorClientProxyEndpoints(
  pofMarketApp,
  crtoOneOperatorConfig.host,
  pofMarketConfig.host,
  pofMarketPrivateConfig.privateKey,
  [`https://${pofMarketConfig.host}`],
  s2sOptions
);

// Add identity endpoint
addIdentityEndpoint(pofMarketApp, pofMarketConfig.name, pofMarketPrivateConfig.type, [
  pofMarketPrivateConfig.currentPublicKey,
]);
