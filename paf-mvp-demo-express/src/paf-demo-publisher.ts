import express from 'express';
import { cmpConfig, pafDemoPublisherConfig } from './config';

export const pafDemoPublisherApp = express();

pafDemoPublisherApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pafDemoPublisherConfig.name,
    cdnDomain: pafDemoPublisherConfig.cdnHost,
    cmpHost: cmpConfig.host,
  });
});
