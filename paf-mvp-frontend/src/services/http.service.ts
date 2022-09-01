import { Log } from '@core/log';

export interface IHttpService {
  /** Yes if the service has started a redirection. */
  isRedirecting: boolean;
  /**
   * Start a redirection on the given URL if the service
   * hasn't started already one.
   */
  redirect(url: string): boolean;
  /**
   * Stringify the JS object and HTTP-POST it at the given URL
   * with headers including 'credentials: include'.
   *
   * For now, we don't use Content-type JSON to avoid CORS pre-flight request.
   * See https://stackoverflow.com/questions/37668282/unable-to-fetch-post-without-no-cors-in-header
   */
  postJson(url: string, input: object): Promise<Response>;
  /**
   * Call HTTP POST the given body at the given URL
   * with headers including 'credentials: include'.
   */
  postText(url: string, input: string): Promise<Response>;
  /**
   * Call HTTP GET at the given URL
   * with headers including 'credentials: include'.
   */
  get(url: string): Promise<Response>;
  /**
   * Call HTTP DELETE at the given URL
   * with headers including 'credentials: include'.
   */
  deleteHttp(url: string): Promise<Response>;
}

type Fetcher = typeof fetch;

export class HttpService implements IHttpService {
  fetch: Fetcher;
  logger: Log;
  isRedirecting: boolean;

  constructor(fetcher: Fetcher = fetch, logger = new Log('OneKey', '#3bb8c3')) {
    this.fetch = fetcher;
    this.logger = logger;
    this.isRedirecting = false;
  }

  redirect(url: string): boolean {
    if (this.isRedirecting) {
      this.logger.Warn('Not redirecting, because already redirecting', url);
      return false;
    }
    this.logger.Info('Redirecting to:', url);
    this.isRedirecting = true;
    location.replace(url);
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
}
