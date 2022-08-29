import { Timestamp } from '@core/model/generated-model';

export interface PublicKeyInfo {
  startTimestampInSec: Timestamp;
  endTimestampInSec?: Timestamp;
  publicKey: string;
}

export const fromIdentityResponse = (identityKey: {
  key: string;
  start: Timestamp;
  end?: Timestamp;
}): PublicKeyInfo => ({
  publicKey: identityKey.key,
  startTimestampInSec: identityKey.start,
  endTimestampInSec: identityKey.end,
});
