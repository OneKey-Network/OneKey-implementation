import { anythingButAssets, WebSiteConfig } from '../website-config';
import { App } from '@core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PIF publisher',
  host: 'www.pifdemopublisher.com',
  cdnHost: 'cdn.pifdemopublisher.com',
  pafNodeHost: 'cmp.pifdemopublisher.com',
};

export const pifPublisherWebSiteApp = new App(name).setHostName(host);

pifPublisherWebSiteApp.expressApp.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
  });
});

export const pifPublisherCdnApp = new App(name).setHostName(cdnHost);
