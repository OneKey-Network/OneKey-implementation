import { PrivateKey } from '@core/crypto/keys';
import { SigningDefinition } from '@core/crypto/signing-definition';

/**
 * Class to sign data or a message
 * S = Signed type (used to verify signature)
 * U = Unsigned type (used for getting signature input)
 */
export class Signer<T, U = Partial<T>> {
  /**
   * @param ecdsaPrivateKey the private key that will be used to sign
   * @param definition defines how to get input string for signing
   */
  constructor(private ecdsaPrivateKey: PrivateKey, protected definition: SigningDefinition<T, U>) {}

  sign(inputData: U): string {
    const toSign = this.definition.getInputString(inputData);
    return this.ecdsaPrivateKey.sign(toSign);
  }
}
