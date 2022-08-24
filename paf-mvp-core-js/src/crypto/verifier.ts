import {
  IdentifierDefinition,
  IdsAndPreferencesDefinition,
  RequestWithContext,
  SigningDefinition,
  UnsignedRequestWithContext,
} from '@core/crypto/signing-definition';
import { Identifier, IdsAndPreferences, MessageBase } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';
import { Unsigned } from '@core/model/model';
import { Log } from '@core/log';
import { PublicKeyProvider } from '@core/crypto/key-store';

/**
 * Verifier class
 */
export class Verifier<T> {
  protected logger = new Log('Verifier', 'blue');

  /**
   * @param publicKeyProvider method to get a public key from a domain name
   * @param definition data or message definition used to extract signature, signing domain, input string
   */
  constructor(protected publicKeyProvider: PublicKeyProvider, protected definition: SigningDefinition<T, unknown>) {}

  async verifySignature(signedData: T): Promise<MessageVerificationResult> {
    const signingDomain = this.definition.getSignerDomain(signedData);
    const result: MessageVerificationResult = { isValid: false, errors: [] };
    try {
      const publicKey = await this.publicKeyProvider(signingDomain);
      const signature = this.definition.getSignature(signedData);
      const toVerify = this.definition.getInputString(signedData);
      result.isValid = publicKey.verify(toVerify, signature);
      if (result.isValid) this.logger.Debug('Verified', signedData);
      else {
        const message = `Verification failed for ${signedData}`;
        this.logger.Error(message);
        result.errors = [new Error(message)];
      }
    } catch (e) {
      result.isValid = false;
      result.errors = [e];
      return result;
    }
    return result;
  }
}

export class IdsAndPreferencesVerifier extends Verifier<IdsAndPreferences> {
  constructor(
    publicKeyProvider: PublicKeyProvider,
    protected definition: IdsAndPreferencesDefinition,
    protected idVerifier = new Verifier<Identifier>(publicKeyProvider, new IdentifierDefinition())
  ) {
    super(publicKeyProvider, definition);
  }

  async verifySignature(signedData: IdsAndPreferences): Promise<MessageVerificationResult> {
    // Note: preferences are signed using the OneKey ID signature => when verifying the preferences' signature, we also first verify the OneKey ID signature!
    const idVerificationResult = await this.idVerifier.verifySignature(this.definition.getPafId(signedData));
    if (!idVerificationResult.isValid) {
      return idVerificationResult;
    }
    return await super.verifySignature(signedData);
  }
}

export interface MessageVerificationResult {
  isValid: boolean;
  errors?: Error[];
}
export abstract class MessageVerifier<T extends MessageBase, R = T, U = Unsigned<T>> extends Verifier<R> {
  /**
   * @param publicKeyProvider
   * @param definition
   * @param messageTTLinSec acceptable time to live for a message to be received
   */
  constructor(publicKeyProvider: PublicKeyProvider, definition: SigningDefinition<R, U>, public messageTTLinSec = 30) {
    super(publicKeyProvider, definition);
  }

  /**
   * Verify that the message contains expected sender and receiver, and that the timestamp is still valid
   * @param message
   * @param senderHost
   * @param receiverHost
   * @param timestampInSec
   * @protected
   */
  verifyContent(
    message: T,
    senderHost: string,
    receiverHost: string,
    timestampInSec: number
  ): MessageVerificationResult {
    const timeSpent = timestampInSec - message.timestamp;
    const result: MessageVerificationResult = { isValid: false, errors: [] };
    result.isValid =
      timeSpent < this.messageTTLinSec && message.sender === senderHost && message.receiver === receiverHost;

    if (result.isValid)
      this.logger.Debug(
        'As expected',
        'time since timestamp',
        timeSpent,
        'sender',
        message.sender,
        'receiver',
        message.receiver
      );
    else {
      result.errors = [new Error('Invalid message content')];
      this.logger.Error(
        'Invalid message content',
        'time since timestamp',
        [timeSpent, this.messageTTLinSec],
        'sender',
        [message.sender, senderHost],
        'receiver',
        [message.receiver, receiverHost]
      );
    }
    return result;
  }

  abstract verifySignatureAndContent(
    request: R,
    senderHost: string,
    receiverHost: string,
    timestampInSec: number
  ): Promise<MessageVerificationResult>;
}

export class RequestVerifier<T extends MessageBase> extends MessageVerifier<
  T,
  RequestWithContext<T>,
  UnsignedRequestWithContext<T>
> {
  /**
   * Verify both the signature of the message and that its content is appropriate
   * @param request
   * @param senderHost
   * @param receiverHost
   * @param timestampInSec
   */
  async verifySignatureAndContent(
    request: RequestWithContext<T>,
    senderHost: string,
    receiverHost: string,
    timestampInSec = getTimeStampInSec()
  ): Promise<MessageVerificationResult> {
    // Note: verify content first as it is less CPU-consuming
    const contentVerification = this.verifyContent(request.request, senderHost, receiverHost, timestampInSec);
    if (!contentVerification.isValid) {
      return contentVerification;
    }
    return await this.verifySignature(request);
  }
}

export class ResponseVerifier<T extends MessageBase> extends MessageVerifier<T> {
  /**
   * Verify both the signature of the message and that its content is appropriate
   * @param request
   * @param senderHost
   * @param receiverHost
   * @param timestampInSec
   */
  async verifySignatureAndContent(
    request: T,
    senderHost: string,
    receiverHost: string,
    timestampInSec = getTimeStampInSec()
  ): Promise<MessageVerificationResult> {
    // Note: verify content first as it is less CPU-consuming
    const contentVerification = this.verifyContent(request, senderHost, receiverHost, timestampInSec);
    if (!contentVerification.isValid) {
      return contentVerification;
    }
    return await this.verifySignature(request);
  }
}
