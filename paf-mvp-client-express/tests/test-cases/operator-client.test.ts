import { ClientBuilder } from '../utils/client-builder';
import { UnableToIdentifySignerError } from '@onekey/core/express/errors';
import { createRequest } from 'node-mocks-http';
import { parseUrlString } from '../utils/url-utils';
import { operator } from '@onekey/core/routes';
import { IdsAndPreferences, PostSignPreferencesRequest } from '@onekey/core/model';
import { id, preferences } from '../utils/const';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MockExpressRequest = require('mock-express-request');

const defaultRefererUrl = 'www.read-write.com';
const defaultReturnUrl = 'www.default-return-url.com';

const publicKeyProvider = (host: string) => {
  if (host === ClientBuilder.defaultHost) return Promise.resolve(ClientBuilder.defaultPublicKey);
  throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${host}`);
};
const clientRequest = createRequest({
  headers: {
    origin: defaultRefererUrl,
  },
});
const clientRedirectRequest = createRequest({
  headers: {
    referer: defaultRefererUrl,
  },
  query: {
    returnUrl: defaultReturnUrl,
  },
});
const sampleIdsAndPreferences: IdsAndPreferences = {
  preferences: preferences,
  identifiers: [id],
};
const clientWriteRequest = new MockExpressRequest({
  headers: {
    origin: defaultRefererUrl,
  },
  body: sampleIdsAndPreferences,
});
const clientWriteRedirectRequest = new MockExpressRequest({
  headers: {
    referer: defaultRefererUrl,
  },
  query: {
    returnUrl: defaultReturnUrl,
    message: JSON.stringify(sampleIdsAndPreferences),
  },
});
const samplePostSignPreferencesRequest: PostSignPreferencesRequest = {
  identifiers: sampleIdsAndPreferences.identifiers,
  unsignedPreferences: sampleIdsAndPreferences.preferences,
};
const signPreferencesRequest = new MockExpressRequest({
  headers: {
    origin: 'www.read-write.com',
  },
  body: samplePostSignPreferencesRequest,
});
const clientBuilder = new ClientBuilder();
describe('operator client', () => {
  const operatorClient = clientBuilder.build(publicKeyProvider);
  test('get read request', async () => {
    const url = await operatorClient.getReadRequest(clientRequest);
    const { path, queryParams } = parseUrlString(url);
    expect(queryParams['sender']).toEqual(ClientBuilder.defaultHost);
    expect(queryParams['receiver']).toEqual(clientBuilder.operatorHost);
    expect(queryParams['signature']).toBeTruthy();
    expect(path).toEqual(operator.read.rest);
  });
  test('get write response', async () => {
    const response = await operatorClient.getWriteResponse(clientWriteRequest);
    expect(response.payload.sender).toEqual(ClientBuilder.defaultHost);
    expect(response.payload.receiver).toEqual(clientBuilder.operatorHost);
    expect(response.payload.signature).toBeTruthy();
    expect(response.payload.body).toEqual(sampleIdsAndPreferences);
    expect(parseUrlString(response.url).path).toEqual(operator.write.rest);
  });
  test('get newId response', async () => {
    const url = await operatorClient.getNewIdResponse(clientRequest);
    const { path, queryParams } = parseUrlString(url);
    expect(queryParams['sender']).toEqual(ClientBuilder.defaultHost);
    expect(queryParams['receiver']).toEqual(clientBuilder.operatorHost);
    expect(queryParams['signature']).toBeTruthy();
    expect(path).toEqual(operator.newId.rest);
  });
  test('get delete response', async () => {
    const url = await operatorClient.getDeleteResponse(clientRequest);
    const { path, queryParams } = parseUrlString(url);
    expect(queryParams['sender']).toEqual(ClientBuilder.defaultHost);
    expect(queryParams['receiver']).toEqual(clientBuilder.operatorHost);
    expect(queryParams['signature']).toBeTruthy();
    expect(path).toEqual(operator.delete.rest);
  });
  test('get sign preferences response', async () => {
    const response = await operatorClient.getSignPreferencesResponse(signPreferencesRequest);
    expect(response.version).toEqual(samplePostSignPreferencesRequest.unsignedPreferences.version);
    expect(response.data).toEqual(samplePostSignPreferencesRequest.unsignedPreferences.data);
    expect(response.source.domain).toEqual(ClientBuilder.defaultHost);
    expect(response.source.signature).toBeTruthy();
  });
  test('get verify 3pc response', () => {
    const url = operatorClient.getVerify3PCResponse();
    const path = parseUrlString(url).path;
    expect(path).toEqual(operator.verify3PC.rest);
  });
  test('get read redirect request', async () => {
    const url = await operatorClient.getReadRedirectResponse(clientRedirectRequest);
    const { path, queryParams } = parseUrlString(url);
    expect(path).toEqual(operator.read.redirect);
    expect(queryParams['returnUrl']).toEqual(defaultReturnUrl);
    expect(queryParams['request']['sender']).toEqual(ClientBuilder.defaultHost);
    expect(queryParams['request']['receiver']).toEqual(clientBuilder.operatorHost);
    expect(queryParams['request']['signature']).toBeTruthy();
  });
  test('get delete redirect response', async () => {
    const url = await operatorClient.getDeleteRedirectResponse(clientRedirectRequest);
    const { path, queryParams } = parseUrlString(url);
    expect(path).toEqual(operator.delete.redirect);
    expect(queryParams['request']['sender']).toEqual(ClientBuilder.defaultHost);
    expect(queryParams['request']['receiver']).toEqual(clientBuilder.operatorHost);
    expect(queryParams['request']['signature']).toBeTruthy();
    expect(queryParams['returnUrl']).toEqual(defaultReturnUrl);
  });
  test('get write redirect response', async () => {
    const url = await operatorClient.getWriteRedirectResponse(clientWriteRedirectRequest);
    const { path, queryParams } = parseUrlString(url);
    expect(path).toEqual(operator.write.redirect);
    expect(queryParams['returnUrl']).toEqual(defaultReturnUrl);
    expect(queryParams['request']['body']).toEqual(sampleIdsAndPreferences);
    expect(queryParams['request']['sender']).toEqual(ClientBuilder.defaultHost);
    expect(queryParams['request']['receiver']).toEqual(clientBuilder.operatorHost);
    expect(queryParams['request']['signature']).toBeTruthy();
  });
});
