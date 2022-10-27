import { Identifier, Identifiers, IdsAndPreferences, Preferences, UnsignedSource } from '@onekey/core/model';
import { SIGN_SEP, SigningDefinition } from '@onekey/core/signing-definition/signing-definition';

export interface IdsAndUnsignedPreferences {
  identifiers: Identifiers;
  preferences: UnsignedSource<Preferences>;
}

/**
 * Defines how to extract signature, signer domain and input string from identifiers and preferences
 */
export class IdsAndPrefsSigningDefinition implements SigningDefinition<IdsAndPreferences, IdsAndUnsignedPreferences> {
  private static readonly pafBrowserId = 'paf_browser_id';

  getPafId(idsAndPreferences: IdsAndUnsignedPreferences): Identifier {
    const identifiersSource = idsAndPreferences.identifiers.find(
      (i) => i.type === IdsAndPrefsSigningDefinition.pafBrowserId
    );

    if (!identifiersSource) {
      throw `Invalid input for preferences signature: "${IdsAndPrefsSigningDefinition.pafBrowserId}" identifier not found`;
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
