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
  public readonly map: Map<string, GetIdentityResponse>;

  /**
   * New instance of the identity resolver backed with a map.
   * @param millisecondDelay length of time to wait in milliseconds before responding
   * @param map of prepared identities or empty of not available
   */
  constructor(private readonly millisecondDelay: number, map?: Map<string, GetIdentityResponse>) {
    this.map = map ?? new Map<string, GetIdentityResponse>();
  }

  /**
   * Waits for the time to pass before responding. Simulates network latency.
   * @param milliseconds to wait before responding
   * @returns
   */
  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  /**
   * Returns the identity for the host, or null if the host has no identity.
   * @param host
   */
  public get(host: string): Promise<GetIdentityResponse> {
    if (this.millisecondDelay > 0) {
      return this.delay(this.millisecondDelay).then(() => this.map.get(host));
    }
    return Promise.resolve(this.map.get(host));
  }
}

/**
 * Returns the identity using an HTTP request to the host.
 */
export class IdentityResolverHttp implements IdentityResolver {
  /**
   * Cache of responses found so far.
   */
  private readonly map = new Map<string, GetIdentityResponse>();

  /**
   * Constructs a new HTTP identity resolver.
   * @param log for recording HTTP response text when an error occurs
   */
  constructor(private readonly log: Log) {}

  /**
   * Returns the identity for the host, or null if the host has no identity.
   * Uses a map to avoid requesting the same identity information from the network.
   * @param host
   */
  public async get(host: string): Promise<GetIdentityResponse> {
    let identity = this.map.get(host);
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
