import { PublicKeyInfo } from '@core/crypto/identity';
import { participantEndpoints } from '@core/endpoints';
import { corsOptionsAcceptAll } from '@core/express/utils';
import cors from 'cors';
import { Express } from 'express';
import { GetIdentityResponseBuilder } from '@core/model/identity-response-builder';

export const addIdentityEndpoint = (app: Express, identity: Identity) => {
  const { name, type, publicKeys, dpoEmailAddress, privacyPolicyUrl } = identity;
  const response = new GetIdentityResponseBuilder(name, type, dpoEmailAddress, privacyPolicyUrl).buildResponse(
    publicKeys
  );

  app.get(participantEndpoints.identity, cors(corsOptionsAcceptAll), (req, res) => {
    res.json(response);
  });
};

export interface Identity {
  name: string;
  publicKeys: PublicKeyInfo[];
  type: 'vendor' | 'operator';
  dpoEmailAddress: string;
  privacyPolicyUrl: URL;
}
