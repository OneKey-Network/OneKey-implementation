import {KeyInfo} from '@core/crypto/identity';
import {GetIdentityResponse} from '@core/model/generated-model';
import {getTimeStampInSec} from '@core/timestamp';

export class GetIdentityResponseBuilder {
    constructor(protected name: string, protected type: 'vendor' | 'operator') {
    }

    buildResponse(keys: KeyInfo[]): GetIdentityResponse {
        return {
            name: this.name,
            keys: keys.map(({start, end, publicKey}: KeyInfo) => ({
                key: publicKey,
                start: getTimeStampInSec(start),
                end: end ? getTimeStampInSec(end) : undefined,
            })),
            type: this.type,
            version: '0.1'
        };
    }
}
