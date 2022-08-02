import { Signed } from '@core/crypto/verify';
import { Domain, GetIdsPrefsRequest, Signature, Timestamp } from '.';

export const SIGN_SEP = '\u2063';

export class RestGetIdsPrefsRequest implements Signed, GetIdsPrefsRequest {
  origin: Domain;
  sender: Domain;
  receiver: Domain;
  timestamp: Timestamp;
  signature: Signature;

  get signerDomain(): string {
    return this.receiver;
  }

  get signedString(): string {
    const inputData = [this.sender, this.receiver, this.timestamp, this.origin];
    return inputData.join(SIGN_SEP);
  }
}
