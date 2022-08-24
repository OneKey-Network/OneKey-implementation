import { OperatorNode } from '@operator/operator-node';
import { createResponse, MockResponse } from 'node-mocks-http';
import { NextFunction, Response } from 'express';
import { OperatorUtils } from '../utils/operator-utils';
import { NodeErrorType } from '@core/errors';

describe('Write permission Handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const operatorNode: OperatorNode = OperatorUtils.buildOperator(OperatorUtils.getUnsuccessfulJsonValidatorMock(), () =>
    Promise.resolve({ verify: () => true })
  );
  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });
  const failCases = [
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('', false),
      description: 'the domain is empty (postRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('unknown domain', false),
      description: 'the domain is unknown (postRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('paf.read-only.com', false),
      description: 'the domain does not have the write permission (postRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('', true),
      description: 'the domain is empty (redirectRequest)',
      isRedirect: true,
    },
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('unknown domain', true),
      description: 'the domain is unknown (redirectRequest)',
      isRedirect: true,
    },
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('paf.read-only.com', true),
      description: 'the domain does not have the write permission (redirectRequest)',
      isRedirect: true,
    },
  ];

  test.each(failCases)('Should pass an UNAUTHORIZED_OPERATION error to the nextFunction when $description', (input) => {
    operatorNode.buildWritePermissionHandler(input.isRedirect)(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: NodeErrorType.UNAUTHORIZED_OPERATION }));
    expect(response._getStatusCode()).toEqual(input.isRedirect ? 303 : 403);
  });

  const successCases = [
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('paf.write-only.com', false),
      description: 'the domain is authorized to write (postRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockPostIdsPrefRequest('paf.read-write.com', true),
      description: 'the domain is authorized to write (redirectRequest)',
      isRedirect: true,
    },
  ];
  test.each(successCases)('Should call the nextFunction with no error when $description', (input) => {
    operatorNode.buildWritePermissionHandler(input.isRedirect)(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
    expect(response._getStatusCode()).toEqual(200);
  });
});
describe('Delete permission Handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const operatorNode: OperatorNode = OperatorUtils.buildOperator(OperatorUtils.getUnsuccessfulJsonValidatorMock(), () =>
    Promise.resolve({ verify: () => true })
  );
  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });
  const failCases = [
    {
      request: OperatorUtils.generateMockGetRequest('', false),
      description: 'the domain is empty (getRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockGetRequest('unknown domain', false),
      description: 'the domain is unknown (getRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockGetRequest('paf.read-only.com', false),
      description: 'the domain does not have the write permission (getRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockGetRequest('', true),
      description: 'the domain is empty (redirectRequest)',
      isRedirect: true,
    },
    {
      request: OperatorUtils.generateMockGetRequest('unknown domain', true),
      description: 'the domain is unknown (redirectRequest)',
      isRedirect: true,
    },
    {
      request: OperatorUtils.generateMockGetRequest('paf.read-only.com', true),
      description: 'the domain does not have the write permission (redirectRequest)',
      isRedirect: true,
    },
  ];

  test.each(failCases)('Should pass an UNAUTHORIZED_OPERATION error to the nextFunction when $description', (input) => {
    operatorNode.buildDeletePermissionHandler(input.isRedirect)(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: NodeErrorType.UNAUTHORIZED_OPERATION }));
    expect(response._getStatusCode()).toEqual(input.isRedirect ? 303 : 403);
  });

  const successCases = [
    {
      request: OperatorUtils.generateMockGetRequest('paf.write-only.com', false),
      description: 'the domain is authorized to write (getRequest)',
      isRedirect: false,
    },
    {
      request: OperatorUtils.generateMockGetRequest('paf.read-write.com', true),
      description: 'the domain is authorized to write (redirectRequest)',
      isRedirect: true,
    },
  ];
  test.each(successCases)('Should call the nextFunction with no error when $description', (input) => {
    operatorNode.buildDeletePermissionHandler(input.isRedirect)(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
    expect(response._getStatusCode()).toEqual(200);
  });
});
