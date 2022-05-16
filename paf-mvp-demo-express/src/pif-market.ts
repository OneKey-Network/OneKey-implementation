import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';
import { PublicConfig } from './old-config';

const pifMarketWebSiteConfig: PublicConfig = {
  name: 'PIF advertiser',
  host: 'www.pifmarket.shop',
  cdnHost: 'cdn.pifmarket.shop',
};

export const pifMarketWebSiteApp = new App(pifMarketWebSiteConfig.name).setHostName(pifMarketWebSiteConfig.host);

pifMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pifMarketWebSiteConfig.name,
    cdnHost: pifMarketWebSiteConfig.cdnHost,
    pafNodeHost: 'pifmarket-client',
    cmp: false,
  });
});

export const pifMarketCdnApp = new App(pifMarketWebSiteConfig.name).setHostName(pifMarketWebSiteConfig.cdnHost);
