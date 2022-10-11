import { MessageBase } from '@onekey/core/model/generated-model';
import { RedirectRequest, Unsigned } from '@onekey/core/model/model';
import { RedirectContext, RequestDefinition, RestContext } from '@onekey/core/crypto/signing-definition';
import { getTimeStampInSec } from '@onekey/core/timestamp';
import { Signer } from '@onekey/core/crypto/signer';
import { setInQueryString } from '@onekey/core/query-string';

export abstract class RestRequestBuilder<R extends object | undefined> {
  constructor(public serverHost: string, protected restEndpoint: string) {}

  protected getUrl(endpoint: string, pafQuery: object | undefined = undefined): URL {
    let url = new URL(`https://${this.serverHost}${endpoint}`);

    if (pafQuery) {
      url = setInQueryString(url, pafQuery);
    }

    return url;
  }

  /**
   * Get the full operator URL to call, in REST mode
   * @param request
   */
  getRestUrl(request: R): URL {
    return this.getUrl(this.restEndpoint, request);
  }
}

export abstract class RestAndRedirectRequestBuilder<
  T extends MessageBase,
  D = undefined
> extends RestRequestBuilder<T> {
  constructor(
    public operatorHost: string,
    protected clientHost: string,
    protected restEndpoint: string,
    protected redirectEndpoint: string,
    privateKey: string,
    definition: RequestDefinition<T>,
    private readonly signer = new Signer(privateKey, definition)
  ) {
    super(operatorHost, restEndpoint);
  }

  getRedirectUrl(redirectRequest: RedirectRequest<T>): URL {
    return this.getUrl(this.redirectEndpoint, redirectRequest);
  }

  /**
   * @deprecated
   * @param request
   * @param returnUrl
   */
  toRedirectRequest(request: T, returnUrl: URL) {
    return {
      request,
      returnUrl: returnUrl.toString(),
    };
  }

  protected abstract buildUnsignedRequest(data: D, timestamp: number): Unsigned<T>;

  /**
   * Build a request to be used to call the REST endpoint
   * @param context
   * @param data
   * @param timestamp
   */
  async buildRestRequest(context: RestContext, data: D = undefined, timestamp = getTimeStampInSec()): Promise<T> {
    const request = this.buildUnsignedRequest(data, timestamp);
    return {
      ...request,
      signature: await this.signer.sign({ request, context }),
    } as T;
  }

  /**
   * Build a request to be used to call the redirect endpoint
   * @param context
   * @param data
   * @param timestamp
   */
  async buildRedirectRequest(
    context: RedirectContext,
    data: D = undefined,
    timestamp = getTimeStampInSec()
  ): Promise<RedirectRequest<T>> {
    const request = this.buildUnsignedRequest(data, timestamp);
    return {
      returnUrl: context.returnUrl,
      request: {
        ...request,
        signature: await this.signer.sign({ request, context }),
      } as T,
    };
  }
}
