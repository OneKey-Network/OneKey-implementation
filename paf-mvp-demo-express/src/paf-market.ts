import express, { Request, Response } from 'express';
import { crtoOneOperatorConfig, pafMarketWebSiteConfig, PrivateConfig } from './config';
import { addClientNodeEndpoints } from '@operator-client/client-node';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

const pafMarketClientNodePrivateConfig: PrivateConfig = {
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
  dpoEmailAddress: 'contact@www.pafmarket.shop',
  privacyPolicyUrl: 'https://www.pafmarket.shop/privacy',
};

export const pafMarketWebSiteApp = express();

/*
const client = new OperatorBackendClient(
  crtoOneOperatorConfig.host,
  pafMarketConfig.host,
  pafMarketPrivateConfig.privateKey,
  RedirectType.http,
  new PublicKeyStore(s2sOptions)
);
 */

// Both a web server serving web content
pafMarketWebSiteApp.get('/', async (req: Request, res: Response) => {
  const view = 'advertiser/index';

  // Act as an HTTP middleware
  // FIXME the usage of the backend client breaks logic for showing the notification. Need to decide how to fix.
  //if (await client.getIdsAndPreferencesOrRedirect(req, res, view)) {
  res.render(view, {
    title: pafMarketWebSiteConfig.name,
    pafNodeHost: pafMarketWebSiteConfig.host,
    cdnHost: pafMarketWebSiteConfig.cdnHost,
  });
  //}
});

// ...and also a PAF node
addClientNodeEndpoints(
  pafMarketWebSiteApp,
  {
    name: pafMarketWebSiteConfig.name,
    currentPublicKey: pafMarketClientNodePrivateConfig.currentPublicKey,
    dpoEmailAddress: pafMarketClientNodePrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pafMarketClientNodePrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pafMarketWebSiteConfig.host,
    privateKey: pafMarketClientNodePrivateConfig.privateKey,
  },
  crtoOneOperatorConfig.host,
  s2sOptions
);
