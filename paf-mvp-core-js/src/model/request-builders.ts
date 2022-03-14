import {setInQueryString} from "@core/express";
import {PrivateKey, privateKeyFromString} from "@core/crypto/keys";

export abstract class RestRequestBuilder<T extends object | undefined> {
    protected constructor(public serverHost: string, protected clientHost: string, protected restEndpoint: string) {
    }

    protected getOperatorUrl(endpoint: string, pafQuery: object | undefined = undefined): URL {
        let url = new URL(`https://${this.serverHost}${endpoint}`);

        if (pafQuery) {
            url = setInQueryString(url, pafQuery)
        }

        return url
    }

    getRestUrl(request: T): URL {
        return this.getOperatorUrl(this.restEndpoint, request)
    }
}

export abstract class SignedRestRequestBuilder<T extends object | undefined> extends RestRequestBuilder<T> {
    protected ecdsaKey: PrivateKey;

    protected constructor(public serverHost: string, protected clientHost: string, protected restEndpoint: string, privateKey: string) {
        super(serverHost, clientHost, restEndpoint);
        this.ecdsaKey = privateKeyFromString(privateKey);
    }
}

export abstract class RestAndRedirectRequestBuilder<T extends object | undefined> extends SignedRestRequestBuilder<T> {

    protected constructor(operatorHost: string, clientHost: string, restEndpoint: string, protected redirectEndpoint: string, privateKey: string) {
        super(operatorHost, clientHost, restEndpoint, privateKey);
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
