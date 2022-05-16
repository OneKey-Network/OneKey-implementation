import { anythingButAssets, WebSiteConfig } from '../website-config';
import { App } from '@core/express/express-apps';

const { name, host, cdnHost, pafNodeHost }: WebSiteConfig = {
  name: 'PIF publisher',
  host: 'www.pifdemopublisher.com',
  cdnHost: 'cdn.pifdemopublisher.com',
  pafNodeHost: 'cmp.pifdemopublisher.com',
};

export const pifPublisherWebSiteApp = new App(name).setHostName(host);

pifPublisherWebSiteApp.app.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';

  res.render(view, {
    title: name,
    cdnHost,
    pafNodeHost,
    // True if the CMP is part of the demo page
    cmp: false,
  });
});

export const pifPublisherCdnApp = new App(name).setHostName(cdnHost);