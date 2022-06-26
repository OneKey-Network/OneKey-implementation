declare module 'ecdsa-secp256r1' {
  export declare interface ECDSA {
    fromJWK: (ECKey) => PublicKey | PrivateKey | Promise<PublicKey> | Promise<PrivateKey>;
    generateKey: () => Promise<PrivateKey>;
  }
  declare const ECDSA: ECDSA = {};
  export default ECDSA;
}
