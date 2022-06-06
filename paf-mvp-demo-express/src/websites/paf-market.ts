import { VHostApp } from '@core/express/express-apps';
import { anythingButAssets, WebSiteConfig } from '../website-config';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PAF advertiser',
  host: 'www.pafmarket.shop',
  cdnHost: 'cdn.pafmarket.shop',
  pafNodeHost: 'paf.pafmarket.shop',
};

export const pafMarketWebSiteApp = new VHostApp(name, host);

pafMarketWebSiteApp.expressApp.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    useCmpUI: true,
  });
});

export const pafMarketCdnApp = new VHostApp(name, cdnHost);
