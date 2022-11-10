import { IdsAndPreferences, PostVerifySeedRequest, Seed, UnsignedSource } from '@onekey/core/model';
import { SIGN_SEP, SigningDefinition } from '@onekey/core/signing-definition/signing-definition';

export interface UnsignedSeedSignatureData {
  seed: UnsignedSource<Seed>;
  idsAndPreferences: IdsAndPreferences;
}

export class SeedSigningDefinition implements SigningDefinition<PostVerifySeedRequest, UnsignedSeedSignatureData> {
  getInputString(data: UnsignedSeedSignatureData): string {
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

  getSignature(data: PostVerifySeedRequest): string {
    return data.seed.source.signature;
  }

  getSignerDomain(data: UnsignedSeedSignatureData): string {
    return data.seed.publisher;
  }
}
