import express from 'express';
import { pifPublisherClientNodeConfig, pifPublisherWebSiteConfig } from './config';

export const pifPublisherWebSiteApp = express();

pifPublisherWebSiteApp.get('*', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pifPublisherWebSiteConfig.name,
    cdnDomain: pifPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pifPublisherClientNodeConfig.host,
    cmp: false,
  });
});
