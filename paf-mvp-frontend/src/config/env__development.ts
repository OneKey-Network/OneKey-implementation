import { cmpConfig, publisherConfig } from '../../../paf-mvp-demo-express/src/config';

export const env = {
  isDevelopment: true,
  host: `https://${publisherConfig.cdnHost}`,
  operatorProxyHost: cmpConfig.host,
};
