import { Identifier, Source } from './generated-model';

export const CurrentModelVersion = '0.1';

export type UnsignedMessage<T> = Omit<T, 'signature'>;
export type UnsignedData<T extends { source: Source }> = Omit<T, 'source'> & { source: UnsignedMessage<Source> };

export const isEmptyListOfIds = (ids: (Identifier | undefined)[]) => ids.filter((n) => n !== undefined).length === 0;

export interface RedirectResponse<T> {
  response?: T;
}

export interface RedirectRequest<T> {
  request: T;
}

export interface PAFNode {
  hostName: string;
  privateKey: string;
}
