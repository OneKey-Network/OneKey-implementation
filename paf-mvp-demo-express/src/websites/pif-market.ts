import { App } from '@core/express/express-apps';
import { anythingButAssets, WebSiteConfig } from '../website-config';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PIF advertiser',
  host: 'www.pifmarket.shop',
  cdnHost: 'cdn.pifmarket.shop',
  pafNodeHost: 'paf.pifmarket.shop',
};

export const pifMarketWebSiteApp = new App(name).setHostName(host);

pifMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    // True if the CMP is part of the demo page
    cmp: false,
  });
});

export const pifMarketCdnApp = new App(name).setHostName(cdnHost);
