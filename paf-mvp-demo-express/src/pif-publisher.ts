import { WebSiteConfig } from './website-config';
import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';

const pifPublisherWebSiteConfig: WebSiteConfig = {
  name: 'PIF publisher',
  host: 'www.pifdemopublisher.com',
  cdnHost: 'cdn.pifdemopublisher.com',
};

export const pifPublisherWebSiteApp = new App(pifPublisherWebSiteConfig.name).setHostName(
  pifPublisherWebSiteConfig.host
);

pifPublisherWebSiteApp.app.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pifPublisherWebSiteConfig.name,
    cdnDomain: pifPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: 'cmp.pifdemopublisher.com',
    cmp: false,
  });
});

export const pifPublisherCdnApp = new App(pifPublisherWebSiteConfig.name).setHostName(
  pifPublisherWebSiteConfig.cdnHost
);
