import { NodeError, NodeErrorType } from '@core/errors';
import request from 'supertest';
import { fromDataToObject, QSParam } from '@core/query-string';
import { RedirectErrorResponse } from '@core/model/model';
import { Error, ResponseCode } from '@core/model';

export const assertRestError = (response: request.Response, status: number, type: NodeErrorType) => {
  expect(response.status).toEqual(status);
  const error = response.body as NodeError;
  expect(error.type).toEqual(type);
};

export const getRedirectResponse = <T extends { code: ResponseCode; error?: Error | NodeError }>(
  response: request.Response
): T => {
  expect(response.status).toEqual(303);
  const redirectUrl = new URL(response.header['location']);
  return fromDataToObject<T>(redirectUrl.searchParams.get(QSParam.paf));
};

export const assertRedirectError = (response: request.Response, status: number, type: NodeErrorType) => {
  const data = getRedirectResponse<RedirectErrorResponse>(response);

  expect(data.code).toEqual(status);
  expect(data.error.type).toEqual(type);
};
