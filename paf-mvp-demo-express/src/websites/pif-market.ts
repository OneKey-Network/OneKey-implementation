import { VHostApp } from '@core/express/express-apps';
import { anythingButAssets, WebSiteConfig } from '../website-config';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PIF advertiser',
  host: 'www.pifmarket.shop',
  cdnHost: 'cdn.pifmarket.shop',
  pafNodeHost: 'paf.pifmarket.shop',
};

export const pifMarketWebSiteApp = new VHostApp(name, host);

pifMarketWebSiteApp.expressApp.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    useCmpUI: true,
  });
});

export const pifMarketCdnApp = new VHostApp(name, cdnHost);
