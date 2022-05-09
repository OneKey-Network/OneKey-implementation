import {
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
import { RedirectRequest, RedirectResponse, UnsignedData, UnsignedMessage } from '@core/model/model';
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
  seed: UnsignedData<Seed>;
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
export class IdentifierDefinition implements SigningDefinition<Identifier, UnsignedData<Identifier>> {
  getSignature(data: Identifier) {
    return data.source.signature;
  }

  getSignerDomain(data: Identifier) {
    return data.source.domain;
  }

  getInputString(data: UnsignedData<Identifier>) {
    // FIXME[security] add version
    return [data.source.domain, data.source.timestamp, data.type, data.value].join(SIGN_SEP);
  }
}

export interface IdsAndUnsignedPreferences {
  identifiers: Identifiers;
  preferences: UnsignedData<Preferences>;
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

/**
 * Defines how to extract signature, signer domain and input string from any message to or from the operator
 */
export abstract class MessageDefinition<T extends MessageBase, U = UnsignedMessage<T>>
  implements SigningDefinition<T, U>
{
  getSignature(data: T) {
    return data.signature;
  }

  getSignerDomain(data: T) {
    return data.sender;
  }

  abstract getInputString(data: U): string;
}

export interface JSONContext {
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

export interface RequestWithContext<T extends MessageBase, U = UnsignedMessage<T>> {
  request: U;
  // FIXME FIXME FIXME make this mandatory
  context?: JSONContext | RedirectContext;
}

/**
 * Defines how to sign a message that doesn't have a "body" property.
 * Examples: GetIdsPrefsRequest, GetNewIdRequest
 */
export class RequestWithoutBodyDefinition extends MessageDefinition<
  GetIdsPrefsRequest | GetNewIdRequest,
  RequestWithContext<GetIdsPrefsRequest | GetNewIdRequest>
> {
  getInputString({ request }: RequestWithContext<GetIdsPrefsRequest>): string {
    // FIXME[security] add version
    // FIXME[security] add {origin: string} | {returnUrl:string, referer: string}
    return [request.sender, request.receiver, request.timestamp].join(SIGN_SEP);
  }
}

/**
 * Defines how to sign a message with a "body" property.
 * Examples: GetIdsPrefsResponse, PostIdsPrefsResponse, PostIdsPrefsRequest, GetNewIdResponse
 */
export class RequestWithBodyDefinition extends MessageDefinition<
  PostIdsPrefsRequest,
  RequestWithContext<PostIdsPrefsRequest>
> {
  getInputString({ request }: RequestWithContext<PostIdsPrefsRequest>): string {
    // FIXME[security] add version
    // FIXME[security] add {origin: string} | {returnUrl:string, referer: string}
    const dataToSign = [request.sender, request.receiver];

    if (request.body.preferences) {
      dataToSign.push(request.body.preferences.source.signature);
    }

    for (const id of request.body.identifiers ?? []) {
      dataToSign.push(id.source.signature);
    }

    dataToSign.push(request.timestamp.toString());

    return dataToSign.join(SIGN_SEP);
  }
}

/**
 * Defines how to sign a response with a "body" property.
 * Examples: GetIdsPrefsResponse, PostIdsPrefsResponse, PostIdsPrefsRequest, GetNewIdResponse
 */
export class ResponseDefinition extends MessageDefinition<
  GetIdsPrefsResponse | PostIdsPrefsResponse | GetNewIdResponse
> {
  getInputString(request: UnsignedMessage<GetIdsPrefsResponse | PostIdsPrefsResponse | GetNewIdResponse>): string {
    // FIXME[security] add version
    // FIXME[security] add {origin: string} | {returnUrl:string, referer: string}
    const dataToSign = [request.sender, request.receiver];

    if ((request as GetIdsPrefsResponse | PostIdsPrefsResponse).body.preferences) {
      dataToSign.push((request as GetIdsPrefsResponse | PostIdsPrefsResponse).body.preferences.source.signature);
    }

    for (const id of request.body.identifiers ?? []) {
      dataToSign.push(id.source.signature);
    }

    dataToSign.push(request.timestamp.toString());

    return dataToSign.join(SIGN_SEP);
  }
}

// FIXME should remove
export class RedirectRequestDefinition<T extends MessageBase, U = Partial<T>>
  implements SigningDefinition<RedirectRequest<T>, RedirectRequest<U>>
{
  constructor(protected requestDefinition: SigningDefinition<T, RequestWithContext<T, U>>) {}

  getInputString(data: RedirectRequest<U>): string {
    return this.requestDefinition.getInputString({ request: data.request });
  }

  getSignature(data: RedirectRequest<T>): string {
    return this.requestDefinition.getSignature(data.request);
  }

  getSignerDomain(data: RedirectRequest<T>): string {
    return this.requestDefinition.getSignerDomain(data.request);
  }
}

// FIXME should remove
export class RedirectResponseDefinition<T extends MessageBase, U = Partial<T>>
  implements SigningDefinition<RedirectResponse<T>, RedirectResponse<U>>
{
  constructor(protected requestDefinition: SigningDefinition<T, U>) {}

  getInputString(data: RedirectResponse<U>): string {
    return this.requestDefinition.getInputString(data.response);
  }

  getSignature(data: RedirectResponse<T>): string {
    return this.requestDefinition.getSignature(data.response);
  }

  getSignerDomain(data: RedirectResponse<T>): string {
    return this.requestDefinition.getSignerDomain(data.response);
  }
}
