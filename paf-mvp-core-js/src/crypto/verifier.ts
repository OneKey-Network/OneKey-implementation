import { PublicKey } from '@core/crypto/keys';
import { IdentifierDefinition, IdsAndPreferencesDefinition, SigningDefinition } from '@core/crypto/signing-definition';
import { Identifier, IdsAndPreferences } from '@core/model/generated-model';

export interface PublicKeyProvider {
  (domain: string): Promise<PublicKey>;
}

/**
 * Verifier class
 */
export class Verifier<T> {
  /**
   * @param publicKeyProvider method to get a public key from a domain name
   * @param definition data or message definition used to extract signature, signing domain, input string
   */
  constructor(protected publicKeyProvider: PublicKeyProvider, protected definition: SigningDefinition<T, T>) {}

  async verifySignature(signedData: T): Promise<boolean> {
    const toVerify = this.definition.getInputString(signedData);
    const signature = this.definition.getSignature(signedData);
    const signingDomain = this.definition.getSignerDomain(signedData);
    const publicKey = await this.publicKeyProvider(signingDomain);

    return publicKey.verify(toVerify, signature);
  }
}

export class IdsAndPreferencesVerifier extends Verifier<IdsAndPreferences> {
  protected idVerifier: Verifier<Identifier>;

  constructor(publicKeyProvider: PublicKeyProvider, protected definition: IdsAndPreferencesDefinition) {
    super(publicKeyProvider, definition);
    this.idVerifier = new Verifier<Identifier>(publicKeyProvider, new IdentifierDefinition());
  }

  async verifySignature(signedData: IdsAndPreferences): Promise<boolean> {
    // Note: preferences are signed using the PAF ID signature => when verifying the preferences' signature, we also first verify the PAF ID signature!
    return (
      (await this.idVerifier.verifySignature(this.definition.getPafId(signedData))) &&
      (await super.verifySignature(signedData))
    );
  }
}
