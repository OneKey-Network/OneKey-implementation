/**
 * Digital Signature Algorithm (DSA) module.
 *
 * Implement only ECDSA for now. ECDSA is a variant of DSA.
 *
 * Example:
 *  const builder: IDSABuilder = new ECDSA_NIT_P256Builder();
 *
 *  const keyService = builder.buildKeyService();
 *  const keys = keyService.generateKeys();
 *
 *  const signer = builder.buildSigner(keys.privateKey);
 *  const signature = await signer.sign('test');
 *
 *  const verifier = builder.buildVerifier(keys.publicKey);
 *  const isValid = await verifier.verify('test', signature);
 *
 * ⚠️ This module is sensitive due to the use of private keys.
 * ⚠️ There is no logger to reduce the probability of leaking
 * ⚠️ data if the code grows.
 */
import { createPrivateKey, createPublicKey, generateKeyPairSync, KeyObject, sign, verify } from 'node:crypto';

/**
 * Signature of a Digital Signature Algorithm.
 */
export type Signature = string;

/**
 * PEM (Privacy_enhanced Mail) is the used format for
 * storing and sharing cryptographic keys.
 *
 * Note that binary data is in *base62*.
 * https://en.wikipedia.org/wiki/Privacy-Enhanced_Mail
 */
export type PEM = string;

/**
 * A pair of asymetric (private and public) keys
 * used for Digital Signature Algorithms.
 */
export interface DSAKeyPair {
  privateKey: PEM;
  publicKey: PEM;
}

/**
 * Detail the validation of a public or private key.
 */
export interface DSAKeyValidation {
  valid: boolean;
  errorReason?: string;
}

/**
 * Build all the necessary services for
 * a *specific* Digital Signature Algorithm.
 */
export interface IDSABuilder {
  buildKeyService(): IDSAKeyService;
  /**
   * Build a signer.
   * Throw if the given key isn't relevant.
   */
  buildSigner(privateKey: PEM): IDSASigner;
  /**
   * Build a verfier.
   * Throw if the given key isn't relevant.
   */
  buildVerifier(publicKey: PEM): IDSAVerifier;
}

/**
 * Service for generating and validating cryptographic keys
 * for a *specific* Digital Signature Algorithm.
 */
export interface IDSAKeyService {
  generateKeys(): DSAKeyPair;
  validatePublicKey(key: PEM): DSAKeyValidation;
  validatePrivateKey(key: PEM): DSAKeyValidation;
}

/**
 * Sign signatures with a *specific* Digital Signature Algorithm.
 */
export interface IDSASigner {
  /**
   * Sign the data with a private key.
   */
  sign(data: string): Promise<Signature>;
}

/**
 * Verify signatures with a *specific* Digital Signature Algorithm.
 */
export interface IDSAVerifier {
  /**
   * Verify the signature of the data with a public key.
   */
  verify(data: string, signature: Signature): Promise<boolean>;
}

/**
 * Custom Error sent from the module.
 * ⚠️ The message MUST NOT contain sensitive data.
 */
export class DSAError extends Error {
  constructor(message: string, catched?: Error) {
    const msg: string = catched !== undefined ? `${message} - ${catched.message}` : message;
    super(msg);
    this.name = 'DSAError';
  }
}

/**
 * Provide all the services for handling ECDSA NIST P-256,
 * also known as secp256r1 or prime256v1.
 * https://github.com/prebid/addressability-framework/blob/main/mvp-spec/security-signatures.md
 */
export class ECDSA_NIT_P256Builder implements IDSABuilder {
  private keyService = new ECDSA_NIT_P256KeyService();

  buildKeyService(): IDSAKeyService {
    return this.keyService;
  }

  buildSigner(privateKey: PEM): IDSASigner {
    const privateKeyObj = createPrivateKey(privateKey);
    const keyValidation = this.keyService.validatePrivateKey(privateKeyObj);
    if (!keyValidation.valid) {
      throw new DSAError(`Cannot create ECDSA_NIT_P256 signer: ${keyValidation.errorReason}`);
    }
    const signer = new ECDSASigner(privateKeyObj);
    return signer;
  }

