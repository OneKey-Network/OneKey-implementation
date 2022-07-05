import { PublicKeyProvider } from '@core/crypto';
import { isValidKey, publicKeyFromString } from '@core/crypto/keys';
import { Log } from '@core/log';
import { GetIdentityResponse } from '@core/model';
import { IECDSA } from 'ecdsa-secp256r1';
/**
 * Utility class used to take an GetIdentityResponse response and turn it into a public key provider that can be used
 * for verification.
 */
export class PublicKeyResolver {
  /**
   * Returns a public key resolver for the identity and time stamp provided.
   * @param log
   * @param identity to use for the public key, the domain parameter of the provider method is ignored
   * @param requiredTimestamp the time stamp for the data that requires the public key
   */
  constructor(
    private readonly log: Log,
    private readonly identity: GetIdentityResponse,
    private readonly requiredTimestamp: number
  ) {}

  /**
   * Core crypto implementation of the public key provider function.
   * @param domain is not used as the identity to return is passed to the constructor
   * @returns
   */
  public readonly provider: PublicKeyProvider = async (domain: string) => {
    let publicKey: IECDSA = null;
    const publicKeyIndex = this.getValidPublicKeyIndex(this.identity);
    if (publicKeyIndex >= 0) {
      try {
        publicKey = await publicKeyFromString(this.identity.keys[publicKeyIndex].key);
      } catch (e) {
        this.log.Warn('PublicKeyResolver', e);
      }
    } else {
      const message = `No valid keys for '${domain}' at timestamp '${
        this.requiredTimestamp
      }' with identity '${JSON.stringify(this.identity)}'`;
      this.log.Warn(message);
    }
    return publicKey;
  };

  /**
   * The index in the keys array of the first valid entry.
   * @param identity whose keys member is inspected
   * @returns
   */
  private getValidPublicKeyIndex(identity: GetIdentityResponse): number {
    for (let index = 0; index < identity.keys.length; index++) {
      const key = identity.keys[index];
      if (
        isValidKey(key) &&
        // The start of the public key must be the same or earlier than the time stamp being validated.
        key.start <= this.requiredTimestamp &&
        // Either the end time stamp is missing or the end is greater than the time stamp being validated.
        (!key.end || key.end > this.requiredTimestamp)
      ) {
        return index;
      }
    }
    return -1;
  }
}
