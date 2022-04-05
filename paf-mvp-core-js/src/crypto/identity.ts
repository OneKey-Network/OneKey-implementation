import { Timestamp } from '@core/model/generated-model';
import { getDate } from '@core/timestamp';

export interface KeyInfo {
  start: Date;
  end?: Date;
  publicKey: string;
}

export const fromIdentityResponse = (identityKey: { key: string; start: Timestamp; end?: Timestamp }): KeyInfo => ({
  publicKey: identityKey.key,
  start: getDate(identityKey.start),
  end: identityKey.end && getDate(identityKey.end),
});
