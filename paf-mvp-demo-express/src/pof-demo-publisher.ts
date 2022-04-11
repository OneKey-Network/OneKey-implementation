import express from 'express';
import { cmpConfig, pofDemoPublisherConfig } from './config';

export const pofDemoPublisherApp = express();

pofDemoPublisherApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pofDemoPublisherConfig.name,
    cdnDomain: pofDemoPublisherConfig.cdnHost,
    cmpHost: cmpConfig.host,
  });
});
