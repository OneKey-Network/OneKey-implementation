import { Error, fromDataToObject, NodeError, QSParam, RedirectErrorResponse, ResponseCode } from '@onekey/core';
import request from 'supertest';

export const getRedirectUrl = (response: request.Response) => {
  return new URL(response.header['location']);
};

export const removeQueryString = (url: URL) => `${url.protocol}//${url.host}${url.pathname}`;

export const assertRestError = (response: request.Response, status: number, type: string) => {
  expect(response.status).toEqual(status);
  const error = response.body as NodeError;
  expect(error.type).toEqual(type);
};

export const getRedirectResponse = <T extends { code: ResponseCode; error?: Error | NodeError }>(
  response: request.Response
): T => {
  expect(response.status).toEqual(303);

  const redirectUrl = getRedirectUrl(response);
  return fromDataToObject<T>(redirectUrl.searchParams.get(QSParam.paf));
};

export const assertRedirectError = (response: request.Response, status: number, type: string) => {
  const data = getRedirectResponse<RedirectErrorResponse>(response);

  expect(data.code).toEqual(status);
  expect(data.error.type).toEqual(type);
};
