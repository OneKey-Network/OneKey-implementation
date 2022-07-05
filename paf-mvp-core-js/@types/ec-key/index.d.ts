declare module 'ec-key' {
  /**
   * The only functionality used from the ec-key module is the conversion from PEM format keys to JWK. This type
   * declaration is only concerned with this transformation.
   */
  export declare class ECKey {
    constructor(public key: string) {}
    toJSON: () => ECKey; // This is the only method used from ec-key. It converts PEM to JWK.
  }
  export const ECKey: ECKey = {};
  export default ECKey;
}
