import { IJsonValidator, JsonSchemaType, JsonValidation } from '@onekey/core/validation/json-validator';
import { EndpointConfiguration, IdentityConfig, Node } from '@onekey/core/express';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';
import { NextFunction, Request, Response } from 'express';
import { NodeError } from '@onekey/core/model';
import { getTimeStampInSec } from '@onekey/core/timestamp';
import { encodeBase64, QSParam } from '@onekey/core/query-string';

const buildStaticJsonValidator = (validationResult: boolean): IJsonValidator => {
  const jsonValidation: JsonValidation = {
    isValid: validationResult,
    value: {},
    errors: validationResult ? [] : [new Error('error message from validator')],
  };
  return {
    start: jest.fn(),
    validate: jest.fn(() => jsonValidation),
  };
};
const identity: IdentityConfig = {
  type: 'operator',
  // Name of the OneKey participant
  name: 'Example operator',
  // Current public key
  publicKeys: [
    {
      // Timestamps are expressed in seconds
      startTimestampInSec: getTimeStampInSec(new Date('2022-01-01T10:50:00.000Z')),
      endTimestampInSec: getTimeStampInSec(new Date('2022-12-31T12:00:00.000Z')),
      publicKey: '',
    },
  ],
  // Email address of DPO
  dpoEmailAddress: 'contact@example.onekey.network',
  // URL of a privacy page
  privacyPolicyUrl: new URL('https://example.onekey.network/privacy'),
};
const publicKeyProvider = () => Promise.resolve('myKey');

class MockedNode extends Node {
  constructor(jsonValidator: IJsonValidator) {
    super('fake host', identity, jsonValidator, publicKeyProvider);
  }

  // Assume configuration only contains createSeedRequest schema
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getRequestConfig(req: Request): EndpointConfiguration {
    return { endPointName: 'Fake endpoint', jsonSchemaName: JsonSchemaType.createSeedRequest };
  }
}

describe('Json body validator handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const payload = { some_key: 'some_text' };
  const request = createRequest({
    method: 'POST',
    body: payload,
  });
  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });

  test('should pass an InvalidJsonBody error to the nextFunction if the validation of request body fails', () => {
    const mockJsonValidatorAlwaysKO = buildStaticJsonValidator(false);
    const validationSpy = jest.spyOn(mockJsonValidatorAlwaysKO, 'validate');
    const node = new MockedNode(mockJsonValidatorAlwaysKO);

    node.checkJsonBody(request, response, nextFunction);

    expect(validationSpy).toBeCalledWith(JsonSchemaType.createSeedRequest, payload);

    const expectedError: NodeError = {
      type: 'INVALID_JSON_BODY',
      details: 'error message from validator',
    };
    expect(nextFunction).toBeCalledWith(expectedError);
  });

  test('should call the nextFunction with no error when request body validation succeeds', () => {
    const mockJsonValidatorAlwaysOK = buildStaticJsonValidator(true);
    const validationSpy = jest.spyOn(mockJsonValidatorAlwaysOK, 'validate');
    const node = new MockedNode(mockJsonValidatorAlwaysOK);

    node.checkJsonBody(request, response, nextFunction);

    expect(validationSpy).toBeCalledWith(JsonSchemaType.createSeedRequest, payload);

    expect(nextFunction).toBeCalledWith();
  });
});

describe('Query string validator handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });

  const errorCases = [
    {
      queryString: undefined,
      description: 'undefined',
      expected_error: 'error message from validator',
    },
    {
      queryString: '',
      description: 'empty',
      expected_error: "Received Query string: '' is not a valid Base64 string",
    },
    {
      queryString: 'aGVsbG8gd29yZA==',
      description: 'not a valid request',
      expected_error: 'error message from validator',
    },
  ];
  test.each(errorCases)(
    'should pass an invalid query string error to the nextFunction when the query string is $description',
    (input) => {
      const mockJsonValidatorAlwaysKO = buildStaticJsonValidator(false);
      const node = new Node('MyNode', identity, mockJsonValidatorAlwaysKO, publicKeyProvider);
      const targetUrl = new URL('https://somedomain.com');
      targetUrl.searchParams.set(QSParam.paf, input.queryString);
      const request = createRequest({
        method: 'GET',
        url: targetUrl.toString(),
      });

      node.checkQueryString(request, response, nextFunction);
      const expectedError: NodeError = {
        type: 'INVALID_QUERY_STRING',
        details: input.expected_error,
      };
      expect(nextFunction).toBeCalledWith(expectedError);
    }
  );

  test('should call the nextFunction with no error when query validation succeeds', () => {
    const mockJsonValidatorAlwaysOK = buildStaticJsonValidator(true);
    const node = new Node('MyNode', identity, mockJsonValidatorAlwaysOK, publicKeyProvider);
    const targetUrl = new URL('https://somedomain.com');
    targetUrl.searchParams.set(QSParam.paf, 'sds');
    const request = createRequest({
      method: 'GET',
      url: targetUrl.toString(),
    });

    node.checkQueryString(request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
  });
});

describe('Return URL validation handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const mockJsonValidatorAlwaysOK = buildStaticJsonValidator(true);
  let targetUrl: URL;
  const node = new Node('MyNode', identity, mockJsonValidatorAlwaysOK, publicKeyProvider);

  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
    targetUrl = new URL('https://somedomain.com');
  });
  const cases = [
    {
      returnUrl: '',
      description: 'empty',
    },
    {
      returnUrl: undefined,
      description: 'undefined',
    },
    {
      returnUrl: 'www.someurl.com',
      description: 'not a valid http/https url',
    },
  ];
  test.each(cases)(
    'should pass an invalid return url error to the nextFunction when the redirectUrl is $description',
    (input) => {
      const queryString = encodeBase64(JSON.stringify({ returnUrl: input.returnUrl, request: {} }));
      targetUrl.searchParams.set(QSParam.paf, queryString);
      const request = createRequest({
        method: 'GET',
        url: targetUrl.toString(),
      });
      node.checkReturnUrl(request, response, nextFunction);
      expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: 'INVALID_RETURN_URL' }));
    }
  );

  test('should call the next function with no error if the provided redirectUrl is valid', () => {
    const queryString = encodeBase64(JSON.stringify({ returnUrl: 'https://www.someurl.com', request: {} }));
    targetUrl.searchParams.set(QSParam.paf, queryString);
    const request = createRequest({
      method: 'GET',
      url: targetUrl.toString(),
    });
    node.checkReturnUrl(request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
  });
});
