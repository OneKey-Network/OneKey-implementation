import { Log } from '@core/log';
import { GetIdentityResponse } from '@core/model';

/**
 * Service interface used to get identity information for the domain.
 */
export interface IdentityResolver {
  /**
   * Returns the identity for the domain, or null if the host has no identity.
   * @param domain
   */
  get(domain: string): Promise<GetIdentityResponse | null>;
}

/**
 * Returns the identity using a map of host keys to identities.
 */
export class IdentityResolverMap implements IdentityResolver {
  /**
   * Map used to relate host names to identity information.
   */
  public readonly map: Map<string, GetIdentityResponse>;

  /**
   * New instance of the identity resolver backed with a map.
   * @log
   * @param map of prepared identities or empty of not available
   */
  constructor(protected readonly log: Log, map?: Map<string, GetIdentityResponse>) {
    this.map = map ?? new Map<string, GetIdentityResponse>();
  }

  /**
   * Returns the identity for the host, or null if the host has no identity.
   * @param host
   */
  public get(host: string): Promise<GetIdentityResponse> {
    return Promise.resolve(this.map.get(host));
  }
}

/**
 * Returns the identity using an HTTP request to the host.
 */
export class IdentityResolverHttp extends IdentityResolverMap {
  /**
   * Returns the identity for the host, or null if the host has no identity.
   * Uses a map to avoid requesting the same identity information from the network.
   * @param host
   */
  public async get(host: string): Promise<GetIdentityResponse> {
    let identity = await super.get(host);
    if (identity === null) {
      const response = await fetch(`https://${host}/paf/v1/identity`, {
        method: 'GET',
        mode: 'cors',
        cache: 'default',
      });
      if (response) {
        identity = await response.json();
        this.map.set(host, identity);
      } else {
        this.log.Warn(response.statusText);
      }
    }
    return identity;
  }
}
