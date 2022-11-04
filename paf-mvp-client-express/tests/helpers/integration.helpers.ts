import { NodeError } from '@onekey/core/model';
import request from 'supertest';

export const getRedirectUrl = (response: request.Response) => {
  return new URL(response.header['location']);
};

export const assertRestError = (response: request.Response, status: number, type: string) => {
  expect(response.status).toEqual(status);
  const error = response.body as NodeError;
  expect(error.type).toEqual(type);
};
