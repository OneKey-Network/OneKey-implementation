import { SigningDefinition } from '@core/crypto/signing-definition';
import { IDSABuilder } from '@core/crypto/digital-signature';

export interface FooType {
  foo: string;
  bar: string;
  domain: string;
  signature?: string;
}

export class FooSigningDefinition implements SigningDefinition<FooType> {
  getInputString(data: Partial<FooType>) {
    return `${data.foo}.${data.bar}`;
  }

  getSignerDomain(data: Partial<FooType>) {
    return data.domain;
  }

  getSignature(data: FooType) {
    return data.signature;
  }
}

export const mockBuilder: jest.Mocked<IDSABuilder> = {
  buildSigner: jest.fn(),
  buildKeyService: jest.fn(),
  buildVerifier: jest.fn(),
};
