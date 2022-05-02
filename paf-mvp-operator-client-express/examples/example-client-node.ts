import { addClientNodeEndpoints } from '@operator-client/client-node';
import express from 'express';
import { getTimeStampInSec } from '@core/timestamp';

// This is just an example of a basic client node configuration
addClientNodeEndpoints(
  express(),
  {
    name: 'Example Website',
    currentPublicKey: {
      // Timestamps are expressed in seconds
      startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T12:00:00.000Z')),
      endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
      publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEl0278pcupaxUfiqHJ9AG9gVMyIO+
n07PJaNI22v+s7hR1Hkb71De6Ot5Z4JLoZ7aj1xYhFcQJsYkFlXxcBWfRQ==
-----END PUBLIC KEY-----`,
    },
    dpoEmailAddress: 'dpo@examples-website.com',
    privacyPolicyUrl: new URL('https://www.example-website/privacy'),
  },
  {
    // The PAF node host name to receive requests
    hostName: 'paf.example-website.com',
    privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0X8r0PYAm3mq206o
CdMHwZ948ONyVJToeFbLqBDKi7OhRANCAASXTbvyly6lrFR+Kocn0Ab2BUzIg76f
Ts8lo0jba/6zuFHUeRvvUN7o63lngkuhntqPXFiEVxAmxiQWVfFwFZ9F
-----END PRIVATE KEY-----`,
  },
  'example.onekey.network'
);
