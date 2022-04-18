import { KeyInfo } from '@core/crypto/identity';
import { GetIdentityResponse } from '@core/model/generated-model';

export class GetIdentityResponseBuilder {
  constructor(
    protected name: string,
    protected type: 'vendor' | 'operator',
    protected dpoEmailAddress: string,
    protected privacyPolicyUrl: URL
  ) {}

  buildResponse(keys: KeyInfo[]): GetIdentityResponse {
    return {
      dpo_email: this.dpoEmailAddress,
      privacy_policy_url: this.privacyPolicyUrl.toString(),
      name: this.name,
      keys: keys.map(({ startTimestampInSec, endTimestampInSec, publicKey }: KeyInfo) => ({
        key: publicKey,
        start: startTimestampInSec,
        end: endTimestampInSec,
      })),
      type: this.type,
      version: '0.1',
    };
  }
}
