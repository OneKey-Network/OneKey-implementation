import express, { Request, Response } from 'express';
import { crtoOneOperatorConfig, pifMarketConfig, PrivateConfig } from './config';
import { addOperatorClientProxyEndpoints } from '@operator-client/operator-client-proxy';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
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

export const pifMarketApp = express();

pifMarketApp.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pifMarketConfig.name,
    proxyHostName: pifMarketConfig.host,
    cdnHost: pifMarketConfig.cdnHost,
  });
});

// Setup a JS proxy
addOperatorClientProxyEndpoints(
  pifMarketApp,
  crtoOneOperatorConfig.host,
  pifMarketConfig.host,
  pifMarketPrivateConfig.privateKey,
  [`https://${pifMarketConfig.host}`],
  s2sOptions
);

// Add identity endpoint
addIdentityEndpoint(
  pifMarketApp,
  pifMarketConfig.name,
  pifMarketPrivateConfig.type,
  [pifMarketPrivateConfig.currentPublicKey],
  pifMarketPrivateConfig.dpoEmailAddress,
  new URL(pifMarketPrivateConfig.privacyPolicyUrl)
);
