import express from 'express';
import { crtoOneOperatorConfig, pofCmpConfig, pofDemoPublisherConfig, PrivateConfig } from './config';
import { addOperatorClientProxyEndpoints } from '@operator-client/operator-client-proxy';
import { addIdentityEndpoint } from '@core/express/identity-endpoint';
import { s2sOptions } from './server-config';
import { getTimeStampInSec } from '@core/timestamp';

const pofCmpPrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-15T10:50:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE1CAIeic0n0aSLczizA1xzhxDPRBD
EoKX2OO3IeuyAyVAOmcb9Rabk/MRohFL/ay2XJUUf7Jb9weRJH9CuSEYZQ==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIIodhppYa0SJtSzEKntZM5Dr0xh/5xcbk9QRzqvmp1eEoAoGCCqGSM49
AwEHoUQDQgAE1CAIeic0n0aSLczizA1xzhxDPRBDEoKX2OO3IeuyAyVAOmcb9Rab
k/MRohFL/ay2XJUUf7Jb9weRJH9CuSEYZQ==
-----END EC PRIVATE KEY-----`,
};

export const pofCmpApp = express();

// This pof proxy only allows calls from its clients
const allowedOrigins = [`https://${pofDemoPublisherConfig.host}`];

addOperatorClientProxyEndpoints(
  pofCmpApp,
  crtoOneOperatorConfig.host,
  pofCmpConfig.host,
  pofCmpPrivateConfig.privateKey,
  allowedOrigins,
  s2sOptions
);

// Add identity endpoint
addIdentityEndpoint(pofCmpApp, pofCmpConfig.name, pofCmpPrivateConfig.type, [pofCmpPrivateConfig.currentPublicKey]);
