import { pifPublisherClientNodeConfig, pifPublisherWebSiteConfig } from './config';
import { App } from '@core/express/express-apps';

export const pifPublisherWebSiteApp = new App(pifPublisherWebSiteConfig.name).setHostName(
  pifPublisherWebSiteConfig.host
);

pifPublisherWebSiteApp.app.get('*', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pifPublisherWebSiteConfig.name,
    cdnDomain: pifPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pifPublisherClientNodeConfig.host,
    cmp: false,
  });
});

export const pifPublisherCdnApp = new App(pifPublisherWebSiteConfig.name).setHostName(
  pifPublisherWebSiteConfig.cdnHost
);
