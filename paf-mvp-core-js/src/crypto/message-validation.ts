import {
  GetIdsPrefsRequest,
  GetIdsPrefsResponse,
  GetNewIdRequest,
  GetNewIdResponse,
  MessageBase,
  PostIdsPrefsRequest,
  PostIdsPrefsResponse,
} from '../model/generated-model';
import { UnsignedMessage } from '../model/model';
import { PrivateKey, PublicKey } from './keys';
import { getTimeStampInSec } from '@core/timestamp';

export const SIGN_SEP = '\u2063';

// TODO public and private keys should be passed (as string) in the constructor
export abstract class MessageValidation<T extends MessageBase> {
  protected abstract signatureString(message: UnsignedMessage<T>): string;

  /**
   * @param messageTTLinSec acceptable time to live for a message to be received
   */
  constructor(public messageTTLinSec = 30) {}

  sign(ecdsaPrivateKey: PrivateKey, message: UnsignedMessage<T>): string {
    const toSign = this.signatureString(message);
    return ecdsaPrivateKey.sign(toSign);
  }

  /**
   * Verify message signature, timestamp, sender and receiver
   * @param ecdsaPublicKey
   * @param message
   * @param senderHost
   * @param receiverHost
   * @param timestampInSec
   */
  verify(
    ecdsaPublicKey: PublicKey,
    message: T,
    senderHost: string,
    receiverHost: string,
    timestampInSec = getTimeStampInSec()
  ): boolean {
    const toVerify = this.signatureString(message);
    const signature = message.signature;

    // Important to do the tests together
    // message.timestamp, sender and receiver can only be trusted if the signature was verified!
    return (
      timestampInSec - message.timestamp < this.messageTTLinSec &&
      message.sender === senderHost &&
      message.receiver === receiverHost &&
      // Do signature verification last to avoid CPU consumption if the rest is not valid
      ecdsaPublicKey.verify(toVerify, signature)
    );
  }
}

export class PostIdsPrefsRequestValidation extends MessageValidation<PostIdsPrefsRequest> {
  protected signatureString(postIdsPrefsRequest: UnsignedMessage<PostIdsPrefsRequest>) {
    const dataToSign = [postIdsPrefsRequest.sender, postIdsPrefsRequest.receiver];

    if (postIdsPrefsRequest.body.preferences) {
      dataToSign.push(postIdsPrefsRequest.body.preferences.source.signature);
    }

    for (const id of postIdsPrefsRequest.body.identifiers ?? []) {
      dataToSign.push(id.source.signature);
    }

    dataToSign.push(postIdsPrefsRequest.timestamp.toString());

    return dataToSign.join(SIGN_SEP);
  }
}

export class GetIdsPrefsRequestValidation extends MessageValidation<GetIdsPrefsRequest> {
  protected signatureString(getIdsPrefsRequest: UnsignedMessage<GetIdsPrefsRequest>): string {
    return [getIdsPrefsRequest.sender, getIdsPrefsRequest.receiver, getIdsPrefsRequest.timestamp].join(SIGN_SEP);
  }
}

export class GetNewIdRequestValidation extends MessageValidation<GetNewIdRequest> {
  protected signatureString(getNewIdRequest: UnsignedMessage<GetNewIdRequest>): string {
    return [getNewIdRequest.sender, getNewIdRequest.receiver, getNewIdRequest.timestamp].join(SIGN_SEP);
  }
}

const getIdsPrefSignatureInput = (getIdsPrefsResponse: UnsignedMessage<GetIdsPrefsResponse>) => {
  const dataToSign = [getIdsPrefsResponse.sender, getIdsPrefsResponse.receiver];

  if (getIdsPrefsResponse.body.preferences) {
    dataToSign.push(getIdsPrefsResponse.body.preferences.source.signature);
  }

  for (const id of getIdsPrefsResponse.body.identifiers ?? []) {
    dataToSign.push(id.source.signature);
  }

  dataToSign.push(getIdsPrefsResponse.timestamp.toString());

  return dataToSign.join(SIGN_SEP);
};

export class GetIdsPrefsResponseValidation extends MessageValidation<GetIdsPrefsResponse> {
  protected signatureString(getIdsPrefsResponse: UnsignedMessage<GetIdsPrefsResponse>): string {
    return getIdsPrefSignatureInput(getIdsPrefsResponse);
  }
}

export class PostIdsPrefsResponseValidation extends MessageValidation<PostIdsPrefsResponse> {
  protected signatureString(postIdsPrefsResponse: UnsignedMessage<PostIdsPrefsResponse>): string {
    return getIdsPrefSignatureInput(postIdsPrefsResponse);
  }
}

export class GetNewIdResponseValidation extends MessageValidation<GetNewIdResponse> {
  protected signatureString(getNewIdResponse: UnsignedMessage<GetNewIdResponse>): string {
    return getIdsPrefSignatureInput(getNewIdResponse);
  }
}
