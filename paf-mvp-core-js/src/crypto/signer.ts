import { Log } from '../log';
import { ECDSA_NIT_P256Builder, IDSABuilder, IDSASigner, PEM } from './digital-signature';

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
  private signer: IDSASigner;

  /**
   * @param ecdsaPrivateKey the private key that will be used to sign
   * @param definition defines how to get input string for signing
   * @param builder the IDSABuilder
   */
  constructor(
    private ecdsaPrivateKey: PEM,
    protected definition: SignatureStringBuilder<U>,
    builder: IDSABuilder = new ECDSA_NIT_P256Builder()
  ) {
    this.signer = builder.buildSigner(ecdsaPrivateKey);
  }

  async sign(inputData: U): Promise<string> {
    this.logger.Debug('Sign', inputData);
    const toSign = this.definition.getInputString(inputData);
    return this.signer.sign(toSign);
  }
}
