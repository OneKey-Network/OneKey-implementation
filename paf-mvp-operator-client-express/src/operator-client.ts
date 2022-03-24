import {GetIdsPrefsResponse, Identifiers, Preferences} from '@core/model/generated-model';
import {UnsignedData} from '@core/model/model';
import {GetIdsPrefsResponseValidation} from '@core/crypto/message-validation';
import {PrefsSigner} from '@core/crypto/data-signature';
import {PrivateKey, privateKeyFromString} from '@core/crypto/keys';
import {PublicKeyStore} from '@core/express/key-store';
import {AxiosRequestConfig} from 'axios';
import {GetIdsPrefsRequestBuilder} from '@core/model/operator-request-builders';

// FIXME should probably be moved to core library
export class OperatorClient {
    private readonly getIdsPrefsRequestBuilder: GetIdsPrefsRequestBuilder;
    private readonly readVerifier = new GetIdsPrefsResponseValidation();
    private readonly prefsSigner = new PrefsSigner();
    private readonly ecdsaKey: PrivateKey;
    private readonly keyStore: PublicKeyStore;

    constructor(protected operatorHost: string, private clientHost: string, privateKey: string, s2sOptions?: AxiosRequestConfig) {
        this.ecdsaKey = privateKeyFromString(privateKey);
        this.keyStore = new PublicKeyStore(s2sOptions);
        this.getIdsPrefsRequestBuilder = new GetIdsPrefsRequestBuilder(operatorHost, clientHost, privateKey);
    }

    async verifyReadResponse(message: GetIdsPrefsResponse): Promise<boolean> {
        // Signature + timestamp + sender + receiver are valid
        return this.readVerifier.verify(
            (await this.keyStore.getPublicKey(message.sender)).publicKeyObj,
            message,
            this.operatorHost,
            this.clientHost
        );
    }

    buildPreferences(identifiers: Identifiers, data: { use_browsing_for_personalization: boolean; }, timestamp = new Date().getTime()): Preferences {
        const unsignedPreferences: UnsignedData<Preferences> = {
            version: '0.1',
            data,
            source: {
                domain: this.clientHost,
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

    getReadRestUrl(): URL {
        const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.buildRequest();
        return this.getIdsPrefsRequestBuilder.getRestUrl(getIdsPrefsRequestJson);
    }

    getReadRedirectUrl(returnUrl: URL): URL {
        const getIdsPrefsRequestJson = this.getIdsPrefsRequestBuilder.toRedirectRequest(
            this.getIdsPrefsRequestBuilder.buildRequest(),
            returnUrl
        );
        return this.getIdsPrefsRequestBuilder.getRedirectUrl(getIdsPrefsRequestJson);
    }
}

