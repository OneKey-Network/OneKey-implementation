import { IJsonValidator, JsonValidation } from '@core/validation/json-validator';
import { IdentityConfig, Node } from '@core/express';
import { createRequest, createResponse, MockResponse } from 'node-mocks-http';
import { NextFunction, Response } from 'express';
import { NodeError, NodeErrorType } from '@core/errors';
import { getTimeStampInSec } from '@core/timestamp';
import { encodeBase64, QSParam } from '@core/query-string';

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
const publicKeyProviderAlwaysOKMock = () => Promise.resolve({ verify: () => true });

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
    const node = new Node('MyNode', identity, mockJsonValidatorAlwaysKO, publicKeyProviderAlwaysOKMock);

    node.buildJsonBodyValidatorHandler('jsonSchema')(request, response, nextFunction);

    expect(validationSpy).toBeCalledWith('jsonSchema', payload);

    const expectedError: NodeError = {
      type: NodeErrorType.INVALID_JSON_BODY,
      details: 'error message from validator',
    };
    expect(nextFunction).toBeCalledWith(expectedError);
    expect(response._getStatusCode()).toEqual(400);
  });

  test('should call the nextFunction with no error when request body validation succeeds', () => {
    const mockJsonValidatorAlwaysOK = buildStaticJsonValidator(true);
    const validationSpy = jest.spyOn(mockJsonValidatorAlwaysOK, 'validate');
    const node = new Node('MyNode', identity, mockJsonValidatorAlwaysOK, publicKeyProviderAlwaysOKMock);

    node.buildJsonBodyValidatorHandler('jsonSchema')(request, response, nextFunction);

    expect(validationSpy).toBeCalledWith('jsonSchema', payload);

    expect(nextFunction).toBeCalledWith();
    expect(response._getStatusCode()).toEqual(200);
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
      const node = new Node('MyNode', identity, mockJsonValidatorAlwaysKO, publicKeyProviderAlwaysOKMock);
      const targetUrl = new URL('https://somedomain.com');
      targetUrl.searchParams.set(QSParam.paf, input.queryString);
      const request = createRequest({
        method: 'GET',
        url: targetUrl.toString(),
      });
      node.buildQueryStringValidatorHandler('jsonSchema', false)(request, response, nextFunction);
      const expectedError: NodeError = {
        type: NodeErrorType.INVALID_QUERY_STRING,
        details: input.expected_error,
      };
      expect(nextFunction).toBeCalledWith(expectedError);
      expect(response._getStatusCode()).toEqual(400);
    }
  );

  test('should call the nextFunction with no error when query validation succeeds', () => {
    const mockJsonValidatorAlwaysOK = buildStaticJsonValidator(true);
    const node = new Node('MyNode', identity, mockJsonValidatorAlwaysOK, publicKeyProviderAlwaysOKMock);
    const targetUrl = new URL('https://somedomain.com');
    targetUrl.searchParams.set(QSParam.paf, 'sds');
    const request = createRequest({
      method: 'GET',
      url: targetUrl.toString(),
    });
    node.buildQueryStringValidatorHandler('jsonSchema', false)(request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
    expect(response._getStatusCode()).toEqual(200);
  });
});

describe('Return URL validation handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const mockJsonValidatorAlwaysOK = buildStaticJsonValidator(true);
  let targetUrl: URL;
  const node = new Node('MyNode', identity, mockJsonValidatorAlwaysOK, publicKeyProviderAlwaysOKMock);

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
      node.returnUrlValidationHandler()(request, response, nextFunction);
      expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: NodeErrorType.INVALID_RETURN_URL }));
    }
  );

  test('should call the next function with no error if the provided redirectUrl is valid', () => {
    const queryString = encodeBase64(JSON.stringify({ returnUrl: 'https://www.someurl.com', request: {} }));
    targetUrl.searchParams.set(QSParam.paf, queryString);
    const request = createRequest({
      method: 'GET',
      url: targetUrl.toString(),
    });
    node.returnUrlValidationHandler()(request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
  });
});
