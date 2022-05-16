import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';
import { PublicConfig } from './old-config';

const pafMarketWebSiteConfig: PublicConfig = {
  name: 'PAF advertiser',
  host: 'www.pafmarket.shop',
  cdnHost: 'cdn.pafmarket.shop',
};

export const pafMarketWebSiteApp = new App(pafMarketWebSiteConfig.name).setHostName(pafMarketWebSiteConfig.host);

pafMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: pafMarketWebSiteConfig.name,
    pafNodeHost: 'paf.pafmarket.shop',
    cdnHost: pafMarketWebSiteConfig.cdnHost,
  });
});

export const pafMarketCdnApp = new App(pafMarketWebSiteConfig.name).setHostName(pafMarketWebSiteConfig.cdnHost);
