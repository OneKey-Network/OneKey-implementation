import express from 'express';
import { pifCmpConfig, pifDemoPublisherConfig } from './config';

export const pifDemoPublisherApp = express();

pifDemoPublisherApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pifDemoPublisherConfig.name,
    cdnDomain: pifDemoPublisherConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pifCmpConfig.host,
    cmp: false,
  });
});
