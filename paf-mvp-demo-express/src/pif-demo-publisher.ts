import express from 'express';
import { pifDemoPublisherConfig } from './config';

export const pifDemoPublisherApp = express();

pifDemoPublisherApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pifDemoPublisherConfig.name,
    cdnDomain: pifDemoPublisherConfig.cdnHost,
  });
});
