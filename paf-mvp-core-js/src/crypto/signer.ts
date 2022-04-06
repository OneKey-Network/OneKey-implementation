import { PrivateKey } from '@core/crypto/keys';

export interface SignatureStringBuilder<U> {
  /**
   * How to get input string from unsigned data
   * @param data
   */
  getInputString(data: U): string;
}

/**
 * Class to sign data or a message
 * U = Unsigned type (used for getting signature input)
 */
export class Signer<U> {
  /**
   * @param ecdsaPrivateKey the private key that will be used to sign
   * @param definition defines how to get input string for signing
   */
  constructor(private ecdsaPrivateKey: PrivateKey, protected definition: SignatureStringBuilder<U>) {}

  sign(inputData: U): string {
    const toSign = this.definition.getInputString(inputData);
    return this.ecdsaPrivateKey.sign(toSign);
  }
}
