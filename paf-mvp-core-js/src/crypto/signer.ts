import { PrivateKey } from '@core/crypto/keys';
import { Log } from '@core/log';
import { PEM } from '@core/crypto/digital-signature';
import ECDSA from 'ecdsa-secp256r1';
import ECKey from 'ec-key';

export interface SignatureStringBuilder<U> {
  /**
   * How to get input string from unsigned data
   * @param data
   */
  getInputString(data: U): string;
}

export interface ISigner<U> {
  sign(inputData: U): Promise<string>;
}

/**
 * Class to sign data or a message
 * U = Unsigned type (used for getting signature input)
 */
export class Signer<U> implements ISigner<U> {
  protected logger = new Log('Signer', 'red');
  private legacyKey: PrivateKey;

  /**
   * @param ecdsaPrivateKey the private key that will be used to sign
   * @param definition defines how to get input string for signing
   */
  constructor(private ecdsaPrivateKey: PEM, protected definition: SignatureStringBuilder<U>) {
    this.legacyKey = this.privateKeyFromString(ecdsaPrivateKey);
  }

  privateKeyFromString(keyString: string): PrivateKey {
    return ECDSA.fromJWK(new ECKey(keyString));
  }

  async sign(inputData: U): Promise<string> {
    this.logger.Debug('Sign', inputData);
    const toSign = this.definition.getInputString(inputData);
    return Promise.resolve(this.legacyKey.sign(toSign));
  }
}
