import {fromIdentityResponse, KeyInfo} from "@core/crypto/identity";
import {GetIdentityRequestBuilder} from "@core/model/identity-request-builder";
import {GetIdentityResponse} from "@core/model/generated-model";
import {PublicKey, publicKeyFromString} from "@core/crypto/keys";
import axios, {Axios, AxiosRequestConfig} from "axios";

type PublicKeyInfo = KeyInfo & { publicKeyObj: PublicKey };

export class PublicKeyStore {
    // FIXME should have a more elaborate cache with end date
    protected cache: { [domain: string]: PublicKeyInfo } = {};
    protected s2sClient: Axios;


    constructor(s2sOptions?: AxiosRequestConfig) {
        this.s2sClient = axios.create(s2sOptions)
    }

    async getPublicKey(domain: string): Promise<PublicKeyInfo> {
        if (this.cache[domain]) {
            return Promise.resolve(this.cache[domain])
        }

        const queryBuilder = new GetIdentityRequestBuilder(domain)
        const request = queryBuilder.buildRequest()
        const url = queryBuilder.getRestUrl(request)

        // Call identity endpoint
        const response = await this.s2sClient.get(url.toString());
        const responseData = response.data as GetIdentityResponse;

        // FIXME should find the key that is currently valid, based on dates + handle not found
        const currentKey = responseData.keys[0]

        // Update cache
        const keyInfo = {
            ...(fromIdentityResponse(currentKey)),
            publicKeyObj: publicKeyFromString(fromIdentityResponse(currentKey).publicKey)
        };
        this.cache[domain] = keyInfo;

        return keyInfo
    }
}
