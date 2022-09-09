import { assertRedirectError, assertRestError, getRedirectResponse } from '../helpers/integration.helpers';
import { Express } from 'express';
import supertest from 'supertest';
import { OperatorUtils } from '../utils/operator-utils';
import { IJsonValidator, JsonValidator } from '@core/validation/json-validator';
import { NodeErrorType } from '@core/errors';
import { ClientBuilder } from '../utils/client-utils';
import { OperatorClient } from '@client/operator-client';
import { UnableToIdentifySignerError } from '@core/express/errors';
import { GetIdsPrefsResponse, RedirectGetIdsPrefsResponse } from '@core/model';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MockExpressRequest = require('mock-express-request');

const getRestReadUrl = async (operatorClient: OperatorClient) => {
  const request = new MockExpressRequest({
    headers: {
      origin: `https://${ClientBuilder.defaultHost}/some/page`,
    },
  });

  // Remove hostname part
  const fullUrl = await operatorClient.getReadRequest(request);
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};

const getRedirectReadUrl = async (operatorClient: OperatorClient) => {
  const currentPage = `https://${ClientBuilder.defaultHost}/some/page`;
  const request = new MockExpressRequest({
    headers: {
      referer: currentPage,
    },
    query: {
      returnUrl: currentPage,
    },
  });

  // Remove hostname part
  const fullUrl = await operatorClient.getReadRedirectResponse(request);
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};

const getReadUrl = (isRedirect: boolean) => (isRedirect ? getRedirectReadUrl : getRestReadUrl);
const assertError = (isRedirect: boolean) => (isRedirect ? assertRedirectError : assertRestError);

const publicKeyProvider = (host: string) => {
  if (host === ClientBuilder.defaultHost) return Promise.resolve(ClientBuilder.defaultPublicKey);

  throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
};

describe('read', () => {
  const originUrl = `https://${ClientBuilder.defaultHost}/some/page`;

  const getContext = async (validator: IJsonValidator = JsonValidator.default()) => {
    const operator = OperatorUtils.buildOperator(validator, publicKeyProvider);

    const startMock = jest.spyOn(operator, 'beginHandling');
    const endMock = jest.spyOn(operator, 'endHandling');
    await operator.setup();

    const server: Express = operator.app.expressApp;

    return { server, operator, startMock, endMock };
  };

  const cases = [
    {
      name: 'rest',
      isRedirect: false,
    },
    {
      name: 'redirect',
      isRedirect: true,
    },
  ];

  describe.each(cases)('$name', (input) => {
    // Note: use real JSON validator

    it('should fallback to unknown error in case of an exception', async () => {
      // Note that the operator node is not start()ed
      const exceptionValidator = {
        start: jest.fn(),
        validate: () => {
          throw 'UnknownException';
        },
      };

      const { server, startMock, endMock } = await getContext(exceptionValidator);

      const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(publicKeyProvider);

      const url = await getReadUrl(input.isRedirect)(operatorClient);

      const response = await supertest(server).get(url).set('referer', originUrl).set('Origin', originUrl);

      assertError(input.isRedirect)(response, 500, NodeErrorType.UNKNOWN_ERROR);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should check query string', async () => {
      const { server, startMock, endMock } = await getContext();

      const response = await supertest(server)
        .get(input.isRedirect ? '/paf/v1/redirect/get-ids-prefs' : '/paf/v1/ids-prefs')
        .set('referer', originUrl)
        .set('Origin', originUrl);

      assertError(input.isRedirect)(response, 400, NodeErrorType.INVALID_QUERY_STRING);

      expect(startMock).toHaveBeenCalled();
      // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
    });

    it('should check permissions', async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(publicKeyProvider);

      const url = await getReadUrl(input.isRedirect)(operatorClient);

      const response = await supertest(server).get(url).set('referer', originUrl).set('Origin', originUrl);

      assertError(input.isRedirect)(response, 403, NodeErrorType.UNAUTHORIZED_OPERATION);

      expect(startMock).toHaveBeenCalled();
      // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
    });

    describe('should check message signature', () => {
      it('for wrong signature', async () => {
        const { server, startMock, endMock } = await getContext();

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

        const url = await getReadUrl(input.isRedirect)(operatorClient);

        const response = await supertest(server).get(url);

        assertError(input.isRedirect)(response, 403, NodeErrorType.VERIFICATION_FAILED);

        expect(startMock).toHaveBeenCalled();
        // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
      });

      it('for unknown signer', async () => {
        const { server, startMock, endMock } = await getContext();

        const operatorClient = new ClientBuilder()
          // This client host is allowed to read, but the public key won't be found
          .setClientHost('paf.read-only.com')
          .build(publicKeyProvider);

        const url = await getReadUrl(input.isRedirect)(operatorClient);

        const response = await supertest(server).get(url);

        assertError(input.isRedirect)(response, 403, NodeErrorType.UNKNOWN_SIGNER);

        expect(startMock).toHaveBeenCalled();
        // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
      });
    });

    it(`should check ${input.isRedirect ? 'referer' : 'origin'} header`, async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().build(publicKeyProvider);

      const url = await getReadUrl(input.isRedirect)(operatorClient);

      const response = await supertest(server).get(url);

      // FIXME[errors] should be a specific error type
      assertError(input.isRedirect)(response, 403, NodeErrorType.VERIFICATION_FAILED);

      expect(startMock).toHaveBeenCalled();
      // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
    });

    it('should handle valid request', async () => {
      const { server, startMock, endMock, operator } = await getContext();

      const operatorClient = new ClientBuilder().build(publicKeyProvider);

      const url = await getReadUrl(input.isRedirect)(operatorClient);

      const request = supertest(server).get(url).set('referer', originUrl).set('Origin', originUrl);

      const response = await request;

      expect(response.status).toEqual(input.isRedirect ? 303 : 200);

      let data: GetIdsPrefsResponse;

      if (input.isRedirect) {
        const payload = getRedirectResponse<RedirectGetIdsPrefsResponse>(response);
        expect(payload.code).toEqual(200);
        expect(payload.error).toBeUndefined();

        data = payload.response;
      } else {
        data = response.body;
      }

      expect(data.sender).toEqual(operator.app.hostName);
      expect(data.body.preferences).toEqual(undefined);
      expect(data.body.identifiers.length).toEqual(1);
      expect(data.body.identifiers[0].persisted).toEqual(false);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
});
