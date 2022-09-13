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
import { IJsonValidator, JsonValidator } from '@core/validation/json-validator';
import { NodeErrorType } from '@core/errors';
import { ClientBuilder } from '../utils/client-utils';
import { OperatorClient } from '@client/operator-client';
import { UnableToIdentifySignerError } from '@core/express/errors';
import { GetIdsPrefsResponse, RedirectGetIdsPrefsResponse } from '@core/model';
import { createRequest } from 'node-mocks-http';

const specificPrivateKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgiDfb74JY+vBjdEmr
hScLNr4U4Wrp4dKKMm0Z/+h3OnahRANCAARqwDtVwGtTx+zY/5njGZxnxuGePdAq
7fKlkuHOKtwM/AJ6oBTJ7+l3rY5ffNJZkVBB3Pt9H3cHO3Bztmh1h7xR
-----END PRIVATE KEY-----`;

const refererUrl = `https://${ClientBuilder.defaultHost}/some/page`;
const returnUrl = `https://${ClientBuilder.defaultHost}/after/redirect`;

const getRestReadUrl = async (operatorClient: OperatorClient) => {
  const request = createRequest({
    headers: {
      origin: `https://${ClientBuilder.defaultHost}/some/page`,
    },
  });

  // Remove hostname part
  const fullUrl = await operatorClient.getReadRequest(request);
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};

const getRedirectReadUrl = async (operatorClient: OperatorClient, specificReturnUrl = returnUrl) => {
  const request = createRequest({
    headers: {
      referer: refererUrl,
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

    // Verify the redirect URL is the expected one, in case of redirect endpoint
    const verifyRedirectUrl = isRedirect
      ? (response: supertest.Response, url: string) => expect(removeQueryString(getRedirectUrl(response))).toEqual(url)
      : () => {
          // Nothing to verify in case of REST call
        };

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

      const response = await supertest(server).get(url).set('referer', refererUrl).set('Origin', refererUrl);

      assertError(response, 500, NodeErrorType.UNKNOWN_ERROR);

      // Not return URL because was not parsed, fallback to referer
      verifyRedirectUrl(response, refererUrl);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should check query string', async () => {
      const { server, startMock, endMock } = await getContext();

      const response = await supertest(server)
        .get(isRedirect ? '/paf/v1/redirect/get-ids-prefs' : '/paf/v1/ids-prefs')
        .set('referer', refererUrl)
        .set('Origin', refererUrl);

      assertError(response, 400, NodeErrorType.INVALID_QUERY_STRING);

      // Not return URL because was not parsed, fallback to referer
      // checkRedirectUrl(response, refererUrl); // FIXME[errors] should work when catchError handles http responses

      expect(startMock).toHaveBeenCalled();
      // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
    });

    it('should check permissions', async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(defaultPublicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server).get(url).set('referer', refererUrl).set('Origin', refererUrl);

      assertError(response, 403, NodeErrorType.UNAUTHORIZED_OPERATION);

      verifyRedirectUrl(response, returnUrl);

      expect(startMock).toHaveBeenCalled();
      // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
    });

    describe('should check message signature', () => {
      it('for wrong signature', async () => {
        const { server, startMock, endMock } = await getContext();
        const operatorClient = new ClientBuilder()
          .setClientPrivateKey(specificPrivateKey)
          .build(defaultPublicKeyProvider);

        const url = await getReadUrl(operatorClient);

        const response = await supertest(server).get(url);

        assertError(response, 403, NodeErrorType.VERIFICATION_FAILED);

        verifyRedirectUrl(response, returnUrl);

        expect(startMock).toHaveBeenCalled();
        // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
      });

      it('for unknown signer', async () => {
        const { server, startMock, endMock } = await getContext();

        const operatorClient = new ClientBuilder()
          // This client host is allowed to read, but the public key won't be found
          .setClientHost('paf.read-only.com')
          .build(defaultPublicKeyProvider);

        const url = await getReadUrl(operatorClient);

        const response = await supertest(server).get(url);

        assertError(response, 403, NodeErrorType.UNKNOWN_SIGNER);

        verifyRedirectUrl(response, returnUrl);

        expect(startMock).toHaveBeenCalled();
        // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
      });
    });

    it(`should check ${isRedirect ? 'referer' : 'origin'} header`, async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

      const url = await getReadUrl(operatorClient);

      const response = await supertest(server).get(url);

      // FIXME[errors] should be a specific error type
      assertError(response, 403, NodeErrorType.VERIFICATION_FAILED);

      verifyRedirectUrl(response, returnUrl);

      expect(startMock).toHaveBeenCalled();
      // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
    });

    if (isRedirect) {
      it('should check return url', async () => {
        const { server, startMock, endMock } = await getContext();

        const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

        // Set an invalid return url
        const url = await getRedirectReadUrl(operatorClient, 'ftp://ftp-not-permitted.com');

        const response = await supertest(server).get(url).set('referer', refererUrl).set('Origin', refererUrl);

        assertError(response, 400, NodeErrorType.INVALID_RETURN_URL);

        // Notice: redirects to referer
        verifyRedirectUrl(response, refererUrl);

        expect(startMock).toHaveBeenCalled();
        // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
      });

      it('should timeout', async () => {
        const endlessPublicKeyProvider = (host: string): Promise<string> => {
          return new Promise((resolve, reject) => {
            // do not call resolve or reject
          });
        };

        const { server, startMock, endMock } = await getContext(JsonValidator.default(), endlessPublicKeyProvider);

        const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

        // Set an invalid return url
        const url = await getRedirectReadUrl(operatorClient);

        const response = await supertest(server).get(url).set('referer', refererUrl).set('Origin', refererUrl);

        assertError(response, 504, NodeErrorType.RESPONSE_TIMEOUT);

        // Notice: redirects to referer
        verifyRedirectUrl(response, refererUrl);

        expect(startMock).toHaveBeenCalled();
        // expect(endSpan).toHaveBeenCalled(); //FIXME[errors] should work when catchError handles http responses
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
        .set('referer', refererUrl)
        .set('Origin', refererUrl)
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

      verifyRedirectUrl(response, returnUrl);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
});
