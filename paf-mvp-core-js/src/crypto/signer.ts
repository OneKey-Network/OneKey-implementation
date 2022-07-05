import { Log } from '@core/log';
import { IECDSA } from 'ecdsa-secp256r1';

export interface SignatureStringBuilder<U> {
  /**
   * How to get input string from unsigned data
   * @param data
   */
  getInputString(data: U): string;
}

export interface ISigner<U> {
  sign(inputData: U): string;
}

/**
 * Class to sign data or a message
 * U = Unsigned type (used for getting signature input)
 */
export class Signer<U> implements ISigner<U> {
  protected logger = new Log('Signer', 'red');

  /**
   * @param ecdsaPrivateKey the private key that will be used to sign
   * @param definition defines how to get input string for signing
   */
  constructor(private ecdsaPrivateKey: IECDSA, protected definition: SignatureStringBuilder<U>) {}

  sign(inputData: U): string {
    this.logger.Debug('Sign', inputData);
    const toSign = this.definition.getInputString(inputData);

    // TODO: There is a failure in the underlying crypto implementation that can return signatures that will
    // subsequently fail validation. The change to resign the signature can be removed when the underlying bug is
    // resolved.
    let signature = this.ecdsaPrivateKey.sign(toSign);
    if (this.ecdsaPrivateKey.verify) {
      while (<boolean>this.ecdsaPrivateKey.verify(toSign, signature) === false) {
        signature = this.ecdsaPrivateKey.sign(toSign);
      }
    }
    return signature;
  }
}
