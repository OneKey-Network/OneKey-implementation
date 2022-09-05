import '../helpers/assume-https'; // /!\ Must be imported first
import { assertError } from '../helpers/integration.helpers';
import { Express } from 'express';
import supertest from 'supertest';
import { OperatorUtils } from '../utils/operator-utils';
import { JsonValidator } from '@core/validation/json-validator';
import { NodeErrorType } from '@core/errors';
import { ClientBuilder } from '../utils/client-utils';
import { OperatorClient } from '@client/operator-client';
import { UnableToIdentifySignerError } from '@core/express/errors';
import { GetIdsPrefsResponse } from '@core/model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MockExpressRequest = require('mock-express-request');

const getReadUrl = async (operatorClient: OperatorClient) => {
  const request = new MockExpressRequest({
    headers: {
      origin: `https://${ClientBuilder.defaultHost}/some/page`,
    },
  });

  // Remove hostname part
  const fullUrl = await operatorClient.getReadRequest(request);
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};

const publicKeyProvider = (host: string) => {
  if (host === ClientBuilder.defaultHost) return Promise.resolve(ClientBuilder.defaultPublicKey);

  throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
};

describe('read', () => {
  describe('rest', () => {
    // Note: use real JSON validator
    const operatorNode = OperatorUtils.buildOperator(JsonValidator.default(), publicKeyProvider);

    const server: Express = operatorNode.app.expressApp;

    beforeAll(async () => {
      return operatorNode.start();
    });

    it('should fallback to unknown error in case forgot to start validator', async () => {
      // Note that the operator node is not start()ed
      const uninitializedOperatorNode = OperatorUtils.buildOperator(JsonValidator.default(), publicKeyProvider);
      const server: Express = uninitializedOperatorNode.app.expressApp;

      const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(publicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server).get(url);

      assertError(response, 500, NodeErrorType.UNKNOWN_ERROR);
    });

    it('should check query string', async () => {
      const response = await supertest(server).get('/paf/v1/ids-prefs');

      assertError(response, 400, NodeErrorType.INVALID_QUERY_STRING);
    });

    it('should check permissions', async () => {
      const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(publicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server).get(url);

      assertError(response, 403, NodeErrorType.UNAUTHORIZED_OPERATION);
    });

    describe('should check message signature', () => {
      it('for wrong signature', async () => {
        const operatorClient = new ClientBuilder()
          // Notice different private key, won't match the public key
          .setClientPrivateKey(
            `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiDfb74JY+vBjdEmr
hScLNr4U4Wrp4dKKMm0Z/+h3OnahRANCAARqwDtVwGtTx+zY/5njGZxnxuGePdAq
7fKlkuHOKtwM/AJ6oBTJ7+l3rY5ffNJZkVBB3Pt9H3cHO3Bztmh1h7xR
-----END PRIVATE KEY-----`
          )
          .build(publicKeyProvider);

        const url = await getReadUrl(operatorClient);

        const response = await supertest(server).get(url);

        assertError(response, 403, NodeErrorType.VERIFICATION_FAILED);
      });

      it('for unknown signer', async () => {
        const operatorClient = new ClientBuilder()
          // This client host is allowed to read, but the public key won't be found
          .setClientHost('paf.read-only.com')
          .build(publicKeyProvider);

        const url = await getReadUrl(operatorClient);

        const response = await supertest(server).get(url);

        assertError(response, 403, NodeErrorType.UNKNOWN_SIGNER);
      });
    });

    it('should check origin header', async () => {
      const operatorClient = new ClientBuilder().build(publicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server).get(url);

      // FIXME[errors] should be a specific error type
      assertError(response, 403, NodeErrorType.VERIFICATION_FAILED);
    });

    it('should handle valid request', async () => {
      const operatorClient = new ClientBuilder().build(publicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server).get(url).set('Origin', `https://${ClientBuilder.defaultHost}/some/page`);

      expect(response.status).toEqual(200);
      const body = response.body as GetIdsPrefsResponse;
      expect(body.sender).toEqual(operatorNode.app.hostName);
      expect(body.body.preferences).toEqual(undefined);
      expect(body.body.identifiers.length).toEqual(1);
      expect(body.body.identifiers[0].persisted).toEqual(false);
    });
  });
});
