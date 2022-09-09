import {
  DeleteIdsPrefsRequest,
  DeleteIdsPrefsResponse,
  GetIdsPrefsRequest,
  GetIdsPrefsResponse,
  GetNewIdRequest,
  GetNewIdResponse,
  Identifier,
  Identifiers,
  IdsAndPreferences,
  MessageBase,
  PostIdsPrefsRequest,
  PostIdsPrefsResponse,
  Preferences,
  Seed,
} from '@core/model/generated-model';
import { Unsigned, UnsignedSource } from '@core/model/model';
import { SignatureStringBuilder } from './signer';

/**
 * Definition of how to get signature, signature domain and input string to sign
 */
export interface SigningDefinition<T, U = Partial<T>> extends SignatureStringBuilder<U> {
  /**
   * How to get signature from signed data
   * @param data
   */
  getSignature(data: T): string;

  /**
   * How to get signer domain from signed data
   * @param data
   */
  getSignerDomain(data: T): string;
}

export const SIGN_SEP = '\u2063';

export interface SeedSignatureContainer {
  seed: UnsignedSource<Seed>;
  idsAndPreferences: IdsAndPreferences;
}

export class SeedSignatureBuilder implements SignatureStringBuilder<SeedSignatureContainer> {
  getInputString(data: SeedSignatureContainer): string {
    // FIXME[security] add version
    const seed = data.seed;
    const ids = data.idsAndPreferences.identifiers;
    const prefs = data.idsAndPreferences.preferences;

    const array: string[] = [
      seed.source.domain,
      seed.source.timestamp.toString(),
      ...seed.transaction_ids,
      seed.publisher,
      ...ids.map((i) => i.source.signature),
      prefs.source.signature,
    ];

    return array.join(SIGN_SEP);
  }
}

/**
 * Defines how to extract signature, signer domain and input string from an Identifier
 */
export class IdentifierDefinition implements SigningDefinition<Identifier, UnsignedSource<Identifier>> {
  getSignature(data: Identifier) {
    return data.source.signature;
  }

  getSignerDomain(data: Identifier) {
    return data.source.domain;
  }

  getInputString(data: UnsignedSource<Identifier>) {
    // FIXME[security] add version
    return [data.source.domain, data.source.timestamp, data.type, data.value].join(SIGN_SEP);
  }
}

export interface IdsAndUnsignedPreferences {
  identifiers: Identifiers;
  preferences: UnsignedSource<Preferences>;
}

/**
 * Defines how to extract signature, signer domain and input string from identifiers and preferences
 */
export class IdsAndPreferencesDefinition implements SigningDefinition<IdsAndPreferences, IdsAndUnsignedPreferences> {
  private static readonly pafBrowserId = 'paf_browser_id';

  getPafId(idsAndPreferences: IdsAndUnsignedPreferences): Identifier {
    const identifiersSource = idsAndPreferences.identifiers.find(
      (i) => i.type === IdsAndPreferencesDefinition.pafBrowserId
    );

    if (!identifiersSource) {
      throw `Invalid input for preferences signature: "${IdsAndPreferencesDefinition.pafBrowserId}" identifier not found`;
    }

    return identifiersSource;
  }

  getSignature(data: IdsAndPreferences) {
    return data.preferences.source.signature;
  }

  getSignerDomain(data: IdsAndPreferences) {
    return data.preferences.source.domain;
  }

  getInputString(data: IdsAndUnsignedPreferences) {
    // FIXME[security] add version
    const pafId = this.getPafId(data);

    const dataToSign = [data.preferences.source.domain, data.preferences.source.timestamp, pafId.source.signature];

    const prefData = data.preferences.data as unknown as { [key: string]: unknown };

    for (const key in prefData) {
      dataToSign.push(key);
      dataToSign.push(JSON.stringify(prefData[key]));
    }

    return dataToSign.join(SIGN_SEP);
  }
}

export interface RestContext {
  /**
   * Value of the `origin` HTTP header
   */
  origin: string;
}

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
export abstract class RequestDefinition<T extends MessageBase>
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
export class RequestWithoutBodyDefinition extends RequestDefinition<
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
export class RequestWithBodyDefinition extends RequestDefinition<PostIdsPrefsRequest> {
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

export type ResponseType = GetIdsPrefsResponse | PostIdsPrefsResponse | GetNewIdResponse;

/**
 * Defines how to sign a response with a "body" property.
 * Examples: GetIdsPrefsResponse, PostIdsPrefsResponse, PostIdsPrefsRequest, GetNewIdResponse
 */
export class ResponseDefinition implements SigningDefinition<ResponseType> {
  getSignature(response: ResponseType) {
    return response.signature;
  }

  getSignerDomain(response: ResponseType) {
    return response.sender;
  }

  getInputString(
    response: Unsigned<GetIdsPrefsResponse | PostIdsPrefsResponse | GetNewIdResponse | DeleteIdsPrefsResponse>
  ): string {
    const dataToSign = [response.sender, response.receiver];

    if ((response as GetIdsPrefsResponse | PostIdsPrefsResponse).body?.preferences) {
      dataToSign.push((response as GetIdsPrefsResponse | PostIdsPrefsResponse).body.preferences.source.signature);
    }

    for (const id of (response as GetIdsPrefsResponse | PostIdsPrefsResponse).body?.identifiers ?? []) {
      dataToSign.push(id.source.signature);
    }

    dataToSign.push(response.timestamp.toString());

    return dataToSign.join(SIGN_SEP);
  }
}
