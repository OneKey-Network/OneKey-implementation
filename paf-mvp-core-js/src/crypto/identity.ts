import { Timestamp } from '@onekey/core/model';
import { getTimeStampInSec } from '@onekey/core/timestamp';

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
/**
 * Return true if this key is valid according to start and end dates
 * @param key
 * @param nowTimestampSeconds
 */
export const isValidKey = (
  key: { start: Timestamp; end?: Timestamp },
  nowTimestampSeconds: number = getTimeStampInSec()
) => key.start <= nowTimestampSeconds && (key.end === undefined || nowTimestampSeconds < key.end);
