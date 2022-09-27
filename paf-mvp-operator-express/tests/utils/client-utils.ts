import { PublicKeyProvider } from '@onekey/core';
import { OperatorClient } from '@onekey/client-node/operator-client';

export class ClientBuilder {
  private operatorHost = 'example.onekey.network';
  private clientHost = ClientBuilder.defaultHost;
  private clientPublicKey = ClientBuilder.defaultPublicKey;
  private clientPrivateKey = ClientBuilder.defaultPrivateKey;

  static readonly defaultHost = 'paf.read-write.com';

  static readonly defaultPublicKey = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEl0278pcupaxUfiqHJ9AG9gVMyIO+
n07PJaNI22v+s7hR1Hkb71De6Ot5Z4JLoZ7aj1xYhFcQJsYkFlXxcBWfRQ==
-----END PUBLIC KEY-----`;

  static readonly defaultPrivateKey = `-----BEGIN PRIVATE KEY-----
MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg0X8r0PYAm3mq206o
CdMHwZ948ONyVJToeFbLqBDKi7OhRANCAASXTbvyly6lrFR+Kocn0Ab2BUzIg76f
Ts8lo0jba/6zuFHUeRvvUN7o63lngkuhntqPXFiEVxAmxiQWVfFwFZ9F
-----END PRIVATE KEY-----`;

  setClientPrivateKey(value: string) {
    this.clientPrivateKey = value;
    return this;
  }

  setClientPublicKey(value: string) {
    this.clientPublicKey = value;
    return this;
  }

  setClientHost(value: string) {
    this.clientHost = value;
    return this;
  }

  setOperatorHost(value: string) {
    this.operatorHost = value;
    return this;
  }

  /**
   * Build a client node
   * @param publicKeyProvider
   */
  build = (publicKeyProvider: PublicKeyProvider): OperatorClient =>
    new OperatorClient(this.operatorHost, this.clientHost, this.clientPrivateKey, publicKeyProvider);
}
