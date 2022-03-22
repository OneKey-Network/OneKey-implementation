import {GetIdsPrefsResponse, Identifiers, Preferences} from "@core/model/generated-model";
import {UnsignedData} from "@core/model/model";
import {GetIdsPrefsResponseSigner} from "@core/crypto/message-signature";
import {PrefsSigner} from "@core/crypto/data-signature";
import {PrivateKey, privateKeyFromString} from "@core/crypto/keys";
import {PublicKeyStore} from "@core/express/key-store";
import {AxiosRequestConfig} from "axios";

// FIXME should probably be moved to core library
export class OperatorClient {
    private readonly readVerifier = new GetIdsPrefsResponseSigner()
    private readonly prefsSigner = new PrefsSigner();
    private readonly ecdsaKey: PrivateKey;
    private readonly keyStore: PublicKeyStore;

    constructor(private host: string, privateKey: string, s2sOptions?: AxiosRequestConfig) {
        this.ecdsaKey = privateKeyFromString(privateKey);
        this.keyStore = new PublicKeyStore(s2sOptions)
    }

    async verifyReadResponseSignature(message: GetIdsPrefsResponse): Promise<boolean> {
        return this.readVerifier.verify((await this.keyStore.getPublicKey(message.sender)).publicKeyObj, message)
    }

    buildPreferences(identifiers: Identifiers, data: { use_browsing_for_personalization: boolean; }, timestamp = new Date().getTime()): Preferences {
        const unsignedPreferences: UnsignedData<Preferences> = {
            version: "0.1",
            data,
            source: {
                domain: this.host,
                timestamp,
            }
        };

        const {source, ...rest} = unsignedPreferences;

        return {
            ...rest,
            source: {
                ...source,
                signature: this.prefsSigner.sign(this.ecdsaKey, {identifiers, preferences: unsignedPreferences})
            }
        };
    }
}

