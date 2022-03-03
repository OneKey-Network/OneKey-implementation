import {GetIdsPrefsResponse, Identifiers, Preferences} from "@core/model/generated-model";
import {UnsignedData} from "@core/model/model";
import {GetIdsPrefsResponseSigner} from "@core/crypto/message-signature";
import {PrefsSigner} from "@core/crypto/data-signature";
import {PrivateKey, privateKeyFromString, PublicKeys} from "@core/crypto/keys";

// FIXME should probably be moved to core library
export class OperatorClient {
    private readonly readVerifier = new GetIdsPrefsResponseSigner()
    private readonly prefsSigner = new PrefsSigner();
    private readonly ecdsaKey: PrivateKey;

    constructor(public operatorHost: string, private host: string, privateKey: string, protected publicKeys: PublicKeys) {
        this.ecdsaKey = privateKeyFromString(privateKey);
    }

    verifyReadResponseSignature(message: GetIdsPrefsResponse): boolean {
        return this.readVerifier.verify(this.publicKeys[message.sender], message)
    }

    buildPreferences(identifiers: Identifiers, optIn: boolean, timestamp = new Date().getTime()): Preferences {
        const unsignedPreferences: UnsignedData<Preferences> = {
            version: "0.1",
            data: {
                use_browsing_for_personalization: optIn
            },
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
                signature: this.prefsSigner.sign(this.ecdsaKey, unsignedPreferences)
            }
        };
    }
}

