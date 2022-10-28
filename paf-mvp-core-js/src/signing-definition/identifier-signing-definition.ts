import { SIGN_SEP, SigningDefinition } from '@onekey/core/signing-definition/signing-definition';
import { Identifier, UnsignedSource } from '@onekey/core/model';

/**
 * Defines how to extract signature, signer domain and input string from an Identifier
 */
export class IdentifierSigningDefinition implements SigningDefinition<Identifier, UnsignedSource<Identifier>> {
  getSignature(data: Identifier) {
    return data.source.signature;
  }

  getSignerDomain(data: Identifier) {
    return data.source.domain;
  }

  getInputString(data: UnsignedSource<Identifier>) {
    // FIXME[security] add version
    return [data.source.domain, data.source.timestamp, data.type, data.value].join(SIGN_SEP);
  }
}
