declare module 'ec-key' {
  declare class ECKey {
    constructor(public key: string) {}
    toJSON();
  }
  export default ECKey;
}
