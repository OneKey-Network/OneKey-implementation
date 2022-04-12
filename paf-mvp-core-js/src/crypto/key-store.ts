import { fromIdentityResponse, KeyInfo } from './identity';
import { PublicKey, publicKeyFromString } from './keys';
import { GetIdentityRequestBuilder } from '@core/model/identity-request-builder';
import { GetIdentityResponse, Timestamp } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

export type PublicKeyInfo = KeyInfo & { publicKeyObj: PublicKey };

export class PublicKeyStore {
  protected cache: { [domain: string]: PublicKeyInfo } = {};

  constructor(
    s2sOptions?: AxiosRequestConfig,
    protected s2sClient = axios.create(s2sOptions),
    protected timestampProvider: () => Timestamp = getTimeStampInSec
  ) {}

  async getPublicKey(domain: string): Promise<PublicKeyInfo> {
    const nowTimestampSeconds = this.timestampProvider();

    const existingKey = this.cache[domain];

    // Make sure this key is not out dated. If so, then consider no cache value and request it from identity endpoint
    if (
      existingKey &&
      (existingKey.endTimestampInSec === undefined || nowTimestampSeconds < existingKey.endTimestampInSec)
    ) {
      return Promise.resolve(existingKey);
    }

    const queryBuilder = new GetIdentityRequestBuilder(domain);
    const request = queryBuilder.buildRequest();
    const url = queryBuilder.getRestUrl(request);

    let response: AxiosResponse;

    // Call identity endpoint
    try {
      response = await this.s2sClient.get(url.toString());
    } catch (e) {
      throw new Error(`Error calling Identity endpoint on ${domain}: ${e?.message}`);
    }

    const responseData = response.data as GetIdentityResponse;

    const currentKey = responseData.keys
      .filter((key) => key.start <= nowTimestampSeconds && (key.end === undefined || nowTimestampSeconds < key.end)) // valid keys
      .sort((a, b) => b.end - a.end) // order by the one that ends furthest from now
      .at(0); // take the first one (the one that ends as far as possible from now)

    if (currentKey === undefined) {
      throw new Error(`No valid key found for ${domain} in: ${JSON.stringify(responseData.keys)}`);
    }

    // Update cache
    const keyInfo = {
      ...fromIdentityResponse(currentKey),
      publicKeyObj: publicKeyFromString(fromIdentityResponse(currentKey).publicKey),
    };

    this.cache[domain] = keyInfo;

    return keyInfo;
  }

  /**
   * Helper method to get a simple "provider" (domain) => public Key
   * @param domain
   */
  provider = async (domain: string) => {
    return (await this.getPublicKey(domain)).publicKeyObj;
  };
}
