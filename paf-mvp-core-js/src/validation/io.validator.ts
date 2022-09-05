import { MessageVerificationResult } from '@core/crypto';
import { IdsPrefsResponse } from '@core/model';
import { getTimeStampInSec } from '@core/timestamp';
import { MessageConsistencyValidator } from './io-consistency.validator';
import { IIO_DSAValidator } from './io-signature.validator';

export class IdsPrefsResponseValidator {
  constructor(
    private ioDsaVerifier: IIO_DSAValidator,
    private consistencyVerifier = new MessageConsistencyValidator()
  ) {}

  async verifySignatureAndContent(
    request: IdsPrefsResponse,
    senderHost: string,
    receiverHost: string,
    timestampInSec: number = getTimeStampInSec()
  ): Promise<MessageVerificationResult> {
    const contentVerification = this.consistencyVerifier.verify(request, senderHost, receiverHost, timestampInSec);
    if (!contentVerification.isValid) {
      return Promise.resolve(contentVerification);
    }
    return this.verifySignature(request);
  }

  async verifySignature(request: IdsPrefsResponse): Promise<MessageVerificationResult> {
    const isValid = await this.ioDsaVerifier.verifySignatureForIdAndPrefsResponse(request);
    const errors = isValid ? [] : [new Error('Error when verifying signature')];
    const result = {
      isValid,
      errors,
    };
    return result;
  }
}
