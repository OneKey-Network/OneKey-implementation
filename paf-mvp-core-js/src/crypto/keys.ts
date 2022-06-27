import ECDSA from 'ecdsa-secp256r1';
import { IECDSA } from 'ecdsa-secp256r1';
import ECKey from 'ec-key'; // Used to convert PEM keys to JWK format for use with ECDSA.
import { Timestamp } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';

/**
 * Needs to support promises for usage in the browser audit module.
 * @param pem format public key
 * @returns IECDSA instance ready for verification
 */
export const publicKeyFromString = async (pem: string): Promise<IECDSA> =>
  <IECDSA>await ECDSA.fromJWK(new ECKey(pem).toJSON());

/**
 * Only used in Node so no need to support promises.
 * @param pem format private key
 * @returns IECDSA instance ready for signing
 */
export const privateKeyFromString = (pem: string): IECDSA => <IECDSA>ECDSA.fromJWK(new ECKey(pem).toJSON());

/**
 * Return true if this key is valid according to start and end dates
 * @param key
 * @param nowTimestampSeconds
 */
export const isValidKey = (
  key: { start: Timestamp; end?: Timestamp },
  nowTimestampSeconds: number = getTimeStampInSec()
) => key.start <= nowTimestampSeconds && (key.end === undefined || nowTimestampSeconds < key.end);
