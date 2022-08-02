import { Request } from 'express';
import { RestGetIdsPrefsRequest } from '@core/model/requests';
import { decodeBase64, QSParam } from '@core/query-string';

export interface Try<T> {
  isValid: boolean;
  value?: T;
  error?: Error;
}

export function deserializeRestGetIdsPrefsRequest(req: Request): Try<RestGetIdsPrefsRequest> {
  const raw = req.query[QSParam.paf] as string;
  const json = JSON.parse(decodeBase64(raw));

  // Here is the good place to use json schema

  const request = new RestGetIdsPrefsRequest();

  // On the long run, a little libray would do the job
  // On the mid run hasOwnProperty can be used if we adjust the linter.

  // for (var key in json) {
  //     if (request.hasOwnProperty(key)) {
  //         (request as any)[key] = json[key];
  //     }
  // }
  request.sender = json['sender'];
  request.receiver = json['receiver'];
  request.timestamp = json['timestamp'];
  request.signature = json['signature'];
  request.origin = req.headers['origin'];

  return { isValid: true, value: request };
}
