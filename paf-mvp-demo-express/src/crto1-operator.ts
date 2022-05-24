import express from 'express';
import { addOperatorApi, Permission } from '@operator/operator-api';
import { s2sOptions } from './server-config';
import {
  crtoOneOperatorConfig,
  pafMarketClientNodeConfig,
  pafPublisherClientNodeConfig,
  pifMarketClientNodeConfig,
  pifPublisherClientNodeConfig,
  pofMarketClientNodeConfig,
  pofPublisherClientNodeConfig,
  portalConfig,
  PrivateConfig,
} from './config';
import { getTimeStampInSec } from '@core/timestamp';

// Only exported for generate-examples.ts
export const operatorPrivateConfig: PrivateConfig = {
  type: 'operator',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T10:50:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEEiZIRhGxNdfG4l6LuY2Qfjyf60R0
jmcW7W3x9wvlX4YXqJUQKR2c0lveqVDj4hwO0kTZDuNRUhgxk4irwV3fzw==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxK7RQm5KP1g62SQn
oyeE+rrDPJzpZxIyCCTHDvd1TRShRANCAAQSJkhGEbE118biXou5jZB+PJ/rRHSO
ZxbtbfH3C+VfhheolRApHZzSW96pUOPiHA7SRNkO41FSGDGTiKvBXd/P
-----END PRIVATE KEY-----`,
  dpoEmailAddress: 'contact@crto-poc-1.onekey.network',
  privacyPolicyUrl: 'https://crto-poc-1.onekey.network/privacy',
};

export const crtoOneOperatorApp = express();

// This host supports the Operator API
addOperatorApi(
  crtoOneOperatorApp,
  {
    name: crtoOneOperatorConfig.name,
    currentPublicKey: operatorPrivateConfig.currentPublicKey,
    dpoEmailAddress: operatorPrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(operatorPrivateConfig.privacyPolicyUrl),
  },
  crtoOneOperatorConfig.host,
  operatorPrivateConfig.privateKey,
  {
    [pafPublisherClientNodeConfig.host]: [Permission.READ, Permission.WRITE],
    [pifPublisherClientNodeConfig.host]: [Permission.READ, Permission.WRITE],
    [pofPublisherClientNodeConfig.host]: [Permission.READ, Permission.WRITE],
    [portalConfig.host]: [Permission.READ, Permission.WRITE],
    [pafMarketClientNodeConfig.host]: [Permission.READ, Permission.WRITE],
    [pifMarketClientNodeConfig.host]: [Permission.READ, Permission.WRITE],
    [pofMarketClientNodeConfig.host]: [Permission.READ, Permission.WRITE],
  },
  s2sOptions
);
