import { setInQueryString } from '@core/express/utils';
import { MessageBase } from '@core/model/generated-model';
import { RedirectRequest, Unsigned } from '@core/model/model';
import { RedirectContext, RequestDefinition, RestContext } from '@core/crypto/signing-definition';
import { getTimeStampInSec } from '@core/timestamp';
import { SignerImpl } from '@core/crypto/signer';
import { privateKeyFromString } from '@core/crypto/keys';

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
    private readonly signer = new SignerImpl(privateKeyFromString(privateKey), definition)
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
  buildRestRequest(context: RestContext, data: D = undefined, timestamp = getTimeStampInSec()): T {
    const request = this.buildUnsignedRequest(data, timestamp);
    return {
      ...request,
      signature: this.signer.sign({ request, context }),
    } as T;
  }

  /**
   * Build a request to be used to call the redirect endpoint
   * @param context
   * @param data
   * @param timestamp
   */
  buildRedirectRequest(
    context: RedirectContext,
    data: D = undefined,
    timestamp = getTimeStampInSec()
  ): RedirectRequest<T> {
    const request = this.buildUnsignedRequest(data, timestamp);
    return {
      returnUrl: context.returnUrl,
      request: {
        ...request,
        signature: this.signer.sign({ request, context }),
      } as T,
    };
  }
}
