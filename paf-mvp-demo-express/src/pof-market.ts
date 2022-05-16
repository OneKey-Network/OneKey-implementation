import { WebSiteConfig } from './website-config';
import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';

export const pofMarketWebSiteConfig: WebSiteConfig = {
  name: 'POF advertiser',
  host: 'www.pofmarket.shop',
  cdnHost: 'cdn.pofmarket.shop',
};
export const pofMarketWebSiteApp = new App(pofMarketWebSiteConfig.name).setHostName(pofMarketWebSiteConfig.host);

pofMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pofMarketWebSiteConfig.name,
    pafNodeHost: 'paf.pofmarket.shop',
    cdnHost: pofMarketWebSiteConfig.cdnHost,
    // True if the CMP is part of the demo page
    cmp: true,
  });
});

export const pofMarketCdnApp = new App(pofMarketWebSiteConfig.name).setHostName(pofMarketWebSiteConfig.cdnHost);
