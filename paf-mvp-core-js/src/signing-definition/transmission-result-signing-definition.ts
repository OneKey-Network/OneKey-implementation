import { SIGN_SEP, SigningDefinition } from '@onekey/core/signing-definition/signing-definition';
import { Seed, TransmissionResult } from '@onekey/core/model';

export interface TransmissionResultSignatureData {
  transmissionResult: TransmissionResult;
  seed: Seed;
}

export class TransmissionResultSigningDefinition implements SigningDefinition<TransmissionResultSignatureData> {
  getInputString(data: Partial<TransmissionResultSignatureData>): string {
    const { transmissionResult, seed } = data;
    return [
      transmissionResult.receiver,
      transmissionResult.status,
      transmissionResult.source.domain,
      transmissionResult.source.timestamp,
      seed.source.signature,
      ...transmissionResult.contents.map((content) => [content.transaction_id, content.content_id]).flat(),
    ].join(SIGN_SEP);
  }

  getSignature(data: TransmissionResultSignatureData): string {
    return data.transmissionResult.source.signature;
  }

  getSignerDomain(data: TransmissionResultSignatureData): string {
    return data.transmissionResult.source.domain;
  }
}
