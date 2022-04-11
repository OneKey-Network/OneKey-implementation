import express from 'express';
import { addOperatorApi, Permission } from '@operator/operator-api';
import { s2sOptions } from './server-config';
import {
  crtoOneOperatorConfig,
  pafCmpConfig,
  pafMarketConfig,
  pifCmpConfig,
  pifMarketConfig,
  pofCmpConfig,
  pofMarketConfig,
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
};

export const crtoOneOperatorApp = express();

// This host supports the Operator API
addOperatorApi(
  crtoOneOperatorApp,
  crtoOneOperatorConfig.host,
  operatorPrivateConfig.privateKey,
  crtoOneOperatorConfig.name,
  [operatorPrivateConfig.currentPublicKey],
  {
    [pafCmpConfig.host]: [Permission.READ, Permission.WRITE],
    [pifCmpConfig.host]: [Permission.READ, Permission.WRITE],
    [pofCmpConfig.host]: [Permission.READ, Permission.WRITE],
    [portalConfig.host]: [Permission.READ, Permission.WRITE],
    [pafMarketConfig.host]: [Permission.READ],
    [pifMarketConfig.host]: [Permission.READ],
    [pofMarketConfig.host]: [Permission.READ],
  },
  s2sOptions
);
