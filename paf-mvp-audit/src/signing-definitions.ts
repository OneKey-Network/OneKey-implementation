import { SeedSignatureBuilder, SeedSignatureContainer, SigningDefinition } from '@core/crypto';
import { IdsAndPreferences, Seed, TransmissionResponse, TransmissionResult } from '@core/model';

export interface SignedSeedSignatureContainer extends SeedSignatureContainer {
  seed: Seed;
  idsAndPreferences: IdsAndPreferences;
}

export interface TransmissionContainer extends SignedSeedSignatureContainer {
  result: TransmissionResult | TransmissionResponse | undefined;
}

export class SeedDefinition
  extends SeedSignatureBuilder
  implements SigningDefinition<SignedSeedSignatureContainer, SignedSeedSignatureContainer>
{
  getSignature(data: SignedSeedSignatureContainer): string {
    return data.seed.source.signature;
  }
  getSignerDomain(data: SignedSeedSignatureContainer): string {
    return data.seed.source.domain;
  }
}

export class TransmissionDefinition implements SigningDefinition<TransmissionContainer, TransmissionContainer> {
  private static readonly seedDefinition = new SeedDefinition();

  getSignature(data: TransmissionContainer): string {
    TransmissionDefinition.validateData(data);
    return data.result.source.signature;
  }

  getSignerDomain(data: TransmissionContainer): string {
    TransmissionDefinition.validateData(data);
    return data.result.source.domain;
  }

  getInputString(data: TransmissionContainer): string {
    return TransmissionDefinition.seedDefinition.getInputString(data);
  }

  private static validateData(data: TransmissionContainer) {
    if (data.result === undefined) {
      throw 'Data has not yet been signed';
    }
  }
}
