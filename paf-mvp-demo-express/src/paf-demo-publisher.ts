import express from 'express';
import { pafDemoPublisherConfig } from './config';

export const pafDemoPublisherApp = express();

pafDemoPublisherApp.get('/', (req, res) => {
  const view = 'publisher/index';
  res.render(view, {
    title: pafDemoPublisherConfig.name,
    cdnDomain: pafDemoPublisherConfig.cdnHost,
  });
});
