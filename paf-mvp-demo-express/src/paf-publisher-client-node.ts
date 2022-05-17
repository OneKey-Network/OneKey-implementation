import express from 'express';
import { crtoOneOperatorConfig, pafPublisherClientNodeConfig, PrivateConfig } from './config';
import { addClientNodeEndpoints } from '@operator-client/client-node';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

// Only exported for generate-examples.ts
export const pafClientNodePrivateConfig: PrivateConfig = {
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
  dpoEmailAddress: 'contact@pafdemopublisher.com',
  privacyPolicyUrl: 'https://www.pafdemopublisher.com/privacy',
};

export const pafPublisherClientNodeApp = express();

addClientNodeEndpoints(
  pafPublisherClientNodeApp,
  {
    name: pafPublisherClientNodeConfig.name,
    currentPublicKey: pafClientNodePrivateConfig.currentPublicKey,
    dpoEmailAddress: pafClientNodePrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pafClientNodePrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pafPublisherClientNodeConfig.host,
    privateKey: pafClientNodePrivateConfig.privateKey,
  },
  crtoOneOperatorConfig.host,
  s2sOptions
);
