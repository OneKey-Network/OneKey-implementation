import express from 'express';
import { pafPublisherClientNodeConfig, pafPublisherWebSiteConfig } from './config';
import { App } from '@core/express/express-apps';

export const pafPublisherWebSiteApp = new App(pafPublisherWebSiteConfig.name).setHostName(
  pafPublisherWebSiteConfig.host
);

pafPublisherWebSiteApp.app.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pafPublisherWebSiteConfig.name,
    cdnDomain: pafPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pafPublisherClientNodeConfig.host,
    cmp: false,
  });
});

export const pafPublisherCdnApp = new App(pafPublisherWebSiteConfig.name, express()).setHostName(
  pafPublisherWebSiteConfig.cdnHost
);
