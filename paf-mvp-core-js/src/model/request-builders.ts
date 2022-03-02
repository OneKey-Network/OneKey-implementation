import {GetIdsPrefsRequest, PostIdsPrefsRequest, IdsAndPreferences, GetNewIdRequest} from "./generated-model";
import {UnsignedMessage} from "./model";
import {GetIdsPrefsRequestSigner, PostIdsPrefsRequestSigner, GetNewIdRequestSigner} from "../crypto/message-signature";
import {PrivateKey, privateKeyFromString} from "../crypto/keys";
import {jsonEndpoints, redirectEndpoints} from "../endpoints";
import {getTimeStampInSec} from "../timestamp";
import {QSParam} from "../query-string";
import {setInQueryString} from "../express";

export abstract class RestRequestBuilder<T extends object | undefined> {
    protected ecdsaKey: PrivateKey;

    constructor(public operatorHost: string, protected host: string, privateKey: string, protected restEndpoint: string) {
        this.ecdsaKey = privateKeyFromString(privateKey);
    }

    protected getOperatorUrl(endpoint: string, pafQuery: object | undefined = undefined): URL {
        let url = new URL(`https://${this.operatorHost}${endpoint}`);

        if (pafQuery) {
            url = setInQueryString(url, pafQuery)
        }

        return url
    }

    getRestUrl(request: T): URL {
        return this.getOperatorUrl(this.restEndpoint, request)
    }
}

export abstract class RestAndRedirectRequestBuilder<T extends object | undefined> extends RestRequestBuilder<T> {

    constructor(operatorHost: string, host: string, privateKey: string, restEndpoint: string, protected redirectEndpoint: string) {
        super(operatorHost, host, privateKey, restEndpoint);
    }

    getRedirectUrl(redirectRequest: { request: T, returnUrl: string }): URL {
        return this.getOperatorUrl(this.redirectEndpoint, redirectRequest)
    }

    toRedirectRequest(request: T, returnUrl: URL) {
        return {
            request,
            returnUrl: returnUrl.toString()
        }
    }
}

export class GetIdsPrefsRequestBuilder extends RestAndRedirectRequestBuilder<GetIdsPrefsRequest> {
    private readonly signer = new GetIdsPrefsRequestSigner()

    constructor(operatorHost: string, host: string, privateKey: string) {
        super(operatorHost, host, privateKey, jsonEndpoints.read, redirectEndpoints.read);
    }

    buildRequest(timestamp = getTimeStampInSec()): GetIdsPrefsRequest {
        const request: UnsignedMessage<GetIdsPrefsRequest> = {
            sender: this.host,
            receiver: this.operatorHost,
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

    constructor(operatorHost: string, host: string, privateKey: string) {
        super(operatorHost, host, privateKey, jsonEndpoints.write, redirectEndpoints.write);
    }

    buildRequest(idsAndPreferences: IdsAndPreferences, timestamp = getTimeStampInSec()): PostIdsPrefsRequest {
        const request: UnsignedMessage<PostIdsPrefsRequest> = {
            body: idsAndPreferences,
            sender: this.host,
            receiver: this.operatorHost,
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

export class GetNewIdRequestBuilder extends RestRequestBuilder<GetNewIdRequest> {
    private readonly signer = new GetNewIdRequestSigner()

    constructor(operatorHost: string, host: string, privateKey: string) {
        super(operatorHost, host, privateKey, jsonEndpoints.newId);
    }

    buildRequest(timestamp = getTimeStampInSec()): GetNewIdRequest {
        const request: UnsignedMessage<GetNewIdRequest> = {
            sender: this.host,
            receiver: this.operatorHost,
            timestamp
        }
        return {
            ...request,
            signature: this.signer.sign(this.ecdsaKey, request)
        };
    }
}

export class Get3PCRequestBuilder extends RestRequestBuilder<undefined> {
    constructor(operatorHost: string, host: string, privateKey: string) {
        super(operatorHost, host, privateKey, jsonEndpoints.verify3PC);
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

export class GetIdentityRequestBuilder extends RestRequestBuilder<undefined> {
    constructor(operatorHost: string, host: string, privateKey: string) {
        super(operatorHost, host, privateKey, jsonEndpoints.identity);
    }

    buildRequest(timestamp = getTimeStampInSec()): undefined {
        return undefined;
    }
}
