import { NodeError, NodeErrorType } from '@core/errors';
import request from 'supertest';

export const assertError = (response: request.Response, type: NodeErrorType, status = 400) => {
  expect(response.status).toEqual(status);
  const error = response.body as NodeError;
  expect(error.type).toEqual(type);
};
