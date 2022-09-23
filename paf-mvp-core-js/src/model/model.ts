import { Identifier, NodeError, ResponseCode, Source } from '@core/model';

export const CurrentModelVersion = '0.1';

export type Unsigned<T extends { signature: string }> = Omit<T, 'signature'>;
export type UnsignedSource<T extends { source: Source }> = Omit<T, 'source'> & { source: Unsigned<Source> };

export const isEmptyListOfIds = (ids: (Identifier | undefined)[]) => ids.filter((n) => n !== undefined).length === 0;

export interface RedirectResponse<T> {
  response?: T;
}

export interface RedirectRequest<T> {
  request: T;
  returnUrl: string;
}

export interface PAFNode {
  hostName: string;
  privateKey: string;
}

export interface RedirectErrorResponse {
  code: ResponseCode;
  error: NodeError;
}
