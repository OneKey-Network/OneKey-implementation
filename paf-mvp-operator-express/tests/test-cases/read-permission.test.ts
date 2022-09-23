import { OperatorNode } from '@operator/operator-node';
import { createResponse, MockResponse } from 'node-mocks-http';
import { NextFunction, Response } from 'express';
import { OperatorUtils } from '../utils/operator-utils';

const failCases = [
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('', false),
    description: 'the domain is empty (postRequest)',
    isRedirect: false,
  },
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('unknown domain', false),
    description: 'the domain is unknown (postRequest)',
    isRedirect: false,
  },
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('paf.write-only.com', false),
    description: 'the domain does not have the read permission (postRequest)',
    isRedirect: false,
  },
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('', true),
    description: 'the domain is empty (redirectRequest)',
    isRedirect: true,
  },
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('unknown domain', true),
    description: 'the domain is unknown (redirectRequest)',
    isRedirect: true,
  },
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('paf.write-only.com', true),
    description: 'the domain does not have the read permission (redirectRequest)',
    isRedirect: true,
  },
];
const successCases = [
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('paf.read-only.com', false),
    description: 'the domain is authorized to read (postRequest)',
    isRedirect: false,
  },
  {
    request: OperatorUtils.generateMockGetIdsPrefsRequest('paf.read-write.com', true),
    description: 'the domain is authorized to read (redirectRequest)',
    isRedirect: true,
  },
];

describe('Read permission Handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const operatorNode: OperatorNode = OperatorUtils.buildOperator(OperatorUtils.getUnsuccessfulJsonValidatorMock(), () =>
    Promise.resolve('operatorKey')
  );

  beforeAll(async () => {
    await operatorNode.setup();
  });

  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });

  test.each(failCases)('Should pass an UNAUTHORIZED_OPERATION error to the nextFunction when $description', (input) => {
    operatorNode.checkReadPermission(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: 'UNAUTHORIZED_OPERATION' }));
  });

  test.each(successCases)('Should call the nextFunction with no error when $description', (input) => {
    operatorNode.checkReadPermission(input.request, response, nextFunction);
    expect(nextFunction).toBeCalledWith();
  });
});

describe('GetNewId permission Handler', () => {
  let response: MockResponse<Response>;
  let nextFunction: NextFunction;
  const operatorNode: OperatorNode = OperatorUtils.buildOperator(OperatorUtils.getUnsuccessfulJsonValidatorMock(), () =>
    Promise.resolve('operatorKey')
  );
  beforeEach(() => {
    response = createResponse();
    nextFunction = jest.fn();
  });

  test.each(failCases.filter((req) => !req.isRedirect))(
    'Should pass an UNAUTHORIZED_OPERATION error to the nextFunction when $description',
    (input) => {
      operatorNode.checkNewIdPermission(input.request, response, nextFunction);
      expect(nextFunction).toBeCalledWith(expect.objectContaining({ type: 'UNAUTHORIZED_OPERATION' }));
    }
  );

  test.each(successCases.filter((req) => !req.isRedirect))(
    'Should call the nextFunction with no error when $description',
    (input) => {
      operatorNode.checkNewIdPermission(input.request, response, nextFunction);
      expect(nextFunction).toBeCalledWith();
    }
  );
});
