import { pafMarketClientNodeConfig, pafMarketWebSiteConfig } from './old-config';
import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';

export const pafMarketWebSiteApp = new App(pafMarketWebSiteConfig.name).setHostName(pafMarketWebSiteConfig.host);

pafMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pafMarketWebSiteConfig.name,
    pafNodeHost: pafMarketClientNodeConfig.host,
    cdnHost: pafMarketWebSiteConfig.cdnHost,
  });
});

export const pafMarketCdnApp = new App(pafMarketWebSiteConfig.name).setHostName(pafMarketWebSiteConfig.cdnHost);
