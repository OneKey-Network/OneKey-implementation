import ECKey from 'ec-key';

// Not provided by ecdsa-secp256r1 unfortunately
export interface PrivateKey extends ECKey {
  sign: (toSign: string) => string;
}

export interface PublicKey extends ECKey {
  verify: (toVerify: string, signature: string) => boolean;
}
