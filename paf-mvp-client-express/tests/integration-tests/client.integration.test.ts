import { parseConfig, VHostApp } from '@onekey/core/express';
import { ClientNode, ClientNodeConfig } from '@onekey/client-node/client-node';
import path from 'path';
import { UnableToIdentifySignerError } from '@onekey/core/express/errors';
import { ClientBuilder } from '../utils/client-builder';
import { IJsonValidator, JsonValidator } from '@onekey/core/validation/json-validator';
import { Express } from 'express';
import supertest from 'supertest';
import { client, operator } from '@onekey/core/routes';
import { assertRestError } from '../helpers/integration.helpers';
import { parseUrlString } from '../utils/url-utils';
import {
  IdsAndPreferences,
  PostSeedRequest,
  PostSeedResponse,
  PostSignPreferencesRequest,
  PostVerifySeedRequest,
  Preferences,
  ProxyPostIdsPrefsResponse,
  RedirectGetIdsPrefsResponse,
} from '@onekey/core/model';
import { id, preferences } from '../utils/const';
import { ResponseSigningDefinition } from '@onekey/core/crypto';
import { encodeBase64 } from '@onekey/core/query-string';
import { getTimeStampInSec } from '@onekey/core/timestamp';
import { Signer } from '@onekey/core/crypto/signer';

const configPath = path.resolve(__dirname, '../config/client-config.json');

const sampleIdsAndPreferences: IdsAndPreferences = {
  preferences: preferences,
  identifiers: [id],
};

