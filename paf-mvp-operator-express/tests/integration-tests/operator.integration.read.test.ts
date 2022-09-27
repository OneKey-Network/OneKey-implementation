import {
  assertRedirectError,
  assertRestError,
  getRedirectResponse,
  getRedirectUrl,
  removeQueryString,
} from '../helpers/integration.helpers';
import { Express } from 'express';
import supertest from 'supertest';
import { OperatorUtils } from '../utils/operator-utils';
import {
  GetIdsPrefsResponse,
  IJsonValidator,
  JsonValidator,
  RedirectGetIdsPrefsResponse,
  UnableToIdentifySignerError,
} from '@onekey/core';
import { ClientBuilder } from '../utils/client-utils';
import { OperatorClient } from '@onekey/client-node/operator-client';
import { createRequest } from 'node-mocks-http';
import { defaultRefererUrl, defaultReturnUrl, randomPrivateKey } from '../utils/constants';
import { invalidUrls } from '../fixtures/operator-fixtures';

const getRestReadUrl = async (operatorClient: OperatorClient) => {
  const request = createRequest({
    headers: {
      origin: defaultRefererUrl,
    },
  });

  // Remove hostname part
  const fullUrl = await operatorClient.getReadRequest(request);
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};

const getRedirectReadUrl = async (operatorClient: OperatorClient, specificReturnUrl = defaultReturnUrl) => {
  const request = createRequest({
    headers: {
      referer: defaultRefererUrl,
    },
    query: {
      returnUrl: specificReturnUrl,
    },
  });

  // Remove hostname part
  const fullUrl = await operatorClient.getReadRedirectResponse(request);
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};

const defaultPublicKeyProvider = (host: string) => {
  if (host === ClientBuilder.defaultHost) return Promise.resolve(ClientBuilder.defaultPublicKey);

  throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
};

