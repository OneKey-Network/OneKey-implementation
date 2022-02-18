import {
    GetIdsPrefsRequest,
    GetIdsPrefsResponse,
    GetNewIdRequest,
    GetNewIdResponse,
    MessageBase,
    PostIdsPrefsRequest,
    PostIdsPrefsResponse
} from "../model/generated-model";
import {UnsignedMessage} from "../model/model";
import {PrivateKey, PublicKey} from "./keys";

export const SIGN_SEP = '\u2063';

// FIXME public and private keys should be passed (as string) in the constructor
export abstract class MessageSigner<T extends MessageBase> {
    protected abstract signatureString(message: UnsignedMessage<T>): string;

    sign(ecdsaPrivateKey: PrivateKey, message: UnsignedMessage<T>): string {
        const toSign = this.signatureString(message);
        return ecdsaPrivateKey.sign(toSign)
    }

    verify(ecdsaPublicKey: PublicKey, message: T): boolean {
        const toVerify = this.signatureString(message);
        const signature = message.signature;

        return ecdsaPublicKey.verify(toVerify, signature)
    }
}

export class PostIdsPrefsRequestSigner extends MessageSigner<PostIdsPrefsRequest> {
    protected signatureString(postIdsPrefsRequest: UnsignedMessage<PostIdsPrefsRequest>) {
        const dataToSign = [
            postIdsPrefsRequest.sender,
            postIdsPrefsRequest.receiver,
        ];

        if (postIdsPrefsRequest.body.preferences) {
            dataToSign.push(postIdsPrefsRequest.body.preferences.source.signature)
        }

        for (let id of postIdsPrefsRequest.body.identifiers ?? []) {
            dataToSign.push(id.source.signature)
        }

        dataToSign.push(postIdsPrefsRequest.timestamp.toString())

        return dataToSign.join(SIGN_SEP);
    }
}

export class GetIdsPrefsRequestSigner extends MessageSigner<GetIdsPrefsRequest> {
    protected signatureString(getIdsPrefsRequest: UnsignedMessage<GetIdsPrefsRequest>): string {
        return [
            getIdsPrefsRequest.sender,
            getIdsPrefsRequest.receiver,
            getIdsPrefsRequest.timestamp
        ].join(SIGN_SEP)
    }
}

export class GetNewIdRequestSigner extends MessageSigner<GetNewIdRequest> {
    protected signatureString(getNewIdRequest: UnsignedMessage<GetNewIdRequest>): string {
        return [
            getNewIdRequest.sender,
            getNewIdRequest.receiver,
            getNewIdRequest.timestamp
        ].join(SIGN_SEP)
    }
}

const getIdsPrefSignatureInput = (getIdsPrefsResponse: UnsignedMessage<GetIdsPrefsResponse>) => {
    const dataToSign = [
        getIdsPrefsResponse.sender,
        getIdsPrefsResponse.receiver,
    ];

    if (getIdsPrefsResponse.body.preferences) {
        dataToSign.push(getIdsPrefsResponse.body.preferences.source.signature)
    }

    for (let id of getIdsPrefsResponse.body.identifiers ?? []) {
        dataToSign.push(id.source.signature)
    }

    dataToSign.push(getIdsPrefsResponse.timestamp.toString())

    return dataToSign.join(SIGN_SEP)
};

export class GetIdsPrefsResponseSigner extends MessageSigner<GetIdsPrefsResponse> {
    protected signatureString(getIdsPrefsResponse: UnsignedMessage<GetIdsPrefsResponse>): string {
        return getIdsPrefSignatureInput(getIdsPrefsResponse);
    }
}

export class PostIdsPrefsResponseSigner extends MessageSigner<PostIdsPrefsResponse> {
    protected signatureString(postIdsPrefsResponse: UnsignedMessage<PostIdsPrefsResponse>): string {
        return getIdsPrefSignatureInput(postIdsPrefsResponse);
    }
}

export class GetNewIdResponseSigner extends MessageSigner<GetNewIdResponse> {
    protected signatureString(getNewIdResponse: UnsignedMessage<GetNewIdResponse>): string {
        return getIdsPrefSignatureInput(getNewIdResponse);
    }
}
