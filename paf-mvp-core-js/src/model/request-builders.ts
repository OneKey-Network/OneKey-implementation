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

    constructor(protected protocol: 'https' | 'http', public operatorHost: string, protected host: string, privateKey: string, protected restEndpoint: string) {
        this.ecdsaKey = privateKeyFromString(privateKey);
    }

    protected getOperatorUrl(endpoint: string, pafQuery: object | undefined = undefined): URL {
        let url = new URL(`${this.protocol}://${this.operatorHost}${endpoint}`);

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

    constructor(protocol: "https" | "http", operatorHost: string, host: string, privateKey: string, restEndpoint: string, protected redirectEndpoint: string) {
        super(protocol, operatorHost, host, privateKey, restEndpoint);
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

    constructor(protocol: "https" | "http", operatorHost: string, host: string, privateKey: string) {
        super(protocol, operatorHost, host, privateKey, jsonEndpoints.read, redirectEndpoints.read);
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

    constructor(protocol: "https" | "http", operatorHost: string, host: string, privateKey: string) {
        super(protocol, operatorHost, host, privateKey, jsonEndpoints.write, redirectEndpoints.write);
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

    constructor(protocol: "https" | "http", operatorHost: string, host: string, privateKey: string) {
        super(protocol, operatorHost, host, privateKey, jsonEndpoints.newId);
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
    constructor(protocol: "https" | "http", operatorHost: string, host: string, privateKey: string) {
        super(protocol, operatorHost, host, privateKey, jsonEndpoints.verify3PC);
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
    constructor(protocol: "https" | "http", operatorHost: string, host: string, privateKey: string) {
        super(protocol, operatorHost, host, privateKey, jsonEndpoints.identity);
    }

    buildRequest(timestamp = getTimeStampInSec()): undefined {
        return undefined;
    }
}
