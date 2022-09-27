import { anythingButAssets, WebSiteConfig } from '../website-config';
import { VHostApp } from '@onekey/core';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'POF advertiser',
  host: 'www.pofmarket.shop',
  cdnHost: 'cdn.pofmarket.shop',
  pafNodeHost: 'paf.pofmarket.shop',
};
export const pofMarketWebSiteApp = new VHostApp(name, host);

pofMarketWebSiteApp.expressApp.get(anythingButAssets, async (req, res) => {
  const view = 'advertiser/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    useCmpUI: true,
  });
});

export const pofMarketCdnApp = new VHostApp(name, cdnHost);
