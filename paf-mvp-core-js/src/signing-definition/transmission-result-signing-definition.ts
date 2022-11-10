import { SIGN_SEP, SigningDefinition } from '@onekey/core/signing-definition/signing-definition';
import { PostVerifyTransmissionResultRequest } from '@onekey/core/model';

export class TransmissionResultSigningDefinition implements SigningDefinition<PostVerifyTransmissionResultRequest> {
  getInputString(data: Partial<PostVerifyTransmissionResultRequest>): string {
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

  getSignature(data: PostVerifyTransmissionResultRequest): string {
    return data.transmissionResult.source.signature;
  }

  getSignerDomain(data: PostVerifyTransmissionResultRequest): string {
    return data.transmissionResult.source.domain;
  }
}
