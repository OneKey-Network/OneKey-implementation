import express from 'express';
import { pofPublisherClientNodeConfig, pofPublisherWebSiteConfig } from './config';
import { App } from '@core/express/express-apps';

export const pofPublisherWebSiteApp = new App(pofPublisherWebSiteConfig.name).setHostName(
  pofPublisherWebSiteConfig.host
);

pofPublisherWebSiteApp.app.get('*', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pofPublisherWebSiteConfig.name,
    cdnDomain: pofPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pofPublisherClientNodeConfig.host,
    // True if the CMP is part of the demo page
    cmp: false,
  });
});

export const pofPublisherCdnApp = new App(pofPublisherWebSiteConfig.name, express()).setHostName(
  pofPublisherWebSiteConfig.cdnHost
);
