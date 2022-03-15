import {fromIdentityResponse, KeyInfo} from "@core/crypto/identity";
import {GetIdentityRequestBuilder} from "@core/model/identity-request-builder";
import {GetIdentityResponse} from "@core/model/generated-model";
import {PublicKey, publicKeyFromString} from "@core/crypto/keys";
import axios, {Axios, AxiosRequestConfig} from "axios";

type PublicKeyInfo = KeyInfo & { publicKeyObj: PublicKey };

export class PublicKeyStore {
    protected cache: { [domain: string]: PublicKeyInfo } = {};
    protected s2sClient: Axios;

    constructor(s2sOptions?: AxiosRequestConfig) {
        this.s2sClient = axios.create(s2sOptions)
    }

    async getPublicKey(domain: string): Promise<PublicKeyInfo> {
        const now = new Date().getTime();

        const existingKey = this.cache[domain];

        // Make sure this key is not out dated. If so, then consider no cache value and request it from identity endpoint
        if (existingKey && now < existingKey.end.getTime()) {
            return Promise.resolve(existingKey)
        }

        const queryBuilder = new GetIdentityRequestBuilder(domain)
        const request = queryBuilder.buildRequest()
        const url = queryBuilder.getRestUrl(request)

        // Call identity endpoint
        const response = await this.s2sClient.get(url.toString());
        const responseData = response.data as GetIdentityResponse;

        const currentKey = responseData.keys
            .filter(key => key.start <= now && (key.end === undefined || now < key.end)) // valid keys
            .sort((a, b) => b.end - a.end) // order by the one that ends furthest from now
            [0] // take the first one (the one that ends as far as possible from now)

        // Update cache
        const keyInfo = {
            ...(fromIdentityResponse(currentKey)),
            publicKeyObj: publicKeyFromString(fromIdentityResponse(currentKey).publicKey)
        };
        this.cache[domain] = keyInfo;

        return keyInfo
    }
}
