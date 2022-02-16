const ECDSA = require("ecdsa-secp256r1");
const ECKey = require("ec-key");

// Not provided by ecdsa-secp256r1 unfortunately
export interface PrivateKey {
    sign: (toSign: string) => string
}

export interface PublicKey {
    verify: (toVerify: string, signature: string) => boolean
}

export interface PublicKeys {
    [host: string]: PublicKey
}

export const publicKeyFromString = (keyString: string): PublicKey => ECDSA.fromJWK(new ECKey(keyString))
export const privateKeyFromString = (keyString: string): PrivateKey => ECDSA.fromJWK(new ECKey(keyString))
