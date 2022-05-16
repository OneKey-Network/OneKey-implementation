import { pifMarketWebSiteConfig } from './old-config';
import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';

export const pifMarketWebSiteApp = new App(pifMarketWebSiteConfig.name).setHostName(pifMarketWebSiteConfig.host);

pifMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pifMarketWebSiteConfig.name,
    pafNodeHost: 'paf.pifmarket.shop',
    cdnHost: pifMarketWebSiteConfig.cdnHost,
    cmp: false,
  });
});

export const pifMarketCdnApp = new App(pifMarketWebSiteConfig.name).setHostName(pifMarketWebSiteConfig.cdnHost);
