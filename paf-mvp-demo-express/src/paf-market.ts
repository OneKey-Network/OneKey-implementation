import express, { Request, Response } from 'express';
import { pafMarketClientNodeConfig, pafMarketWebSiteConfig } from './config';

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
    pafNodeHost: pafMarketClientNodeConfig.host,
    cdnHost: pafMarketWebSiteConfig.cdnHost,
  });
  //}
});
