import { Express } from 'express';
import supertest from 'supertest';
import { OperatorUtils } from '../utils/operator-utils';
import {
  IdsAndPreferences,
  IJsonValidator,
  JsonValidator,
  PostIdsPrefsResponse,
  RedirectPostIdsPrefsResponse,
  UnableToIdentifySignerError,
} from '@onekey/core';
import { ClientBuilder } from '../utils/client-utils';
import { OperatorClient } from '@onekey/client-node/operator-client';
import {
  assertRedirectError,
  assertRestError,
  getRedirectResponse,
  getRedirectUrl,
  removeQueryString,
} from '../helpers/integration.helpers';
import { defaultRefererUrl, defaultReturnUrl, randomPrivateKey } from '../utils/constants';
import { id, invalidUrls, preferences } from '../fixtures/operator-fixtures';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MockExpressRequest = require('mock-express-request');
const sampleIdsAndPreferences: IdsAndPreferences = {
  preferences: preferences,
  identifiers: [id],
};
const getRestWriteRequest = async (operatorClient: OperatorClient) => {
  const request = new MockExpressRequest({
    headers: {
      origin: defaultRefererUrl,
    },
    body: JSON.stringify(sampleIdsAndPreferences),
  });
  const proxyPostIdsPrefsResponse = await operatorClient.getWriteResponse(request);
  proxyPostIdsPrefsResponse.url = proxyPostIdsPrefsResponse.url.replace(/^https?:\/\/[^/]+/i, '');
  return proxyPostIdsPrefsResponse;
};
const getRedirectWriteUrl = async (operatorClient: OperatorClient, returnUrl = defaultReturnUrl) => {
  const request = new MockExpressRequest({
    headers: {
      referer: defaultRefererUrl,
    },
    query: {
      returnUrl: returnUrl,
      message: JSON.stringify(sampleIdsAndPreferences),
    },
  });
  const postIdsPrefsUrl = await operatorClient.getWriteRedirectResponse(request);
  return postIdsPrefsUrl.replace(/^https?:\/\/[^/]+/i, '');
};
const publicKeyProvider = (host: string) => {
  if (host === ClientBuilder.defaultHost) return Promise.resolve(ClientBuilder.defaultPublicKey);

  throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
};
describe('write', () => {
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
      if (isRedirect) {
        response = await supertest(server)
          .get(await getRedirectWriteUrl(operatorClient))
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);
      } else {
        const writeRequest = await getRestWriteRequest(operatorClient);
        response = await supertest(server)
          .post(writeRequest.url)
          .type('text/plain')
          .send(JSON.stringify(writeRequest.payload));
      }

      assertError(response, 500, 'UNKNOWN_ERROR');
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
      }
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should check payload', async () => {
      const { server, startMock, endMock } = await getContext();

      const response = isRedirect
        ? await supertest(server)
            .get('/paf/v1/redirect/post-ids-prefs')
            .set('referer', defaultRefererUrl)
            .set('Origin', defaultRefererUrl)
        : await supertest(server).post('/paf/v1/ids-prefs');

      assertError(response, 400, isRedirect ? 'INVALID_QUERY_STRING' : 'INVALID_JSON_BODY');
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
      }
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should check permissions', async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().setClientHost('paf.read-only.com').build(publicKeyProvider);

      if (isRedirect) {
        const writeUrl = await getRedirectWriteUrl(operatorClient);
        response = await supertest(server)
          .get(writeUrl)
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);
      } else {
        const writeRequest = await getRestWriteRequest(operatorClient);
        response = await supertest(server)
          .post(writeRequest.url)
          .type('text/plain')
          .send(JSON.stringify(writeRequest.payload));
      }

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
        if (isRedirect) {
          const writeUrl = await getRedirectWriteUrl(operatorClient);
          response = await supertest(server)
            .get(writeUrl)
            .set('referer', defaultRefererUrl)
            .set('Origin', defaultRefererUrl);
        } else {
          const writeRequest = await getRestWriteRequest(operatorClient);
          response = await supertest(server)
            .post(writeRequest.url)
            .type('text/plain')
            .send(JSON.stringify(writeRequest.payload));
        }
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

        if (isRedirect) {
          response = await supertest(server)
            .get(await getRedirectWriteUrl(operatorClient))
            .set('referer', defaultRefererUrl)
            .set('Origin', defaultRefererUrl);
        } else {
          const writeRequest = await getRestWriteRequest(operatorClient);
          response = await supertest(server)
            .post(writeRequest.url)
            .type('text/plain')
            .send(JSON.stringify(writeRequest.payload));
        }

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

      if (isRedirect) {
        response = await supertest(server).get(await getRedirectWriteUrl(operatorClient));
      } else {
        const writeRequest = await getRestWriteRequest(operatorClient);
        response = await supertest(server)
          .post(writeRequest.url)
          .type('text/plain')
          .send(JSON.stringify(writeRequest.payload));
      }

      assertRestError(response, 403, 'VERIFICATION_FAILED');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    if (isRedirect) {
      it.each(invalidUrls)('should refuse $name as return url', async ({ url }) => {
        const { server, startMock, endMock } = await getContext();

        const operatorClient = new ClientBuilder().build(publicKeyProvider);

        // Set an invalid return url
        const operatorUrl = await getRedirectWriteUrl(operatorClient, url);

        const response = await supertest(server)
          .get(operatorUrl)
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

        assertError(response, 400, 'INVALID_RETURN_URL');

        if (isRedirect) {
          expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
        }
        expect(startMock).toHaveBeenCalled();
        expect(endMock).toHaveBeenCalled();
      });

      it('should timeout', async () => {
        const endlessPublicKeyProvider = (): Promise<string> => {
          return new Promise(() => {
            // do not call resolve or reject
          });
        };

        const { server, startMock, endMock } = await getContext(JsonValidator.default(), endlessPublicKeyProvider);

        const operatorClient = new ClientBuilder().build(publicKeyProvider);

        // Set an invalid return url
        const url = await getRedirectWriteUrl(operatorClient);

        const response = await supertest(server)
          .get(url)
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

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

      if (isRedirect) {
        response = await supertest(server)
          .get(await getRedirectWriteUrl(operatorClient))
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);
      } else {
        const writeRequest = await getRestWriteRequest(operatorClient);
        response = await supertest(server)
          .post(writeRequest.url)
          .type('text/plain')
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl)
          .send(JSON.stringify(writeRequest.payload));
      }

      expect(response.status).toEqual(isRedirect ? 303 : 200);

      let data: PostIdsPrefsResponse;

      if (isRedirect) {
        const payload = getRedirectResponse<RedirectPostIdsPrefsResponse>(response);
        expect(payload.code).toEqual(200);
        expect(payload.error).toBeUndefined();
        data = payload.response;
      } else {
        data = response.body;
      }
      expect(data.sender).toEqual(operator.app.hostName);
      expect(data.body).toEqual(sampleIdsAndPreferences);
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultReturnUrl);
      }
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
});
