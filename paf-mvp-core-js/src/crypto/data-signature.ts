import {Identifier, Preferences, Source} from "../model/generated-model";
import {UnsignedData} from "../model/model";
import {PrivateKey, PublicKey} from "./keys";

export const SIGN_SEP = '\u2063';

// FIXME public and private keys should be passed (as string) in the constructor
export abstract class DataSigner<T extends {source: Source}> {
    protected abstract signatureString(data: UnsignedData<T>): string;

    sign(ecdsaPrivateKey: PrivateKey, data: UnsignedData<T>): string {
        const toSign = this.signatureString(data);
        return ecdsaPrivateKey.sign(toSign)
    }

    verify(ecdsaPublicKey: PublicKey, data: T): boolean {
        const toVerify = this.signatureString(data);
        const signature = data.source.signature;

        return ecdsaPublicKey.verify(toVerify, signature)
    }
}

export class IdSigner extends DataSigner<Identifier> {
    protected signatureString(data: UnsignedData<Identifier>): string {
        return [
            data.source.domain,
            data.source.timestamp,
            data.type,
            data.value
        ].join(SIGN_SEP);
    }
}

export class PrefsSigner extends DataSigner<Preferences> {
    protected signatureString(preferences: UnsignedData<Preferences>): string {
        //FIXME add identifiers!!

        const dataToSign = [
            preferences.source.domain,
            preferences.source.timestamp
        ];

        const data = preferences.data as unknown as {[key: string]: unknown};

        for (let key in data) {
            dataToSign.push(key)
            dataToSign.push(JSON.stringify(data[key]))
        }

        return dataToSign.join(SIGN_SEP);
    }
}
