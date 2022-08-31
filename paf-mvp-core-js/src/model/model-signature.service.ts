import { IDSASigner } from '@core/crypto/digital-signature';
import { IdsAndPreferences, Seed } from './generated-model';
import { UnsignedSource } from './model';

export const SIGN_SEP = '\u2063';

/**
 * Service for signing models
 */
export interface IModelSignatureService {
  /**
   * Sign a seed. The signature relies on the ids and preferences of the user.
   */
  signSeed(seed: UnsignedSource<Seed>, idsAndPreferences: IdsAndPreferences): Promise<Seed>;
}

/**
 * Construct string used for generating the signature of entities.
 */
export interface ISignedStringBuilder {
  /**
   * Generate the string that must be signed for the Source of the a Seed.
   */
  buildStringForSigningSeed(seed: UnsignedSource<Seed>, idsAndPreferences: IdsAndPreferences): string;
}

export class ModelSignatureService implements IModelSignatureService {
  constructor(
    private readonly signer: IDSASigner,
    private readonly stringBuilder: ISignedStringBuilder = new SignedStringBuilder()
  ) {}

  async signSeed(unsignedSeed: UnsignedSource<Seed>, idsAndPreferences: IdsAndPreferences): Promise<Seed> {
    const signedString = this.stringBuilder.buildStringForSigningSeed(unsignedSeed, idsAndPreferences);
    const signature = await this.signer.sign(signedString);
    const signedSeed: Seed = {
      ...unsignedSeed,
      source: {
        ...unsignedSeed.source,
        signature,
      },
    };
    return signedSeed;
  }
}

export class SignedStringBuilder implements ISignedStringBuilder {
  buildStringForSigningSeed(seed: UnsignedSource<Seed>, idsAndPreferences: IdsAndPreferences): string {
    const ids = idsAndPreferences.identifiers;
    const prefs = idsAndPreferences.preferences;

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
