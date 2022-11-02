import { PublicKeyProvider } from '@onekey/core/crypto';
import { OperatorClient } from '@onekey/client-node/operator-client';

export class ClientBuilder {
  public operatorHost = 'example.onekey.network';
  private clientHost = ClientBuilder.defaultHost;
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

  /**
   * Build a client node
   * @param publicKeyProvider
   */
  build = (publicKeyProvider: PublicKeyProvider): OperatorClient =>
    new OperatorClient(this.operatorHost, this.clientHost, this.clientPrivateKey, publicKeyProvider);
}
