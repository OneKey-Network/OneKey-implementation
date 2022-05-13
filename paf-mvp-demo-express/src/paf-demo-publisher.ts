import express from 'express';
import { pafCmpConfig, pafDemoPublisherConfig } from './config';

export const pafDemoPublisherApp = express();

pafDemoPublisherApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pafDemoPublisherConfig.name,
    cdnDomain: pafDemoPublisherConfig.cdnHost,
    // Using the CMP backend as a PAF client node
    pafNodeHost: pafCmpConfig.host,
    cmp: true,
  });
});
