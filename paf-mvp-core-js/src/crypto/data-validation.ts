import {Identifier, Identifiers, IdsAndPreferences, Preferences} from '../model/generated-model';
import {UnsignedData} from '../model/model';
import {PrivateKey, PublicKey} from './keys';

export const SIGN_SEP = '\u2063';

/**
 * U = Unsigned type (used for getting signature input)
 * S = Signed type (used to verify signature)
 */
export abstract class DataValidation<U, S> {
    protected abstract signatureString(data: U): string;

    abstract verify(signedData: S): Promise<boolean>;

    constructor(protected publicKeyProvider: (domain: string) => Promise<PublicKey>) {
    }

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

    async verify(signedData: Identifier): Promise<boolean> {
        return super.verifyWithSignature(await this.publicKeyProvider(signedData.source.domain), signedData, signedData.source.signature);
    }
}

export interface IdsAndUnsignedPreferences {
    identifiers: Identifiers;
    preferences: UnsignedData<Preferences>;
}

export class PreferencesValidation extends DataValidation<IdsAndUnsignedPreferences, IdsAndPreferences> {
    private static readonly pafBrowserId = 'paf_browser_id';

    constructor(publicKeyProvider: (domain: string) => Promise<PublicKey>, protected idValidation = new IdValidation(publicKeyProvider)) {
        super(publicKeyProvider);
    }

    protected getPafId(idsAndPreferences: IdsAndUnsignedPreferences): Identifier {
        const identifiersSource = idsAndPreferences.identifiers.find((i) => i.type === PreferencesValidation.pafBrowserId);

        if (!identifiersSource) {
            throw `Invalid input for preferences signature: "${PreferencesValidation.pafBrowserId}" identifier not found`;
        }

        return identifiersSource;
    }

    protected signatureString(idsAndPreferences: IdsAndUnsignedPreferences): string {
        const pafId = this.getPafId(idsAndPreferences);

        const dataToSign = [
            idsAndPreferences.preferences.source.domain,
            idsAndPreferences.preferences.source.timestamp,
            pafId.source.signature,
        ];

        const data = idsAndPreferences.preferences.data as unknown as { [key: string]: unknown };

        for (const key in data) {
            dataToSign.push(key);
            dataToSign.push(JSON.stringify(data[key]));
        }

        return dataToSign.join(SIGN_SEP);
    }

    async verify(signedData: IdsAndPreferences): Promise<boolean> {
        // Note: preferences are signed using the PAF ID signature => when verifying the preferences' signature, we also first verify the PAF ID signature!
        return (await this.idValidation.verify(this.getPafId(signedData)))
            && (super.verifyWithSignature(await this.publicKeyProvider(signedData.preferences.source.domain), signedData, signedData.preferences.source.signature));
    }
}
