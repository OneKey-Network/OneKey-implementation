import { PublicKeyInfo } from '../crypto/identity';
import { GetIdentityResponse } from '../model/generated-model';

export class GetIdentityResponseBuilder {
  constructor(
    protected name: string,
    protected type: 'vendor' | 'operator',
    protected dpoEmailAddress: string,
    protected privacyPolicyUrl: URL
  ) {}

  buildResponse(keys: PublicKeyInfo[]): GetIdentityResponse {
    return {
      dpo_email: this.dpoEmailAddress,
      privacy_policy_url: this.privacyPolicyUrl.toString(),
      name: this.name,
      keys: keys.map(({ startTimestampInSec, endTimestampInSec, publicKey }: PublicKeyInfo) => ({
        key: publicKey,
        start: startTimestampInSec,
        end: endTimestampInSec,
      })),
      type: this.type,
      version: '0.1',
    };
  }
}
