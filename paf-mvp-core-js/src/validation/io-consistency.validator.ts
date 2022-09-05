import { MessageVerificationResult } from '@core/crypto/verifier';
import { MessageBase } from '@core/model';

export class MessageConsistencyValidator {
  constructor(public messageTTLinSec = 30) {}

  verify(
    message: MessageBase,
    senderHost: string,
    receiverHost: string,
    timestampInSec: number
  ): MessageVerificationResult {
    const timeSpent = timestampInSec - message.timestamp;
    const isUnderTTL = timeSpent < this.messageTTLinSec;
    const hasSender = message.sender === senderHost;
    const hasReceiver = message.receiver === receiverHost;
    const isValid = isUnderTTL && hasReceiver && hasSender;
    const errors = isValid ? [] : [new Error('Inconsistency in the message')];
    return {
      isValid,
      errors,
    };
  }
}
