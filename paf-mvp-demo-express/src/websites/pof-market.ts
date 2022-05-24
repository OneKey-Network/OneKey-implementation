import { anythingButAssets, WebSiteConfig } from '../website-config';
import { App } from '@core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'POF advertiser',
  host: 'www.pofmarket.shop',
  cdnHost: 'cdn.pofmarket.shop',
  pafNodeHost: 'paf.pofmarket.shop',
};
export const pofMarketWebSiteApp = new App(name).setHostName(host);

pofMarketWebSiteApp.expressApp.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
  });
});

export const pofMarketCdnApp = new App(name).setHostName(cdnHost);
