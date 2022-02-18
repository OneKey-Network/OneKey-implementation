import {
    Error,
    Get3PcResponse,
    GetIdentityResponse,
    GetIdsPrefsResponse,
    GetNewIdResponse,
    Identifier,
    IdsAndOptionalPreferences,
    IdsAndPreferences,
    PostIdsPrefsResponse,
    Test3Pc
} from "./generated-model";
import {UnsignedMessage} from "./model";
import {
    GetIdsPrefsResponseSigner,
    GetNewIdResponseSigner,
    PostIdsPrefsResponseSigner
} from "../crypto/message-signature";
import {PrivateKey, privateKeyFromString} from "../crypto/keys";
import {jsonEndpoints, redirectEndpoints} from "../endpoints";
import {getTimeStampInSec} from "../timestamp";
import {KeyInfo} from "../crypto/identity";
import {setInQueryString} from "../express";

export abstract class RestResponseBuilder<T> {
    protected ecdsaKey: PrivateKey;

    constructor(protected host: string, privateKey: string, protected restEndpoint: string) {
        this.ecdsaKey = privateKeyFromString(privateKey);
    }
}

export abstract class RestAndRedirectResponseBuilder<T> extends RestResponseBuilder<T> {

    constructor(host: string, privateKey: string, restEndpoint: string, protected redirectEndpoint: string) {
        super(host, privateKey, restEndpoint);
    }

    getRedirectUrl(returnUrl: URL, redirectResponse: { code: number, response?: T, error?: Error }): URL {

        if (redirectResponse) {
            setInQueryString(returnUrl, redirectResponse)
        }

        return returnUrl
    }

    toRedirectResponse(response: T, code: number) {
        return {
            code,
            response
        }
    }
}

export class GetIdsPrefsResponseBuilder extends RestAndRedirectResponseBuilder<GetIdsPrefsResponse> {
    private readonly signer = new GetIdsPrefsResponseSigner()

    constructor(host: string, privateKey: string) {
        super(host, privateKey, jsonEndpoints.read, redirectEndpoints.read);
    }

    buildResponse(
        receiver: string,
        {identifiers, preferences}: IdsAndOptionalPreferences,
        timestampInSec = getTimeStampInSec()
    ): GetIdsPrefsResponse {
        const data: UnsignedMessage<GetIdsPrefsResponse> = {
            body: {
                identifiers,
                preferences
            },
            sender: this.host,
            receiver,
            timestamp: timestampInSec
        };

        return {
            ...data,
            signature: this.signer.sign(this.ecdsaKey, data)
        }
    }
}

export class PostIdsPrefsResponseBuilder extends RestAndRedirectResponseBuilder<PostIdsPrefsResponse> {
    private readonly signer = new PostIdsPrefsResponseSigner()

    constructor(host: string, privateKey: string) {
        super(host, privateKey, jsonEndpoints.read, redirectEndpoints.read);
    }

    buildResponse(
        receiver: string,
        {identifiers, preferences}: IdsAndPreferences,
        timestampInSec = getTimeStampInSec()
    ): PostIdsPrefsResponse {
        const data: UnsignedMessage<PostIdsPrefsResponse> = {
            body: {
                identifiers,
                preferences
            },
            sender: this.host,
            receiver,
            timestamp: timestampInSec
        };

        return {
            ...data,
            signature: this.signer.sign(this.ecdsaKey, data)
        }
    }
}

export class GetNewIdResponseBuilder extends RestResponseBuilder<GetNewIdResponse> {
    private readonly signer = new GetNewIdResponseSigner()

    constructor(host: string, privateKey: string) {
        super(host, privateKey, jsonEndpoints.newId);
    }

    buildResponse(receiver: string, newId: Identifier, timestampInSec = getTimeStampInSec()): GetNewIdResponse {
        const data: UnsignedMessage<GetNewIdResponse> = {
            body: {
                identifiers: [newId],
            },
            sender: this.host,
            receiver,
            timestamp: timestampInSec
        };

        return {
            ...data,
            signature: this.signer.sign(this.ecdsaKey, data)
        }
    }
}

export class Get3PCResponseBuilder extends RestResponseBuilder<undefined> {
    // FIXME remove host and private key from constructor
    constructor(host: string, privateKey: string) {
        super(host, privateKey, jsonEndpoints.verify3PC);
    }

    buildResponse(cookieFound: Test3Pc | undefined): Get3PcResponse | Error {
        return cookieFound
            ? {"3pc": cookieFound}
            : {message: "3PC not supported"}
    }
}

export class GetIdentityResponseBuilder extends RestResponseBuilder<undefined> {
    // FIXME remove private key from constructor
    constructor(host: string, privateKey: string, protected name: string, protected type: "vendor" | "operator") {
        super(host, privateKey, jsonEndpoints.identity);
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
