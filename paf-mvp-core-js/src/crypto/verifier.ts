import { PublicKey } from '@core/crypto/keys';
import { IdentifierDefinition, IdsAndPreferencesDefinition, SigningDefinition } from '@core/crypto/signing-definition';
import { Identifier, IdsAndPreferences, MessageBase } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';
import { UnsignedMessage } from '@core/model/model';

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
  constructor(protected publicKeyProvider: PublicKeyProvider, protected definition: SigningDefinition<T, unknown>) {}

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

export class MessageVerifier<T extends MessageBase, U = UnsignedMessage<T>> extends Verifier<T> {
  /**
   * @param publicKeyProvider
   * @param definition
   * @param messageTTLinSec acceptable time to live for a message to be received
   */
  constructor(publicKeyProvider: PublicKeyProvider, definition: SigningDefinition<T, U>, public messageTTLinSec = 30) {
    super(publicKeyProvider, definition);
  }

  /**
   * Verify both the signature of the message and that its content is appropriate
   * @param message
   * @param senderHost
   * @param receiverHost
   * @param timestampInSec
   */
  async verifySignatureAndContent(
    message: T,
    senderHost: string,
    receiverHost: string,
    timestampInSec = getTimeStampInSec()
  ): Promise<boolean> {
    // Note: verify content first as it is less CPU-consuming
    return (
      this.verifyContent(message, senderHost, receiverHost, timestampInSec) && (await this.verifySignature(message))
    );
  }

  /**
   * Verify that the message contains expected sender and receiver, and that the timestamp is still valid
   * @param message
   * @param senderHost
   * @param receiverHost
   * @param timestampInSec
   * @protected
   */
  verifyContent(message: T, senderHost: string, receiverHost: string, timestampInSec: number): boolean {
    return (
      timestampInSec - message.timestamp < this.messageTTLinSec &&
      message.sender === senderHost &&
      message.receiver === receiverHost
    );
  }
}
