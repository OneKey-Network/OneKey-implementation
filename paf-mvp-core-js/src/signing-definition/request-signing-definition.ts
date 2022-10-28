import {
  DeleteIdsPrefsRequest,
  GetIdsPrefsRequest,
  GetNewIdRequest,
  MessageBase,
  PostIdsPrefsRequest,
  Unsigned,
} from '@onekey/core/model';
import { SIGN_SEP, SigningDefinition } from '@onekey/core/signing-definition/signing-definition';

export interface RedirectContext {
  /**
   * Value of the `referer` HTTP header
   */
  referer: string;

  /**
   * return URL used as a "boomerang redirect"
   */
  returnUrl: string;
}

export interface RestContext {
  /**
   * Value of the `origin` HTTP header
   */
  origin: string;
}

/**
 * Represents a request message, plus extra context that is not part of the message, but can be used for signing
 */
export interface RequestWithContext<T extends MessageBase> {
  request: T;
  context: RestContext | RedirectContext;
}

/**
 * Similar to RequestWithContext but with a request that does not contain a "signature" property
 */
export interface UnsignedRequestWithContext<T extends MessageBase> {
  request: Unsigned<T>;
  context: RestContext | RedirectContext;
}

/**
 * Defines how to extract signature, signer domain and input string from any message to or from the operator
 */
export abstract class RequestSigningDefinition<T extends MessageBase>
  implements SigningDefinition<RequestWithContext<T>, UnsignedRequestWithContext<T>>
{
  getSignature(request: RequestWithContext<T>) {
    return request.request.signature;
  }

  getSignerDomain(request: RequestWithContext<T>) {
    return request.request.sender;
  }

  abstract getInputString(request: UnsignedRequestWithContext<T>): string;

  /**
   * Add context (either origin in case of REST request, or referer and return URLs in case of redirect)
   * to the input string
   * @param requestAndContext
   * @param inputData
   * @protected
   */
  protected pushContext(
    requestAndContext: UnsignedRequestWithContext<GetIdsPrefsRequest>,
    inputData: (string | number)[]
  ) {
    const context = requestAndContext.context;

    const restContext = context as RestContext;
    const hasOrigin = restContext.origin?.length > 0;

    const redirectContext = context as RedirectContext;
    const hasReferer = redirectContext.referer?.length > 0;
    const hasReturnUrl = redirectContext.returnUrl?.length > 0;

    if (hasOrigin) {
      inputData.push(restContext.origin);
    } else if (hasReferer && hasReturnUrl) {
      inputData.push(redirectContext.referer);
      inputData.push(redirectContext.returnUrl);
    } else {
      // FIXME[errors] throw typed exception
      throw `Missing origin or referer in ${JSON.stringify(requestAndContext)}`;
    }
  }
}

/**
 * Defines how to sign a message that doesn't have a "body" property.
 * Examples: GetIdsPrefsRequest, GetNewIdRequest
 */
export class RequestWithoutBodyDefinition extends RequestSigningDefinition<
  GetIdsPrefsRequest | GetNewIdRequest | DeleteIdsPrefsRequest
> {
  getInputString(requestAndContext: UnsignedRequestWithContext<GetIdsPrefsRequest>): string {
    const request = requestAndContext.request;
    const inputData = [request.sender, request.receiver, request.timestamp];

    this.pushContext(requestAndContext, inputData);

    return inputData.join(SIGN_SEP);
  }
}

/**
 * Defines how to sign a message with a "body" property.
 * Examples: GetIdsPrefsResponse, PostIdsPrefsResponse, PostIdsPrefsRequest, GetNewIdResponse
 */
export class RequestWithBodyDefinition extends RequestSigningDefinition<PostIdsPrefsRequest> {
  getInputString(requestAndContext: UnsignedRequestWithContext<PostIdsPrefsRequest>): string {
    const request = requestAndContext.request;
    const inputData = [request.sender, request.receiver];

    if (request.body.preferences) {
      inputData.push(request.body.preferences.source.signature);
    }
    for (const id of request.body.identifiers ?? []) {
      inputData.push(id.source.signature);
    }
    inputData.push(request.timestamp.toString());

    this.pushContext(requestAndContext, inputData);

    return inputData.join(SIGN_SEP);
  }
}
