import { Identifier, Identifiers, IdsAndPreferences, Preferences } from '../model/generated-model';
import { UnsignedData } from '../model/model';
import { PrivateKey, PublicKey } from './keys';

export const SIGN_SEP = '\u2063';

/**
 * U = Unsigned type (used for getting signature input)
 * S = Signed type (used to verify signature)
 */
export abstract class DataValidation<U, S> {
  protected abstract signatureString(data: U): string;

  abstract verify(ecdsaPublicKey: PublicKey, signedData: S): boolean;

  sign(ecdsaPrivateKey: PrivateKey, inputData: U): string {
    const toSign = this.signatureString(inputData);

    return ecdsaPrivateKey.sign(toSign);
  }

  protected verifyWithSignature(ecdsaPublicKey: PublicKey, inputData: U, signature: string): boolean {
    const toVerify = this.signatureString(inputData);

    return ecdsaPublicKey.verify(toVerify, signature);
  }
}

export class IdValidation extends DataValidation<UnsignedData<Identifier>, Identifier> {
  protected signatureString(data: UnsignedData<Identifier>): string {
    return [data.source.domain, data.source.timestamp, data.type, data.value].join(SIGN_SEP);
  }

  verify(ecdsaPublicKey: PublicKey, inputData: Identifier): boolean {
    return super.verifyWithSignature(ecdsaPublicKey, inputData, inputData.source.signature);
  }
}

export interface IdsAndUnsignedPreferences {
  identifiers: Identifiers;
  preferences: UnsignedData<Preferences>;
}

export class PreferencesValidation extends DataValidation<IdsAndUnsignedPreferences, IdsAndPreferences> {
  protected signatureString(idsAndPreferences: IdsAndUnsignedPreferences): string {
    // Find the "Prebid ID"
    const identifiersSource = idsAndPreferences.identifiers.find((i) => i.type === 'paf_browser_id');

    if (!identifiersSource) {
      throw 'Invalid input for preferences signature: "paf_browser_id" identifier not found';
    }

    const dataToSign = [
      idsAndPreferences.preferences.source.domain,
      idsAndPreferences.preferences.source.timestamp,
      identifiersSource.source.signature,
    ];

    const data = idsAndPreferences.preferences.data as unknown as { [key: string]: unknown };

    for (const key in data) {
      dataToSign.push(key);
      dataToSign.push(JSON.stringify(data[key]));
    }

    return dataToSign.join(SIGN_SEP);
  }

  verify(ecdsaPublicKey: PublicKey, signedData: IdsAndPreferences): boolean {
    return super.verifyWithSignature(ecdsaPublicKey, signedData, signedData.preferences.source.signature);
  }
}
