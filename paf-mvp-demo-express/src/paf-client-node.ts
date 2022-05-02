import express from 'express';
import { crtoOneOperatorConfig, pafCmpConfig, pafDemoPublisherConfig, PrivateConfig } from './config';
import { addClientNodeEndpoints } from '@operator-client/client-node';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';
import { getHttpsOriginFromHostName } from '@core/express/utils';

// Only exported for generate-examples.ts
export const pafCmpPrivateConfig: PrivateConfig = {
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
  dpoEmailAddress: 'contact@www.pafdemopublisher.com',
  privacyPolicyUrl: 'https://www.pafdemopublisher.com/privacy',
};

export const pafCmpApp = express();

// This PAF client node only allows calls from the corresponding publisher's website
const allowedOrigins = [getHttpsOriginFromHostName(pafDemoPublisherConfig.host)];

addClientNodeEndpoints(
  pafCmpApp,
  crtoOneOperatorConfig.host,
  pafCmpConfig.host,
  pafCmpPrivateConfig.privateKey,
  allowedOrigins,
  s2sOptions
);

// Add identity endpoint
addIdentityEndpoint(
  pafCmpApp,
  pafCmpConfig.name,
  pafCmpPrivateConfig.type,
  [pafCmpPrivateConfig.currentPublicKey],
  pafCmpPrivateConfig.dpoEmailAddress,
  new URL(pafCmpPrivateConfig.privacyPolicyUrl)
);
