import { KeyInfo } from '@core/crypto/identity';
import { GetIdentityResponse } from '@core/model/generated-model';

export class GetIdentityResponseBuilder {
  constructor(protected name: string, protected type: 'vendor' | 'operator') {}

  buildResponse(keys: KeyInfo[]): GetIdentityResponse {
    return {
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