describe('read', () => {
  const getContext = async (
    // Note: use real JSON validator by default
    validator: IJsonValidator = JsonValidator.default(),
    publicKeyProvider = defaultPublicKeyProvider
  ) => {
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
    const isRedirect = input.isRedirect;

    const getReadUrl = isRedirect ? getRedirectReadUrl : getRestReadUrl;
    const assertError = isRedirect ? assertRedirectError : assertRestError;

    it('should fallback to unknown error in case of an exception', async () => {
      // Note that the operator node is not start()ed
      const exceptionValidator = {
        start: jest.fn(),
        validate: () => {
          throw 'UnknownException';
        },
      };

      const { server, startMock, endMock } = await getContext(exceptionValidator);

      const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(defaultPublicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server)
        .get(url)
        .set('referer', defaultRefererUrl)
        .set('Origin', defaultRefererUrl);

      assertError(response, 500, 'UNKNOWN_ERROR');

      // Not return URL because was not parsed, fallback to referer
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
      }

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should check query string', async () => {
      const { server, startMock, endMock } = await getContext();

      const response = await supertest(server)
        .get(isRedirect ? '/paf/v1/redirect/get-ids-prefs' : '/paf/v1/ids-prefs')
        .set('referer', defaultRefererUrl)
        .set('Origin', defaultRefererUrl);

      assertError(response, 400, 'INVALID_QUERY_STRING');

      // Not return URL because was not parsed, fallback to referer
      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
      }

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should check permissions', async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(defaultPublicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server)
        .get(url)
        .set('referer', defaultRefererUrl)
        .set('Origin', defaultRefererUrl);

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
        const operatorClient = new ClientBuilder()
          .setClientPrivateKey(randomPrivateKey)
          .build(defaultPublicKeyProvider);

        const url = await getReadUrl(operatorClient);

        const response = await supertest(server)
          .get(url)
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

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
          // This client host is allowed to read, but the public key won't be found
          .setClientHost('paf.read-only.com')
          .build(defaultPublicKeyProvider);

        const url = await getReadUrl(operatorClient);

        const response = await supertest(server)
          .get(url)
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

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

      const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

      const url = await getReadUrl(operatorClient);

      // Notice no referer and origin are set
      const response = await supertest(server).get(url);

      // Notice: here we can't redirect because we can't trust the return URL, and there is no referer value set
      // So the response will be the same for REST and redirect
      // Notice assertRestError
      assertRestError(response, 403, 'VERIFICATION_FAILED'); // FIXME[errors] should be a specific error type, not VERIFICATION_FAILED
      // Notice no call to verifyRedirectUrl

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    if (isRedirect) {
      it.each(invalidUrls)('should refuse $name as return url', async ({ url }) => {
        const { server, startMock, endMock } = await getContext();

        const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

        // Set an invalid return url
        const operatorUrl = await getRedirectReadUrl(operatorClient, url);

        const response = await supertest(server)
          .get(operatorUrl)
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

        assertError(response, 400, 'INVALID_RETURN_URL');

        // Notice: redirects to referer
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

        const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

        // Set an invalid return url
        const url = await getRedirectReadUrl(operatorClient);

        const response = await supertest(server)
          .get(url)
          .set('referer', defaultRefererUrl)
          .set('Origin', defaultRefererUrl);

        assertError(response, 503, 'RESPONSE_TIMEOUT');

        // Notice: redirects to referer
        if (isRedirect) {
          expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultRefererUrl);
        }

        expect(startMock).toHaveBeenCalled();
        expect(endMock).toHaveBeenCalled();
      });
    }

    const validCases = [
      {
        existingData: undefined,
        name: 'unknown user',
      },
      {
        existingData: {
          paf_preferences:
            '{"version":"0.1","data":{"use_browsing_for_personalization":false},"source":{"domain":"cmp.pifdemopublisher.com","timestamp":1663067569,"signature":"KcD3rJszZUOBSfd2Hngk5TIQ6RN7+zGMjJHQ8FcpNiU+nRWvuy0a2Tp9hvc3/4nQK6Or5th+MntX4zrMSTSRmA=="}}',
          paf_identifiers:
            '[{"version":"0.1","type":"paf_browser_id","value":"cb658b2d-c977-4512-a8ae-9f5306cb087b","source":{"domain":"crto.onekey.network","timestamp":1663067561,"signature":"h0XkwwKGe3kbpGyir0uY/vdeQNuBaoO9S00Rvhtw9QIUa4s+jQhv2XxAmjn1XpsK3AoNi5V+0fErtv/unXT/pw=="}}]',
        },
        name: 'existing user',
      },
    ];

    test.each(validCases)('should handle valid request with $name', async ({ existingData }) => {
      const { server, startMock, endMock, operator } = await getContext();

      const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const request = supertest(server)
        .get(url)
        .set('referer', defaultRefererUrl)
        .set('Origin', defaultRefererUrl)
        .set(
          'Cookie',
          Object.keys(existingData ?? []).map((key) => `${key}=${existingData[key]}`)
        );

      const response = await request;

      expect(response.status).toEqual(isRedirect ? 303 : 200);

      let data: GetIdsPrefsResponse;

      if (isRedirect) {
        const payload = getRedirectResponse<RedirectGetIdsPrefsResponse>(response);
        expect(payload.code).toEqual(200);
        expect(payload.error).toBeUndefined();

        data = payload.response;
      } else {
        data = response.body;
      }

      expect(data.sender).toEqual(operator.app.hostName);

      if (existingData) {
        expect(data.body.preferences.data.use_browsing_for_personalization).toEqual(false);
        expect(data.body.identifiers.length).toEqual(1);
        expect(data.body.identifiers[0].persisted).not.toEqual(false);
      } else {
        expect(data.body.preferences).toEqual(undefined);
        expect(data.body.identifiers.length).toEqual(1);
        expect(data.body.identifiers[0].persisted).toEqual(false);
      }

      if (isRedirect) {
        expect(removeQueryString(getRedirectUrl(response))).toEqual(defaultReturnUrl);
      }

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
});
