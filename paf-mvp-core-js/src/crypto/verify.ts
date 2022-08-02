import { PublicKeyProvider } from './verifier';

export interface Signed {
  signature: string;
  signerDomain: string;
  signedString: string;
}

export class SignatureVerifier {
  /**
   * @param publicKeyProvider method to get a public key from a domain name
   * @param definition data or message definition used to extract signature, signing domain, input string
   */
  constructor(protected publicKeyProvider: PublicKeyProvider) {}

  async verifySignature(signed: Signed): Promise<boolean> {
    const publicKey = await this.publicKeyProvider(signed.signerDomain);
    const result = publicKey.verify(signed.signedString, signed.signature);
    return result;
  }
}
