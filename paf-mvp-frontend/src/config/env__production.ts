import {cmpConfig} from "../../../paf-mvp-demo-express/src/config";

export const env = {
  isDevelopment: false,
  host: 'https://www.crto-poc-2.com', // TODO: insert cdn domain
  operatorHost: cmpConfig.host,
};
