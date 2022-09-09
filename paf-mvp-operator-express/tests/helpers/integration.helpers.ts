import { NodeError, NodeErrorType } from '@core/errors';
import request from 'supertest';

export const assertError = (response: request.Response, status: number, type: NodeErrorType) => {
  expect(response.status).toEqual(status);
  const error = response.body as NodeError;
  expect(error.type).toEqual(type);
};
