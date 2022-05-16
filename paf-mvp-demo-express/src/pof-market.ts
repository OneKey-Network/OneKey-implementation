import { pofMarketClientNodeConfig, pofMarketWebSiteConfig } from './old-config';
import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';

export const pofMarketWebSiteApp = new App(pofMarketWebSiteConfig.name).setHostName(pofMarketWebSiteConfig.host);

// Both a web server serving web content
pofMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pofMarketWebSiteConfig.name,
    pafNodeHost: pofMarketClientNodeConfig.host,
    cdnHost: pofMarketWebSiteConfig.cdnHost,
    // True if the CMP is part of the demo page
    cmp: true,
  });
});

export const pofMarketCdnApp = new App(pofMarketWebSiteConfig.name).setHostName(pofMarketWebSiteConfig.cdnHost);
