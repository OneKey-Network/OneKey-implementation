import { pafMarketClientNodeConfig, PrivateConfig } from './old-config';
import { ClientNode } from '@operator-client/client-node';
import { s2sOptions } from './demo-utils';
import { getTimeStampInSec } from '@core/timestamp';

const pafMarketClientNodePrivateConfig: PrivateConfig = {
  type: 'vendor',
  currentPublicKey: {
    startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T12:00:00.000Z')),
    endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
    publicKey: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEUnarwp0gUZgjb9fsYNLcNrddNKV5
h4/WfMRMVh3HIqojt3LIsvUQig1rm9ZkcNx+IHZVhDM+hso2sXlGjF9xOQ==
-----END PUBLIC KEY-----`,
  },
  privateKey: `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab
cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH
j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5
-----END PRIVATE KEY-----`,
  dpoEmailAddress: 'contact@www.pafmarket.shop',
  privacyPolicyUrl: 'https://www.pafmarket.shop/privacy',
};

export const pafMarketClientNode = new ClientNode(
  {
    name: pafMarketClientNodeConfig.name,
    publicKeys: [pafMarketClientNodePrivateConfig.currentPublicKey],
    dpoEmailAddress: pafMarketClientNodePrivateConfig.dpoEmailAddress,
    privacyPolicyUrl: new URL(pafMarketClientNodePrivateConfig.privacyPolicyUrl),
  },
  {
    hostName: pafMarketClientNodeConfig.host,
    privateKey: pafMarketClientNodePrivateConfig.privateKey,
  },
  'crto-poc-1.onekey.network',
  s2sOptions
);
