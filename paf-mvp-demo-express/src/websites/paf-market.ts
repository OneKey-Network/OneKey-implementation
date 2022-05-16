import { App } from '@core/express/express-apps';
import { anythingButAssets, WebSiteConfig } from '../website-config';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PAF advertiser',
  host: 'www.pafmarket.shop',
  cdnHost: 'cdn.pafmarket.shop',
  pafNodeHost: 'paf.pafmarket.shop',
};

export const pafMarketWebSiteApp = new App(name).setHostName(host);

pafMarketWebSiteApp.app.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    useCmpUI: true,
  });
});

export const pafMarketCdnApp = new App(name).setHostName(cdnHost);
