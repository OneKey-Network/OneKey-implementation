import express from 'express';
import { pafPublisherClientNodeConfig, pafPublisherWebSiteConfig } from './config';

export const pafPublisherWebSiteApp = express();

pafPublisherWebSiteApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pafPublisherWebSiteConfig.name,
    cdnDomain: pafPublisherWebSiteConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pafPublisherClientNodeConfig.host,
    cmp: false,
  });
});
