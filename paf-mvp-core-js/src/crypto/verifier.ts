import { PublicKey } from '@core/crypto/keys';
import {
  IdentifierDefinition,
  IdsAndPreferencesDefinition,
  RequestWithContext,
  SigningDefinition,
  UnsignedRequestWithContext,
} from '@core/crypto/signing-definition';
import { Identifier, IdsAndPreferences, MessageBase } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';
import winston, { format } from 'winston';
import { Unsigned } from '@core/model/model';
import util from 'util';
import { TransformableInfo } from 'logform';

const logger = winston.createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    {
      transform: (info: TransformableInfo) => {
        const args = info[Symbol.for('splat') as unknown as string];
        if (args) {
          info.message = util.format(info.message, ...args);
        }
        return info;
      },
    },
    format.colorize(),
    format.printf(({ level, message, label, timestamp }) => `${timestamp} ${label || '-'} ${level}: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

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
    const signingDomain = this.definition.getSignerDomain(signedData);
    const publicKey = await this.publicKeyProvider(signingDomain);

    const signature = this.definition.getSignature(signedData);
    const toVerify = this.definition.getInputString(signedData);

    const result = publicKey.verify(toVerify, signature);

    logger.info('Verifying', signedData, result);

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

  async verifySignature(signedData: IdsAndPreferences): Promise<boolean> {
    // Note: preferences are signed using the PAF ID signature => when verifying the preferences' signature, we also first verify the PAF ID signature!
    return (
      (await this.idVerifier.verifySignature(this.definition.getPafId(signedData))) &&
      (await super.verifySignature(signedData))
    );
  }
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
  verifyContent(message: T, senderHost: string, receiverHost: string, timestampInSec: number): boolean {
    return (
      timestampInSec - message.timestamp < this.messageTTLinSec &&
      message.sender === senderHost &&
      message.receiver === receiverHost
    );
  }

  abstract verifySignatureAndContent(
    request: R,
    senderHost: string,
    receiverHost: string,
    timestampInSec: number
  ): Promise<boolean>;
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
  ): Promise<boolean> {
    // Note: verify content first as it is less CPU-consuming
    return (
      this.verifyContent(request.request, senderHost, receiverHost, timestampInSec) &&
      (await this.verifySignature(request))
    );
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
  ): Promise<boolean> {
    // Note: verify content first as it is less CPU-consuming
    return (
      this.verifyContent(request, senderHost, receiverHost, timestampInSec) && (await this.verifySignature(request))
    );
  }
}
