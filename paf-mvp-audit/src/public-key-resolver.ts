import { PublicKeyProvider } from '@core/crypto';
import { isValidKey, PublicKey } from '@core/crypto/keys';
import { GetIdentityResponse } from '@core/model';
import ECKey from 'ec-key';
import ECDSA from 'ecdsa-secp256r1';

/**
 * Utility class used to take an GetIdentityResponse response and turn it into a public key provider that can be used
 * for verification.
 */
export class PublicKeyResolver {
  constructor(private readonly identity: GetIdentityResponse) {}

  /**
   * Core crypto implementation of the public key provider function.
   * @param domain is not used as the identity is passed to the constructor
   * @returns
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public readonly provider: PublicKeyProvider = async (domain: string) => {
    const publicKeyIndex = PublicKeyResolver.getValidPublicKeyIndex(this.identity);
    if (publicKeyIndex >= 0) {
      const key = this.identity.keys[publicKeyIndex];
      return <PublicKey>ECDSA.fromJWK(new ECKey(key.key));
    }
    throw `No valid keys for '${domain}' with identity '${JSON.stringify(this.identity)}'`;
  };

  /**
   * The index in the keys array of the first valid entry.
   * @param identity whose keys member is inspected
   * @returns
   */
  private static getValidPublicKeyIndex(identity: GetIdentityResponse): number {
    for (let index = 0; index < identity.keys.length; index++) {
      if (isValidKey(identity.keys[index])) {
        return index;
      }
    }
    return -1;
  }
}
