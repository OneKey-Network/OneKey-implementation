import express from 'express';
import { pofCmpConfig, pofDemoPublisherConfig } from './config';

export const pofDemoPublisherApp = express();

pofDemoPublisherApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pofDemoPublisherConfig.name,
    cdnDomain: pofDemoPublisherConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pofCmpConfig.host,
    // True if the CMP is part of the demo page
    cmp: true,
  });
});
