import { assertRestError } from '../helpers/integration.helpers';
import { Express } from 'express';
import supertest from 'supertest';
import { OperatorUtils } from '../utils/operator-utils';
import { IJsonValidator, JsonValidator } from '@onekey/core/validation/json-validator';
import { ClientBuilder } from '../utils/client-utils';
import { OperatorClient } from '@onekey/client-node/operator-client';
import { UnableToIdentifySignerError } from '@onekey/core/express/errors';
import { createRequest } from 'node-mocks-http';
import { defaultRefererUrl, randomPrivateKey } from '../utils/constants';

const getNewIdUrl = async (operatorClient: OperatorClient) => {
  const request = createRequest({
    headers: {
      origin: defaultRefererUrl,
    },
  });

  const fullUrl = await operatorClient.getNewIdResponse(request);
  // Remove hostname part
  return fullUrl.replace(/^https?:\/\/[^/]+/i, '');
};

const defaultPublicKeyProvider = (host: string) => {
  if (host === ClientBuilder.defaultHost) return Promise.resolve(ClientBuilder.defaultPublicKey);

  throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
};

describe('newId', () => {
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

    const url = await getNewIdUrl(operatorClient);

    const response = await supertest(server)
      .get(url)
      .set('referer', defaultRefererUrl)
      .set('Origin', defaultRefererUrl);

    assertRestError(response, 500, 'UNKNOWN_ERROR');

    expect(startMock).toHaveBeenCalled();
    expect(endMock).toHaveBeenCalled();
  });

  it('should check query string', async () => {
    const { server, startMock, endMock } = await getContext();

    const response = await supertest(server)
      .get('/paf/v1/new-id')
      .set('referer', defaultRefererUrl)
      .set('Origin', defaultRefererUrl);

    assertRestError(response, 400, 'INVALID_QUERY_STRING');

    expect(startMock).toHaveBeenCalled();
    expect(endMock).toHaveBeenCalled();
  });

  it('should check permissions', async () => {
    const { server, startMock, endMock } = await getContext();

    const operatorClient = new ClientBuilder().setClientHost('no-permission.com').build(defaultPublicKeyProvider);

    const url = await getNewIdUrl(operatorClient);

    const response = await supertest(server)
      .get(url)
      .set('referer', defaultRefererUrl)
      .set('Origin', defaultRefererUrl);

    assertRestError(response, 403, 'UNAUTHORIZED_OPERATION');

    expect(startMock).toHaveBeenCalled();
    expect(endMock).toHaveBeenCalled();
  });

  describe('should check message signature', () => {
    it('for wrong signature', async () => {
      const { server, startMock, endMock } = await getContext();
      const operatorClient = new ClientBuilder().setClientPrivateKey(randomPrivateKey).build(defaultPublicKeyProvider);

      const url = await getNewIdUrl(operatorClient);

      const response = await supertest(server)
        .get(url)
        .set('referer', defaultRefererUrl)
        .set('Origin', defaultRefererUrl);

      assertRestError(response, 403, 'VERIFICATION_FAILED');

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });

    it('for unknown signer', async () => {
      const { server, startMock, endMock } = await getContext();

      const operatorClient = new ClientBuilder()
        // This client host is allowed to read, but the public key won't be found
        .setClientHost('paf.read-only.com')
        .build(defaultPublicKeyProvider);

      const url = await getNewIdUrl(operatorClient);

      const response = await supertest(server)
        .get(url)
        .set('referer', defaultRefererUrl)
        .set('Origin', defaultRefererUrl);

      assertRestError(response, 502, 'UNKNOWN_SIGNER');

      expect(startMock).toHaveBeenCalled();
      expect(endMock).toHaveBeenCalled();
    });
  });

  it('should check origin header', async () => {
    const { server, startMock, endMock } = await getContext();

    const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

    const url = await getNewIdUrl(operatorClient);

    const response = await supertest(server).get(url);

    assertRestError(response, 403, 'VERIFICATION_FAILED');

    expect(startMock).toHaveBeenCalled();
    expect(endMock).toHaveBeenCalled();
  });

  test('should handle valid request', async () => {
    const { server, startMock, endMock, operator } = await getContext();

    const operatorClient = new ClientBuilder().build(defaultPublicKeyProvider);

    const url = await getNewIdUrl(operatorClient);

    const request = supertest(server).get(url).set('referer', defaultRefererUrl).set('Origin', defaultRefererUrl);

    const response = await request;

    expect(response.status).toEqual(200);

    const data = response.body;

    expect(data.sender).toEqual(operator.app.hostName);
    expect(data.body.identifiers.length).toEqual(1);
    expect(data.body.identifiers[0].persisted).toEqual(false);
    expect(data.body.identifiers[0].value).toBeTruthy();
    expect(startMock).toHaveBeenCalled();
    expect(endMock).toHaveBeenCalled();
  });
});
