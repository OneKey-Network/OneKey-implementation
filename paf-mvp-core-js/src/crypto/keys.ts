import ECDSA from 'ecdsa-secp256r1';
import ECKey from 'ec-key';
import { Timestamp } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';
import { PublicKey, PrivateKey } from '@core/crypto/key-interfaces';

/**
 * Needs to support promises for usage in the browser audit module.
 * @param keyString
 * @returns
 */
export const publicKeyFromString = async (keyString: string): Promise<PublicKey> =>
  <PublicKey>await ECDSA.fromJWK(new ECKey(keyString));

/**
 * Only used in Node so no need to support promises.
 * @param keyString
 * @returns
 */
export const privateKeyFromString = (keyString: string): PrivateKey => <PrivateKey>ECDSA.fromJWK(new ECKey(keyString));

/**
 * Return true if this key is valid according to start and end dates
 * @param key
 * @param nowTimestampSeconds
 */
export const isValidKey = (
  key: { start: Timestamp; end?: Timestamp },
  nowTimestampSeconds: number = getTimeStampInSec()
) => key.start <= nowTimestampSeconds && (key.end === undefined || nowTimestampSeconds < key.end);
