import { NodeError, NodeErrorType } from '@core/errors';
import request from 'supertest';
import { fromDataToObject, QSParam } from '@core/query-string';
import { RedirectErrorResponse } from '@core/model/model';

export const assertError = (response: request.Response, status: number, type: NodeErrorType) => {
  expect(response.status).toEqual(status);
  const error = response.body as NodeError;
  expect(error.type).toEqual(type);
};

export const assertRedirectError = (response: request.Response, status: number, type: NodeErrorType) => {
  expect(response.status).toEqual(303);
  const redirectUrl = new URL(response.header['location']);
  const data = fromDataToObject<RedirectErrorResponse>(redirectUrl.searchParams.get(QSParam.paf));

  expect(data.code).toEqual(status);
  expect(data.error.type).toEqual(type);
};
