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
    const seed = data.seed;
    const ids = data.idsAndPreferences.identifiers;
    const prefs = data.idsAndPreferences.preferences;

    const array = new Array<string>();
    array.push(seed.source.domain, seed.source.timestamp.toString());
    array.push(...seed.transaction_ids);
    array.push(seed.publisher);
    array.push(...ids.map((i) => i.source.signature));
    array.push(prefs.source.signature);

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

/**
 * Defines how to sign a message that doesn't have a "body" property.
 * Examples: GetIdsPrefsRequest, GetNewIdRequest
 */
export class MessageWithoutBodyDefinition extends MessageDefinition<GetIdsPrefsRequest | GetNewIdRequest> {
  getInputString(data: UnsignedMessage<GetIdsPrefsRequest>): string {
    return [data.sender, data.receiver, data.timestamp].join(SIGN_SEP);
  }
}

/**
 * Defines how to sign a message with a "body" property.
 * Examples: GetIdsPrefsResponse, PostIdsPrefsResponse, PostIdsPrefsRequest, GetNewIdResponse
 */
export class MessageWithBodyDefinition extends MessageDefinition<
  GetIdsPrefsResponse | PostIdsPrefsResponse | PostIdsPrefsRequest | GetNewIdResponse
> {
  getInputString(
    data: UnsignedMessage<GetIdsPrefsResponse | PostIdsPrefsResponse | PostIdsPrefsRequest | GetNewIdResponse>
  ): string {
    const dataToSign = [data.sender, data.receiver];

    if ((data as GetIdsPrefsResponse | PostIdsPrefsResponse | PostIdsPrefsRequest).body.preferences) {
      dataToSign.push(
        (data as GetIdsPrefsResponse | PostIdsPrefsResponse | PostIdsPrefsRequest).body.preferences.source.signature
      );
    }

    for (const id of data.body.identifiers ?? []) {
      dataToSign.push(id.source.signature);
    }

    dataToSign.push(data.timestamp.toString());

    return dataToSign.join(SIGN_SEP);
  }
}

export class RedirectRequestDefinition<T, U = Partial<T>>
  implements SigningDefinition<RedirectRequest<T>, RedirectRequest<U>>
{
  constructor(protected requestDefinition: SigningDefinition<T, U>) {}

  getInputString(data: RedirectRequest<U>): string {
    return this.requestDefinition.getInputString(data.request);
  }

  getSignature(data: RedirectRequest<T>): string {
    return this.requestDefinition.getSignature(data.request);
  }

  getSignerDomain(data: RedirectRequest<T>): string {
    return this.requestDefinition.getSignerDomain(data.request);
  }
}

export class RedirectResponseDefinition<T, U = Partial<T>>
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
