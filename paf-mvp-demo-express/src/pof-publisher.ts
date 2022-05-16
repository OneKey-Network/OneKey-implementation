import { WebSiteConfig } from './website-config';
import { App } from '@core/express/express-apps';
import { anythingButAssets } from './demo-utils';

const pofPublisherWebSiteConfig: WebSiteConfig = {
  name: 'POF publisher',
  host: 'www.pofdemopublisher.com',
  cdnHost: 'cdn.pofdemopublisher.com',
};

export const pofPublisherWebSiteApp = new App(pofPublisherWebSiteConfig.name).setHostName(
  pofPublisherWebSiteConfig.host
);

pofPublisherWebSiteApp.app.get(anythingButAssets, (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pofPublisherWebSiteConfig.name,
    cdnDomain: pofPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: 'cmp.pofdemopublisher.com',
    // True if the CMP is part of the demo page
    cmp: false,
  });
});

export const pofPublisherCdnApp = new App(pofPublisherWebSiteConfig.name).setHostName(
  pofPublisherWebSiteConfig.cdnHost
);
