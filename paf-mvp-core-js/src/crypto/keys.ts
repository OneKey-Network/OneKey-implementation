import ECDSA from 'ecdsa-secp256r1';
import { Timestamp } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';

// Not provided by ecdsa-secp256r1 unfortunately
export interface PrivateKey {
  sign: (toSign: string) => string;
}

export interface PublicKey {
  verify: (toVerify: string, signature: string) => boolean;
}

export interface PublicKeys {
  [host: string]: PublicKey;
}

/**
 * Return true if this key is valid according to start and end dates
 * @param key
 * @param nowTimestampSeconds
 */
export const isValidKey = (
  key: { start: Timestamp; end?: Timestamp },
  nowTimestampSeconds: number = getTimeStampInSec()
) => key.start <= nowTimestampSeconds && (key.end === undefined || nowTimestampSeconds < key.end);

/**
 * Generate a pair of new (public, private) keys in PEM format
 */
export const generateKeyPair = (): { privateKey: string; publicKey: string } => {
  const privateKey = ECDSA.generateKey();
  return {
    privateKey: privateKey.toPEM(),
    publicKey: privateKey.asPublic().toPEM(),
  };
};