  buildVerifier(publicKey: PEM): IDSAVerifier {
    const publicKeyObj = createPublicKey(publicKey);
    const keyValidation = this.keyService.validatePublicKey(publicKeyObj);
    if (!keyValidation.valid) {
      throw new DSAError(`Cannot create ECDSA_NIT_P256 verifier: ${keyValidation.errorReason}`);
    }
    const verifier = new ECDSAVerifier(publicKeyObj);
    return verifier;
  }
}

class ECDSA_NIT_P256KeyService implements IDSAKeyService {
  generateKeys(): DSAKeyPair {
    const cryptoPair = generateKeyPairSync('ec', {
      // NIST P-256, also known as secp256r1 or prime256v1.
      // https://github.com/nodejs/node/blob/v15.12.0/deps/openssl/openssl/crypto/ec/ec_curve.c#L3163
      namedCurve: 'P-256',
    });
    const pair: DSAKeyPair = {
      privateKey: cryptoPair.privateKey.export({
        type: 'sec1',
        format: 'pem',
      }) as PEM,
      publicKey: cryptoPair.publicKey.export({
        type: 'spki',
        format: 'pem',
      }) as PEM,
    };
    return pair;
  }

  validatePublicKey(key: PEM | KeyObject): DSAKeyValidation {
    // createPublicKey(..) can derivate a public key from a private key.
    // So we check before if the key at the PEM format contains 'PRIVATE KEY'.
    if (!(key instanceof KeyObject) && key.toString().includes('PRIVATE KEY')) {
      return {
        valid: false,
        errorReason: 'Provided a private key instead of a public key',
      };
    }

    try {
      const keyObj: KeyObject = key instanceof KeyObject ? key : createPublicKey(key);
      if (!this.validateKey(keyObj) || keyObj.type !== 'public') {
        return {
          valid: false,
          errorReason: `Invalid public key: ${this.getKeyObjectDetail(keyObj)}`,
        };
      }
      return {
        valid: true,
      };
    } catch (err) {
      return {
        valid: false,
        errorReason: `Invalid public key: ${err}`,
      };
    }
  }

  validatePrivateKey(key: PEM | KeyObject): DSAKeyValidation {
    try {
      const keyObj: KeyObject = key instanceof KeyObject ? key : createPrivateKey(key);
      if (!this.validateKey(keyObj) || keyObj.type !== 'private') {
        return {
          valid: false,
          errorReason: `Invalid private key: ${this.getKeyObjectDetail(keyObj)}`,
        };
      }
      return {
        valid: true,
      };
    } catch (err) {
      return {
        valid: false,
        errorReason: `Invalid private key: ${err}`,
      };
    }
  }

  private validateKey(keyObj: KeyObject): boolean {
    return keyObj.asymmetricKeyType === 'ec' && keyObj.asymmetricKeyDetails.namedCurve === 'prime256v1';
  }

  private getKeyObjectDetail(keyObj: KeyObject): string {
    return `${keyObj.type} - ${keyObj.asymmetricKeyType} - ${keyObj.asymmetricKeyDetails.namedCurve}`;
  }
}

class ECDSASigner implements IDSASigner {
  constructor(private privateKey: KeyObject) {}

  sign(data: string): Promise<Signature> {
    return new Promise<Signature>((resolve, reject) => {
      const dataBuffer: NodeJS.ArrayBufferView = Buffer.from(data);
      sign('sha256', dataBuffer, this.privateKey, (err, signatureBuffer) => {
        if (err !== null) {
          const error = new DSAError(`Failed to sign '${data}'`, err);
          reject(error);
        } else {
          const signature = signatureBuffer.toString('base64');
          resolve(signature);
        }
      });
    });
  }
}

class ECDSAVerifier implements IDSAVerifier {
  constructor(private publicKey: KeyObject) {}

  verify(data: string, signature: Signature): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      const dataBuffer: NodeJS.ArrayBufferView = Buffer.from(data);
      const signatureBuffer: NodeJS.ArrayBufferView = Buffer.from(signature, 'base64');
      verify('sha256', dataBuffer, this.publicKey, signatureBuffer, (err, result) => {
        if (err !== null) {
          const error = new DSAError(`Failed to verify '${data}'`, err);
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
}
