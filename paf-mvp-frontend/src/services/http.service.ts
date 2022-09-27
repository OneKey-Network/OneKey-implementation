import { Log } from '@onekey/core';

export interface IHttpService {
  /** Yes if the service has started a redirection. */
  isRedirecting: boolean;
  /**
   * Starts a redirection on the given URL if the service
   * hasn't started already one.
   */
  redirect(url: string): boolean;
  /**
   * Stringifies the JS object and HTTP-POST it at the given URL
   * with headers including 'credentials: include'.
   *
   * Returns a rejected promise if the service is currently redirecting.
   *
   * For now, we don't use Content-type JSON to avoid CORS pre-flight request.
   * See https://stackoverflow.com/questions/37668282/unable-to-fetch-post-without-no-cors-in-header
   */
  postJson(url: string, input: object): Promise<Response>;
  /**
   * Calls HTTP POST the given body at the given URL
   * with headers including 'credentials: include'.
   *
   * Returns a rejected promise if the service is currently redirecting.
   */
  postText(url: string, input: string): Promise<Response>;
  /**
   * Calls HTTP GET at the given URL
   * with headers including 'credentials: include'.
   *
   * Returns a rejected promise if the service is currently redirecting.
   */
  get(url: string): Promise<Response>;
  /**
   * Calls HTTP DELETE at the given URL
   * with headers including 'credentials: include'.
   *
   * Returns a rejected promise if the service is currently redirecting.
   */
  deleteHttp(url: string): Promise<Response>;
}

/**
 * HTTP Client for encapsulating built-in API.
 * Only 'Response' remains exposed.
 */
export interface IHttpClient {
  /**
   * Calls the fetch API including custom init for aborting.
   */
  fetch(input: RequestInfo, init?: RequestInit): Promise<Response>;
  /**
   * Aborts all fech calls that are in progress thanks to the
   * AbortController API.
   */
  abortInProgressFetch(): void;

  redirect(url: URL | string): void;
}

/**
 * Error thrown when there is an intent to fetch an HTTP ressource
 * whereas the browser is currently redirecting.
 */
export class RedirectingError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RedirectingError.prototype);
  }
}

export class HttpService implements IHttpService {
  logger: Log;
  isRedirecting: boolean;
  client: IHttpClient;

  constructor(client: IHttpClient = new HttpClient(), logger = new Log('OneKey', '#3bb8c3')) {
    this.logger = logger;
    this.isRedirecting = false;
    this.client = client;
  }

  redirect(url: string): boolean {
    if (this.isRedirecting) {
      this.logger.Warn('Not redirection because already redirecting', url);
      return false;
    }
    this.logger.Info('Redirecting to:', url);
    this.isRedirecting = true;
    this.client.abortInProgressFetch();
    this.client.redirect(url);
    return true;
  }

  postJson(url: string, input: object): Promise<Response> {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(input),
      credentials: 'include',
    });
  }

  postText(url: string, input: string): Promise<Response> {
    return this.fetch(url, {
      method: 'POST',
      body: input,
      credentials: 'include',
    });
  }

  get(url: string): Promise<Response> {
    return this.fetch(url, {
      method: 'GET',
      credentials: 'include',
    });
  }

  deleteHttp(url: string): Promise<Response> {
    return this.fetch(url, {
      method: 'DELETE',
      credentials: 'include',
    });
  }

  private fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    if (this.isRedirecting) {
      const msg = `${init?.method ?? 'GET'} ${input} while redirecting`;
      this.logger.Warn(msg);
      return Promise.reject(new RedirectingError(msg));
    }
    return this.client.fetch(input, init);
  }
}

export class HttpClient implements IHttpClient {
  abortController: AbortController;

  constructor() {
    this.abortController = new AbortController();
  }

  fetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const enhancedInit: RequestInit = {
      ...init,
      signal: this.abortController.signal,
    };
    return fetch(input, enhancedInit);
  }

  abortInProgressFetch(): void {
    this.abortController.abort();
    this.abortController = new AbortController();
  }

  redirect(url: URL | string): void {
    location.replace(url);
  }
}
