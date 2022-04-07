import express from 'express';
import { cmpConfig, operatorConfig, PrivateConfig, publisherConfig } from './config';
import { addOperatorClientProxyEndpoints } from '@operator-client/operator-client-proxy';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

// Only exported for generate-examples.ts
export const cmpPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-15T10:50:00.000Z')),
    // Notice: no end date
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEl0278pcupaxUfiqHJ9AG9gVMyIO+
n07PJaNI22v+s7hR1Hkb71De6Ot5Z4JLoZ7aj1xYhFcQJsYkFlXxcBWfRQ==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0X8r0PYAm3mq206o
CdMHwZ948ONyVJToeFbLqBDKi7OhRANCAASXTbvyly6lrFR+Kocn0Ab2BUzIg76f
Ts8lo0jba/6zuFHUeRvvUN7o63lngkuhntqPXFiEVxAmxiQWVfFwFZ9F
-----END PRIVATE KEY-----`,
};

export const cmpApp = express();

// This CMP only allows calls from publisher
const allowedOrigins = [`https://${publisherConfig.host}`];

addOperatorClientProxyEndpoints(
  cmpApp,
  operatorConfig.host,
  cmpConfig.host,
  cmpPrivateConfig.privateKey,
  allowedOrigins,
  s2sOptions
);

// Add identity endpoint
addIdentityEndpoint(cmpApp, cmpConfig.name, cmpPrivateConfig.type, [cmpPrivateConfig.currentPublicKey]);
