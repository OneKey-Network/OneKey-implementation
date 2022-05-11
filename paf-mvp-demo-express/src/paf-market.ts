import express, { Request, Response } from 'express';
import { crtoOneOperatorConfig, pafMarketConfig, PrivateConfig } from './config';
import { OperatorBackendClient, RedirectType } from '@operator-client/operator-backend-client';
import { addOperatorClientProxyEndpoints } from '@operator-client/operator-client-proxy';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import { s2sOptions } from './server-config';
import { PublicKeyStore } from '@core/crypto/key-store';
import { getTimeStampInSec } from '@core/timestamp';

const pafMarketPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T12:00:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEUnarwp0gUZgjb9fsYNLcNrddNKV5
h4/WfMRMVh3HIqojt3LIsvUQig1rm9ZkcNx+IHZVhDM+hso2sXlGjF9xOQ==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
  dpoEmailAddress: 'contact@pafmarket.shop',
  privacyPolicyUrl: 'https://www.pafmarket.shop/privacy',
};

export const pafMarketApp = express();

/*
const client = new OperatorBackendClient(
  crtoOneOperatorConfig.host,
  pafMarketConfig.host,
  pafMarketPrivateConfig.privateKey,
  RedirectType.http,
  new PublicKeyStore(s2sOptions)
);
 */

pafMarketApp.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  // Act as an HTTP middleware
  // FIXME the usage of the backend client breaks logic for showing the notification. Need to decide how to fix.
  //if (await client.getIdsAndPreferencesOrRedirect(req, res, view)) {
  res.render(view, {
    title: pafMarketConfig.name,
    proxyHostName: pafMarketConfig.host,
    cdnHost: pafMarketConfig.cdnHost,
  });
  //}
});

// ...and also as a JS proxy
addOperatorClientProxyEndpoints(
  pafMarketApp,
  crtoOneOperatorConfig.host,
  pafMarketConfig.host,
  pafMarketPrivateConfig.privateKey,
  [`https://${pafMarketConfig.host}`],
  s2sOptions
);

// Add identity endpoint
addIdentityEndpoint(
  pafMarketApp,
  pafMarketConfig.name,
  pafMarketPrivateConfig.type,
  [pafMarketPrivateConfig.currentPublicKey],
  pafMarketPrivateConfig.dpoEmailAddress,
  new URL(pafMarketPrivateConfig.privacyPolicyUrl)
);