describe('client node', () => {
  let clientConfig: ClientNodeConfig = undefined;
  let defaultRefererUrl = undefined;
  let defaultReturnUrl = undefined;
  let publicKeyProvider = undefined;
  let signer = undefined;

  beforeAll(async () => {
    clientConfig = (await parseConfig(configPath)) as ClientNodeConfig;
    defaultRefererUrl = `https://${clientConfig.host}/this/is/the/referer/page`;
    defaultReturnUrl = `https://${clientConfig.host}/this/is/the/return/page`;
    signer = new Signer(clientConfig.currentPrivateKey, new ResponseSigningDefinition());
    publicKeyProvider = (host: string) => {
      if (host === clientConfig.operatorHost) return Promise.resolve(ClientBuilder.defaultPublicKey);
      throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
    };
  });

  const checkQueryParams = (queryParams: { sender: string; receiver: string; signature: string }) => {
    expect(queryParams['sender']).toEqual(clientConfig.host);
    expect(queryParams['receiver']).toEqual(clientConfig.operatorHost);
    expect(queryParams['signature']).toBeTruthy();
  };

  const getContext = async (
    validator: IJsonValidator = JsonValidator.default(),
    specificPublicKeyProvider = publicKeyProvider
  ) => {
    const clientNode = new ClientNode(
      clientConfig,
      validator,
      specificPublicKeyProvider,
      new VHostApp(clientConfig.identity.name, clientConfig.host, false)
    );

    const startMock = jest.spyOn(clientNode, 'beginHandling');
    const endMock = jest.spyOn(clientNode, 'endHandling');
    await clientNode.setup();

    const server: Express = clientNode.app.expressApp;

    return { server, clientNode, startMock, endMock };
  };

  const invalid_domains = [
    {
      description: 'undefined',
      value: undefined,
    },
    {
      description: 'an invalid value',
      value: 'https://www.invalid-domain.com',
    },
  ];
  describe('read', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.read.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server).get(client.read.rest).set('origin', defaultRefererUrl);
      expect(response.status).toEqual(200);
      const { path, queryParams } = parseUrlString(response.text);
      checkQueryParams(queryParams);
      expect(path).toEqual(operator.read.rest);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('write', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).post(client.write.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .post(client.write.rest)
        .type('text/plain')
        .send(JSON.stringify(sampleIdsAndPreferences))
        .set('origin', defaultRefererUrl);

      expect(response.status).toEqual(200);

      const parsedResponse = JSON.parse(response.text) as ProxyPostIdsPrefsResponse;
      const { path } = parseUrlString(parsedResponse.url);
      checkQueryParams(parsedResponse.payload);
      expect(parsedResponse.payload['body']).toEqual(sampleIdsAndPreferences);
      expect(path).toEqual(operator.write.rest);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('verify 3pc', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.verify3PC.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server).get(client.verify3PC.rest).set('origin', defaultRefererUrl);
      expect(response.status).toEqual(200);
      const { path } = parseUrlString(response.text);
      expect(path).toEqual(operator.verify3PC.rest);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('get newId', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.newId.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server).get(client.newId.rest).set('origin', defaultRefererUrl);
      expect(response.status).toEqual(200);
      const { path, queryParams } = parseUrlString(response.text);
      checkQueryParams(queryParams);
      expect(path).toEqual(operator.newId.rest);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('delete', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.delete.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server).get(client.delete.rest).set('origin', defaultRefererUrl);
      expect(response.status).toEqual(200);
      const { path, queryParams } = parseUrlString(response.text);
      checkQueryParams(queryParams);
      expect(path).toEqual(operator.delete.rest);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('redirect read', () => {
    it.each(invalid_domains)('should check referer header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.read.redirect);
      const response = input.value ? await request.set('referer', input.value) : await request;
      assertRestError(response, 400, 'INVALID_REFERER');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it.each(invalid_domains)('should check return url when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.read.redirect).set('referer', defaultRefererUrl);
      const response = input.value ? await request.query({ returnUrl: input.value }) : await request;
      assertRestError(response, 400, 'INVALID_RETURN_URL');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .get(client.read.redirect)
        .query({ returnUrl: defaultReturnUrl })
        .set('referer', defaultRefererUrl);

      expect(response.status).toEqual(200);

      const { path, queryParams } = parseUrlString(response.text);

      checkQueryParams(queryParams.request);
      expect(path).toEqual(operator.read.redirect);
      expect(queryParams.returnUrl).toEqual(defaultReturnUrl);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('redirect write', () => {
    it.each(invalid_domains)('should check referer header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.write.redirect);
      const response = input.value ? await request.set('referer', input.value) : await request;
      assertRestError(response, 400, 'INVALID_REFERER');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it.each(invalid_domains)('should check return url when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.write.redirect).set('referer', defaultRefererUrl);
      const response = input.value ? await request.query({ returnUrl: input.value }) : await request;
      assertRestError(response, 400, 'INVALID_RETURN_URL');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .get(client.write.redirect)
        .query({ returnUrl: defaultReturnUrl, message: JSON.stringify(sampleIdsAndPreferences) })
        .set('referer', defaultRefererUrl);
      expect(response.status).toEqual(200);
      const { path, queryParams } = parseUrlString(response.text);
      checkQueryParams(queryParams.request);
      expect(path).toEqual(operator.write.redirect);
      expect(queryParams.returnUrl).toEqual(defaultReturnUrl);
      expect(queryParams.request.body).toEqual(sampleIdsAndPreferences);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('redirect delete', () => {
    it.each(invalid_domains)('should check referer header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.delete.redirect);
      const response = input.value ? await request.set('referer', input.value) : await request;
      assertRestError(response, 400, 'INVALID_REFERER');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it.each(invalid_domains)('should check return url when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).get(client.delete.redirect).set('referer', defaultRefererUrl);
      const response = input.value ? await request.query({ returnUrl: input.value }) : await request;
      assertRestError(response, 400, 'INVALID_RETURN_URL');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should handle valid request', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .get(client.delete.redirect)
        .query({ returnUrl: defaultReturnUrl })
        .set('referer', defaultRefererUrl);

      expect(response.status).toEqual(200);

      const { path, queryParams } = parseUrlString(response.text);

      checkQueryParams(queryParams.request);
      expect(path).toEqual(operator.delete.redirect);
      expect(queryParams.returnUrl).toEqual(defaultReturnUrl);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('verify read', () => {
    const validClientHost = 'cmp.pafdemopublisher.com';
    const validOperatorHost = 'crto-poc-1.onekey.network';
    const unsignedReadResponseSample = {
      body: sampleIdsAndPreferences,
      sender: validOperatorHost,
      receiver: validClientHost,
      timestamp: getTimeStampInSec(),
    };

    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).post(client.verifyRead.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    const invalid_inputs = [
      {
        description: 'missing body',
        value: {
          code: 200,
          response: {
            sender: validOperatorHost,
            receiver: validClientHost,
            timestamp: getTimeStampInSec(),
            signature: 'some dummy signature',
          },
        },
      },
      {
        description: 'invalid receiver',
        value: {
          code: 200,
          response: {
            body: sampleIdsAndPreferences,
            sender: validOperatorHost,
            receiver: validOperatorHost,
            timestamp: getTimeStampInSec(),
            signature: 'some dummy signature',
          },
        },
      },
      {
        description: 'invalid sender',
        value: {
          code: 200,
          response: {
            body: sampleIdsAndPreferences,
            sender: validClientHost,
            receiver: validClientHost,
            timestamp: getTimeStampInSec(),
            signature: 'some dummy signature',
          },
        },
      },
      {
        description: 'missing timestamp',
        value: {
          code: 200,
          response: {
            body: sampleIdsAndPreferences,
            sender: validOperatorHost,
            receiver: validClientHost,
            signature: 'some dummy signature',
          },
        },
      },
      {
        description: 'wrong signature',
        value: {
          code: 200,
          response: {
            ...unsignedReadResponseSample,
            signature: 'some dummy signature',
          },
        },
      },
    ];
    it.each(invalid_inputs)('should verify $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .post(client.verifyRead.rest)
        .type('text/plain')
        .send(encodeBase64(JSON.stringify(input.value)))
        .set('origin', defaultRefererUrl);
      expect(response.status).toEqual(403);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should handle valid request', async () => {
      const input: RedirectGetIdsPrefsResponse = {
        code: 200,
        response: {
          ...unsignedReadResponseSample,
          signature: await signer.sign(unsignedReadResponseSample),
        },
      };
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .post(client.verifyRead.rest)
        .type('text/plain')
        .send(encodeBase64(JSON.stringify(input)))
        .set('origin', defaultRefererUrl);

      expect(response.status).toEqual(200);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('sign prefs', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).post(client.signPrefs.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should validate received json object', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server).post(client.signPrefs.rest).set('origin', defaultRefererUrl);
      assertRestError(response, 400, 'INVALID_JSON_BODY');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should handle valid request', async () => {
      const input: PostSignPreferencesRequest = {
        identifiers: sampleIdsAndPreferences.identifiers,
        unsignedPreferences: {
          version: sampleIdsAndPreferences.preferences.version,
          data: sampleIdsAndPreferences.preferences.data,
        },
      };
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .post(client.signPrefs.rest)
        .type('text/plain')
        .send(JSON.stringify(input))
        .set('origin', defaultRefererUrl);

      expect(response.status).toEqual(200);
      const signedPrefs = JSON.parse(response.text) as Preferences;
      expect(signedPrefs.version).toEqual(input.unsignedPreferences.version);
      expect(signedPrefs.data).toEqual(input.unsignedPreferences.data);
      expect(signedPrefs.source.domain).toEqual(clientConfig.host);
      expect(signedPrefs.source.signature).toBeTruthy();
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('create seed', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).post(client.createSeed.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
    it('should validate received json object', async () => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server).post(client.createSeed.rest).set('origin', defaultRefererUrl);
      assertRestError(response, 400, 'INVALID_JSON_BODY');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should handle valid request', async () => {
      const input: PostSeedRequest = {
        data: sampleIdsAndPreferences,
        transaction_ids: ['transaction1', 'trancaction2'],
      };
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .post(client.createSeed.rest)
        .type('text/plain')
        .send(JSON.stringify(input))
        .set('origin', defaultRefererUrl);

      expect(response.status).toEqual(200);
      const seed = JSON.parse(response.text) as PostSeedResponse;
      expect(seed.transaction_ids).toEqual(input.transaction_ids);
      expect(seed.publisher).toEqual(clientConfig.host);
      expect(seed.source.domain).toEqual(clientConfig.host);
      expect(seed.source.signature).toBeTruthy();
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
  describe('verify seed', () => {
    it.each(invalid_domains)('should check origin header when it is $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const request = supertest(server).post(client.verifySeed.rest);
      const response = input.value ? await request.set('origin', input.value) : await request;
      assertRestError(response, 400, 'INVALID_ORIGIN');
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    const invalid_inputs = [
      {
        description: 'unknown signer',
        value: {
          idsAndPreferences: sampleIdsAndPreferences,
          seed: {
            version: '0.1',
            publisher: 'some dummy publisher',
            transaction_ids: [],
            source: undefined,
          },
        },
        expected_result: { code: 502, errorType: 'UNKNOWN_SIGNER' },
      },
      {
        description: 'invalid signature',
        value: {
          idsAndPreferences: sampleIdsAndPreferences,
          seed: {
            version: '0.1',
            publisher: 'crto-poc-1.onekey.network',
            transaction_ids: [],
            source: undefined,
          },
        },
        expected_result: { code: 403, errorType: 'VERIFICATION_FAILED' },
      },
    ];
    it.each(invalid_inputs)('should check invalidate request for $description', async (input) => {
      const { server, startMock, endMock } = await getContext();
      const response = await supertest(server)
        .post(client.verifySeed.rest)
        .type('text/plain')
        .send(encodeBase64(JSON.stringify(input.value)))
        .set('origin', defaultRefererUrl);

      assertRestError(response, input.expected_result.code, input.expected_result.errorType);
      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('should handle valid request', async () => {
      const customPublicKeyProvider = (host: string) => {
        return Promise.resolve(ClientBuilder.defaultPublicKey);
      };
      // get a valid seed by calling the createSeed endpoint
      const seedRequest: PostSeedRequest = {
        data: sampleIdsAndPreferences,
        transaction_ids: ['transaction1', 'trancaction2'],
      };
      const { server, startMock, endMock } = await getContext(JsonValidator.default(), customPublicKeyProvider);
      const seedResponse = await supertest(server)
        .post(client.createSeed.rest)
        .type('text/plain')
        .send(JSON.stringify(seedRequest))
        .set('origin', defaultRefererUrl);
      const generatedSeed = JSON.parse(seedResponse.text) as PostSeedResponse;
      const seedSignatureData: PostVerifySeedRequest = {
        idsAndPreferences: sampleIdsAndPreferences,
        seed: generatedSeed,
      };

      //test
      await supertest(server)
        .post(client.verifySeed.rest)
        .type('text/plain')
        .send(encodeBase64(JSON.stringify(seedSignatureData)))
        .set('origin', defaultRefererUrl)
        .expect(204);

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });
});
