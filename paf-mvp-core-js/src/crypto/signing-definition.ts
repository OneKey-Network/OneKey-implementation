import { Identifier, Identifiers, IdsAndPreferences, MessageBase, Preferences } from '@core/model/generated-model';
import { UnsignedData } from '@core/model/model';

/**
 * Definition of how to get signature, signature domain and input string to sign
 */
export interface SigningDefinition<T, U = Partial<T>> {
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

  /**
   * How to get input string from unsigned data
   * @param data
   */
  getInputString(data: U): string;
}

export const SIGN_SEP = '\u2063';

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
export abstract class MessageDefinition implements SigningDefinition<MessageBase> {
  getSignature(data: MessageBase) {
    return data.signature;
  }

  getSignerDomain(data: MessageBase) {
    return data.sender;
  }

  abstract getInputString(data: MessageBase): string;
}

// TODO implement getInputString depending on the message
