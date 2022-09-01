import { fromIdentityResponse, isValidKey, PublicKeyInfo } from './identity';
import { GetIdentityRequestBuilder } from '@core/model/identity-request-builder';
import { GetIdentityResponse, Timestamp } from '@core/model/generated-model';
import { getTimeStampInSec } from '@core/timestamp';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { UnableToIdentifySignerError } from '@core/express/errors';
import { PEM } from '@core/crypto/digital-signature';

/**
 * A function that provides a public key from a domain name
 */
export interface PublicKeyProvider {
  (domain: string): Promise<PEM>;
}

export class PublicKeyStore {
  protected cache: { [domain: string]: PublicKeyInfo } = {};

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
      console.error(`Error calling Identity endpoint on ${domain}: ${e?.message}`);
      throw new UnableToIdentifySignerError(`Error calling Identity endpoint on ${domain}`);
    }

    const responseData = response.data as GetIdentityResponse;

    const filtered = responseData.keys.filter((key) => isValidKey(key, nowTimestampSeconds)); // valid keys
    const sorted = filtered.sort((a, b) => b.end - a.end); // order by the one that ends furthest from now
    const currentKey = sorted[0]; // take the first one (the one that ends as far as possible from now)

    if (currentKey === undefined) {
      console.error(`No valid key found for ${domain} in: ${JSON.stringify(responseData.keys)}`);
      throw new UnableToIdentifySignerError(`No valid key found for ${domain}`);
    }

    // Update cache
    const matched = fromIdentityResponse(currentKey);

    const keyInfo = {
      ...matched,
    };

    this.cache[domain] = keyInfo;

    return keyInfo;
  }

  constructor(
    s2sOptions?: AxiosRequestConfig,
    protected s2sClient = axios.create(s2sOptions),
    protected timestampProvider: () => Timestamp = getTimeStampInSec
  ) {}

  /**
   * Helper method to get a simple "provider" (domain) => public Key
   * @param domain
   */
  provider = async (domain: string) => {
    return (await this.getPublicKey(domain)).publicKey;
  };
}
