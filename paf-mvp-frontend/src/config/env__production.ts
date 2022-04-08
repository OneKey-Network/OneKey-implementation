import { cmpConfig, pafDemoPublisherConfig } from '../../../paf-mvp-demo-express/src/config';

export const env = {
  isDevelopment: false,
  // FIXME remove host from this config
  host: `https://${pafDemoPublisherConfig.cdnHost}`,
  operatorProxyHost: cmpConfig.host,
};
