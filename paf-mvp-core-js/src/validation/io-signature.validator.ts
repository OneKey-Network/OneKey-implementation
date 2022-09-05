import { PublicKeyProvider } from '@core/crypto';
import { IDSABuilder, IDSAVerifier, PEM } from '@core/crypto/digital-signature';
import { IdsPrefsResponse } from '@core/model';
import { IIOSignatureStringBuilder, IOSignatureStringBuilder } from '@core/model/io-signature.service';

/**
 * Service for verifying requests and response of endpoints.
 */
export interface IIO_DSAValidator {
  /**
   *  Verify Ids-and-preferences response.
   */
  verifySignatureForIdAndPrefsResponse(response: IdsPrefsResponse): Promise<boolean>;
}

export class IO_DSAValidator implements IIO_DSAValidator {
  private dsaBuilder: IDSABuilder;
  private publicKeyProvider: PublicKeyProvider;
  private dsaVerifiers: Map<PEM, IDSAVerifier>; // LRU cache to consider for later.
  private stringBuilder: IIOSignatureStringBuilder;

  constructor(
    dsaBuilder: IDSABuilder,
    publicKeyProvider: PublicKeyProvider,
    stringBuilder: IIOSignatureStringBuilder = new IOSignatureStringBuilder()
  ) {
    this.dsaBuilder = dsaBuilder;
    this.publicKeyProvider = publicKeyProvider;
    this.stringBuilder = stringBuilder;
    this.dsaVerifiers = new Map<PEM, IDSAVerifier>();
  }

  async verifySignatureForIdAndPrefsResponse(response: IdsPrefsResponse): Promise<boolean> {
    const publicKey = await this.publicKeyProvider(response.sender);
    const verifier = this.getCachedVerifier(publicKey);
    const signedString = this.stringBuilder.buildStringToSignForIdAndPrefsResponse(response);
    const signature = response.signature;
    const isValid = await verifier.verify(signedString, signature);
    return isValid;
  }

  private getCachedVerifier(publicKey: PEM): IDSAVerifier {
    const alreadyCached = this.dsaVerifiers.get(publicKey);
    if (alreadyCached == undefined) {
      const created = this.dsaBuilder.buildVerifier(publicKey);
      this.dsaVerifiers.set(publicKey, created);
      return created;
    }
    return alreadyCached;
  }
}
