declare module 'ecdsa-secp256r1' {
  export declare interface IECDSA {
    verify: (string, string) => boolean | Promise<boolean>;
    sign: (string) => string;
    fromJWK: (ECKey) => IECDSA | Promise<IECDSA>;
    generateKey: () => IECDSA;
  }
  declare const ECDSA: IECDSA = {};
  export default ECDSA;
}
