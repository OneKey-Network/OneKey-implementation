import { OperatorNode } from '@operator/operator-node';
import { createResponse, MockResponse } from 'node-mocks-http';
import { NextFunction, Response } from 'express';
import { OperatorUtils } from '../utils/operator-utils';
import { NodeErrorType } from '@core/errors';

const failCases = [
  {
    request: OperatorUtils.generateMockGetRequest('', false),
    description: 'the domain is empty (postRequest)',
    isRedirect: false,
  },
  {
    request: OperatorUtils.generateMockGetRequest('unknown domain', false),
    description: 'the domain is unknown (postRequest)',
    isRedirect: false,
  },
  {
    request: OperatorUtils.generateMockGetRequest('paf.write-only.com', false),
    description: 'the domain does not have the read permission (postRequest)',
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
    request: OperatorUtils.generateMockGetRequest('paf.write-only.com', true),
    description: 'the domain does not have the read permission (redirectRequest)',
    isRedirect: true,
  },
];
const successCases = [
  {
    request: OperatorUtils.generateMockGetRequest('paf.read-only.com', false),
    description: 'the domain is authorized to read (postRequest)',
    isRedirect: false,
  },
  {
    request: OperatorUtils.generateMockGetRequest('paf.read-write.com', true),
    description: 'the domain is authorized to read (redirectRequest)',
    isRedirect: true,
  },
];
describe('Read permission Handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const operatorNode: OperatorNode = OperatorUtils.buildOperator(OperatorUtils.getUnsuccessfulJsonValidatorMock(), () =>
    Promise.resolve({ verify: () => true })
  );
  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });

  test.each(failCases)('Should pass an UNAUTHORIZED_OPERATION error to the nextFunction when $description', (input) => {
    operatorNode.buildReadPermissionHandler(input.isRedirect)(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: NodeErrorType.UNAUTHORIZED_OPERATION }));
    expect(response._getStatusCode()).toEqual(input.isRedirect ? 303 : 403);
  });

  test.each(successCases)('Should call the nextFunction with no error when $description', (input) => {
    operatorNode.buildReadPermissionHandler(input.isRedirect)(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
    expect(response._getStatusCode()).toEqual(200);
  });
});
describe('GetNewId permission Handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const operatorNode: OperatorNode = OperatorUtils.buildOperator(OperatorUtils.getUnsuccessfulJsonValidatorMock(), () =>
    Promise.resolve({ verify: () => true })
  );
  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });

  test.each(failCases.filter((req) => !req.isRedirect))(
    'Should pass an UNAUTHORIZED_OPERATION error to the nextFunction when $description',
    (input) => {
      operatorNode.getNewIdPermissionHandler(input.request, response, nextFunction);
      expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: NodeErrorType.UNAUTHORIZED_OPERATION }));
      expect(response._getStatusCode()).toEqual(input.isRedirect ? 303 : 403);
    }
  );

  test.each(successCases.filter((req) => !req.isRedirect))(
    'Should call the nextFunction with no error when $description',
    (input) => {
      operatorNode.getNewIdPermissionHandler(input.request, response, nextFunction);
      expect(nextFunction).toBeCalledWith();
      expect(response._getStatusCode()).toEqual(200);
    }
  );
});
