import { anythingButAssets, WebSiteConfig } from '../website-config';
import { VHostApp } from '@core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PIF publisher',
  host: 'www.pifdemopublisher.com',
  cdnHost: 'cdn.pifdemopublisher.com',
  pafNodeHost: 'cmp.pifdemopublisher.com',
};

export const pifPublisherWebSiteApp = new VHostApp(name, host);

pifPublisherWebSiteApp.expressApp.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    useCmpUI: true,
  });
});

export const pifPublisherCdnApp = new VHostApp(name, cdnHost);
