import { PrivateKey, privateKeyFromString } from '@core/crypto/keys';

export abstract class RestResponseBuilder<T> {
  protected ecdsaKey: PrivateKey;

  protected constructor(protected host: string, privateKey: string, protected restEndpoint: string) {
    this.ecdsaKey = privateKeyFromString(privateKey);
  }
}
