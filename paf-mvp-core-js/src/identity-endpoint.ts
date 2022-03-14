import {KeyInfo} from "@core/crypto/identity";
import {GetIdentityResponse} from "@core/model/generated-model";
import {getTimeStampInSec} from "@core/timestamp";
import {RestRequestBuilder} from "@core/model/request-builders";
import {participantEndpoints} from "@core/endpoints";

export class GetIdentityResponseBuilder {
    constructor(protected name: string, protected type: "vendor" | "operator") {
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
            version: "0.1"
        }
    }
}

export class GetIdentityRequestBuilder extends RestRequestBuilder<undefined> {
    constructor(operatorHost: string, clientHost: string) {
        super(operatorHost, clientHost, participantEndpoints.identity);
    }

    buildRequest(): undefined {
        return undefined;
    }
}
