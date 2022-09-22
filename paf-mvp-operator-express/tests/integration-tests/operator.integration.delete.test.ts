import { Express } from 'express';
import supertest from 'supertest';
import { OperatorUtils } from '../utils/operator-utils';
import { IJsonValidator, JsonValidator } from '@core/validation/json-validator';
import { ClientBuilder } from '../utils/client-utils';
import { OperatorClient } from '@client/operator-client';
import { UnableToIdentifySignerError } from '@core/express/errors';
import { DeleteIdsPrefsResponse, RedirectDeleteIdsPrefsResponse } from '@core/model';
import {
  assertRedirectError,
  assertRestError,
  getRedirectResponse,
  getRedirectUrl,
  removeQueryString,
} from '../helpers/integration.helpers';
import { defaultRefererUrl, defaultReturnUrl, randomPrivateKey } from '../utils/constants';
import { createRequest } from 'node-mocks-http';

const getDeleteRequestUrl = async (operatorClient: OperatorClient) => {
  const request = createRequest({
    headers: {
      origin: defaultRefererUrl,
    },
  });
  const fullUrl = await operatorClient.getDeleteResponse(request);
  // Remove hostname part
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};
const getRedirectDeleteUrl = async (operatorClient: OperatorClient, returnUrl = defaultReturnUrl) => {
  const request = createRequest({
    headers: {
      referer: defaultRefererUrl,
    },
    query: {
      returnUrl: returnUrl,
    },
  });
  const deleteUrl = await operatorClient.getDeleteRedirectResponse(request);
  return deleteUrl.replace(/^https?:\/\/[^/]+/i, '');
};
const publicKeyProvider = (host: string) => {
  if (host === ClientBuilder.defaultHost) return Promise.resolve(ClientBuilder.defaultPublicKey);

  throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
};
describe('delete', () => {
  const getContext = async (
    validator: IJsonValidator = JsonValidator.default(),
    specificPublicKeyProvider = publicKeyProvider
  ) => {
    const operator = OperatorUtils.buildOperator(validator, specificPublicKeyProvider);

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
    const isRedirect = input.isRedirect;
    const getDeleteUrl = isRedirect ? getRedirectDeleteUrl : getDeleteRequestUrl;
    const assertError = isRedirect ? assertRedirectError : assertRestError;
    let response = undefined;
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

      const url = await getDeleteUrl(operatorClient);

      const request = isRedirect ? supertest(server).get(url) : supertest(server).delete(url);

      response = await request.set('referer', defaultRefererUrl).set('Origin', defaultRefererUrl);

      assertError(response, 500, 'UNKNOWN_ERROR');
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
      }
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should check query string', async () => {
      const { server, startMock, endMock } = await getContext();

      const response = isRedirect
        ? await supertest(server)
            .get('/paf/v1/redirect/delete-ids-prefs')
            .set('referer', defaultRefererUrl)
            .set('Origin', defaultRefererUrl)
        : await supertest(server).delete('/paf/v1/ids-prefs');

      assertError(response, 400, 'INVALID_QUERY_STRING');
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
      }
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should check permissions', async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().setClientHost('paf.read-only.com').build(publicKeyProvider);

      const url = await getDeleteUrl(operatorClient);
      const request = isRedirect ? supertest(server).get(url) : supertest(server).delete(url);

      response = await request.set('referer', defaultRefererUrl).set('Origin', defaultRefererUrl);

      assertError(response, 403, 'UNAUTHORIZED_OPERATION');
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
      }
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    describe('should check message signature', () => {
      it('for wrong signature', async () => {
        const { server, startMock, endMock } = await getContext();
        const operatorClient = new ClientBuilder().setClientPrivateKey(randomPrivateKey).build(publicKeyProvider);
        const url = await getDeleteUrl(operatorClient);
        const request = isRedirect ? supertest(server).get(url) : supertest(server).delete(url);

        response = await request.set('referer', defaultRefererUrl).set('Origin', defaultRefererUrl);
        assertError(response, 403, 'VERIFICATION_FAILED');
        if (isRedirect) {
          expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
        }
        expect(startMock).toHaveBeenCalled();
        expect(endMock).toHaveBeenCalled();
      });

      it('for unknown signer', async () => {
        const { server, startMock, endMock } = await getContext();

        const operatorClient = new ClientBuilder()
          // This client host is allowed to write, but the public key won't be found
          .setClientHost('paf.write-only.com')
          .build(publicKeyProvider);

        const url = await getDeleteUrl(operatorClient);
        const request = isRedirect ? supertest(server).get(url) : supertest(server).delete(url);

        response = await request.set('referer', defaultRefererUrl).set('Origin', defaultRefererUrl);

        assertError(response, 502, 'UNKNOWN_SIGNER');
        if (isRedirect) {
          expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
        }
        expect(startMock).toHaveBeenCalled();
        expect(endMock).toHaveBeenCalled();
      });
    });

    it(`should check ${isRedirect ? 'referer' : 'origin'} header`, async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().build(publicKeyProvider);

      const url = await getDeleteUrl(operatorClient);
      const request = isRedirect ? supertest(server).get(url) : supertest(server).delete(url);

      response = await request;

      assertRestError(response, 403, 'VERIFICATION_FAILED');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    if (isRedirect) {
      it('should check return url', async () => {
        const { server, startMock, endMock } = await getContext();

        const operatorClient = new ClientBuilder().build(publicKeyProvider);

        // Set an invalid return url
        const request = supertest(server)
          .get(await getRedirectDeleteUrl(operatorClient, 'ftp://ftp-not-permitted.com'))
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

        const response = await request;

        assertError(response, 400, 'INVALID_RETURN_URL');

        if (isRedirect) {
          expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
        }
        expect(startMock).toHaveBeenCalled();
        expect(endMock).toHaveBeenCalled();
      });

      it('should timeout', async () => {
        const endlessPublicKeyProvider = (host: string): Promise<string> => {
          return new Promise((resolve, reject) => {
            // do not call resolve or reject
          });
        };

        const { server, startMock, endMock } = await getContext(JsonValidator.default(), endlessPublicKeyProvider);

        const operatorClient = new ClientBuilder().build(publicKeyProvider);

        const request = supertest(server)
          .get(await getRedirectDeleteUrl(operatorClient))
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

        const response = await request;

        assertError(response, 503, 'RESPONSE_TIMEOUT');

        if (isRedirect) {
          expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
        }
        expect(startMock).toHaveBeenCalled();
        expect(endMock).toHaveBeenCalled();
      });
    }

    it('should handle valid request', async () => {
      const { server, startMock, endMock, operator } = await getContext();

      const operatorClient = new ClientBuilder().build(publicKeyProvider);

      const url = await getDeleteUrl(operatorClient);
      const request = isRedirect ? supertest(server).get(url) : supertest(server).delete(url);
      response = await request.set('referer', defaultRefererUrl).set('Origin', defaultRefererUrl);

      expect(response.status).toEqual(isRedirect ? 303 : 200);

      let data: DeleteIdsPrefsResponse;
      if (isRedirect) {
        const payload = getRedirectResponse<RedirectDeleteIdsPrefsResponse>(response);
        expect(payload.code).toEqual(200);
        expect(payload.error).toBeUndefined();
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultReturnUrl);
        data = payload.response;
      } else {
        data = response.body;
      }
      expect(data.sender).toEqual(operator.app.hostName);
      const expectedBody = {
        identifiers: [],
        preferences: undefined,
      };

      expect(data.body).toEqual(expectedBody);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
});
