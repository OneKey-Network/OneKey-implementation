import {GetIdsPrefsRequest, GetNewIdRequest, IdsAndPreferences, PostIdsPrefsRequest} from "./generated-model";
import {UnsignedMessage} from "./model";
import {GetIdsPrefsRequestSigner, GetNewIdRequestSigner, PostIdsPrefsRequestSigner} from "../crypto/message-signature";
import {jsonOperatorEndpoints, redirectEndpoints} from "../endpoints";
import {getTimeStampInSec} from "../timestamp";
import {RestAndRedirectRequestBuilder, SignedRestRequestBuilder} from "@core/model/request-builders";

export class GetIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<GetIdsPrefsRequest> {
    private readonly signer = new GetIdsPrefsRequestSigner()

    constructor(operatorHost: string, clientHost: string, privateKey: string) {
        super(operatorHost, clientHost, jsonOperatorEndpoints.read, redirectEndpoints.read, privateKey);
    }

    buildRequest(timestamp = getTimeStampInSec()): GetIdsPrefsRequest {
        const request: UnsignedMessage<GetIdsPrefsRequest> = {
            sender: this.clientHost,
            receiver: this.serverHost,
            timestamp
        }
        return {
            ...request,
            signature: this.signer.sign(this.ecdsaKey, request)
        };
    }
}

export class PostIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<PostIdsPrefsRequest> {
    private readonly signer = new PostIdsPrefsRequestSigner()

    constructor(operatorHost: string, clientHost: string, privateKey: string) {
        super(operatorHost, clientHost, jsonOperatorEndpoints.write, redirectEndpoints.write, privateKey);
    }

    buildRequest(idsAndPreferences: IdsAndPreferences, timestamp = getTimeStampInSec()): PostIdsPrefsRequest {
        const request: UnsignedMessage<PostIdsPrefsRequest> = {
            body: idsAndPreferences,
            sender: this.clientHost,
            receiver: this.serverHost,
            timestamp
        }
        return {
            ...request,
            signature: this.signer.sign(this.ecdsaKey, request)
        };
    }

    /**
     * Note: no request parameter as it is used as POST payload, not query string
     */
    getRestUrl(): URL {
        return this.getOperatorUrl(this.restEndpoint)
    }
}

export class GetNewIdRequestBuilder extends SignedRestRequestBuilder<GetNewIdRequest> {
    private readonly signer = new GetNewIdRequestSigner()

    constructor(operatorHost: string, clientHost: string, privateKey: string) {
        super(operatorHost, clientHost, jsonOperatorEndpoints.newId, privateKey);
    }

    buildRequest(timestamp = getTimeStampInSec()): GetNewIdRequest {
        const request: UnsignedMessage<GetNewIdRequest> = {
            sender: this.clientHost,
            receiver: this.serverHost,
            timestamp
        }
        return {
            ...request,
            signature: this.signer.sign(this.ecdsaKey, request)
        };
    }
}

export class Get3PCRequestBuilder extends SignedRestRequestBuilder<undefined> {
    constructor(operatorHost: string, clientHost: string, privateKey: string) {
        super(operatorHost, clientHost, jsonOperatorEndpoints.verify3PC, privateKey);
    }

    buildRequest(timestamp = getTimeStampInSec()): undefined {
        return undefined;
    }

    /**
     * Note: no request parameter
     */
    getRestUrl(): URL {
        return this.getOperatorUrl(this.restEndpoint)
    }
}

