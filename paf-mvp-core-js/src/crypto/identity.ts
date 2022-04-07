import { Timestamp } from '@core/model/generated-model';

export interface KeyInfo {
  startTimestampInSec: Timestamp;
  endTimestampInSec?: Timestamp;
  publicKey: string;
}

export const fromIdentityResponse = (identityKey: { key: string; start: Timestamp; end?: Timestamp }): KeyInfo => ({
  publicKey: identityKey.key,
  startTimestampInSec: identityKey.start,
  endTimestampInSec: identityKey.end,
});
