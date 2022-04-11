import { pafCmpConfig } from '../../../paf-mvp-demo-express/src/config';

export const env = {
  isDevelopment: true,
  host: 'http://localhost:3000',
  operatorProxyHost: pafCmpConfig.host,
};
