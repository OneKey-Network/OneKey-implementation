import { cmpConfig, pafDemoPublisherConfig } from '../../../paf-mvp-demo-express/src/config';

export const env = {
  isDevelopment: false,
  host: `https://${pafDemoPublisherConfig.cdnHost}`,
  operatorProxyHost: cmpConfig.host,
};
