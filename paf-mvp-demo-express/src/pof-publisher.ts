import express from 'express';
import { pofPublisherClientNodeConfig, pofPublisherWebSiteConfig } from './config';

export const pofPublisherWebSiteApp = express();

pofPublisherWebSiteApp.get('*', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pofPublisherWebSiteConfig.name,
    cdnDomain: pofPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pofPublisherClientNodeConfig.host,
    // True if the CMP is part of the demo page
    cmp: true,
  });
});
