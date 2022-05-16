import { pafMarketClientNodeConfig, pafMarketWebSiteConfig } from './old-config';
import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';

export const pafMarketWebSiteApp = new App(pafMarketWebSiteConfig.name).setHostName(pafMarketWebSiteConfig.host);

/*
const client = new OperatorBackendClient(
  'crto-poc-1.onekey.network',
  pafMarketConfig.host,
  pafMarketPrivateConfig.privateKey,
  RedirectType.http,
  new PublicKeyStore(s2sOptions)
);
 */

// Both a web server serving web content
pafMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
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

export const pafMarketCdnApp = new App(pafMarketWebSiteConfig.name).setHostName(pafMarketWebSiteConfig.cdnHost);
