import { readFileSync } from 'fs';
import path from 'path';
import { DSAKeyPair, ECDSA_NIT_P256Builder, IDSAKeyService, PEM } from '@core/crypto/digital-signature';

describe('ECDSA_NIT_P256', () => {
  const validPair: DSAKeyPair = {
    privateKey: getFixture('ECDSA_NIT_P256-private-key.pem'),
    publicKey: getFixture('ECDSA_NIT_P256-public-key.pem'),
  };

  const invalidPair: DSAKeyPair = {
    privateKey: getFixture('ECDSA_secp256k1-private-key.pem'),
    publicKey: getFixture('ECDSA_secp256k1-public-key.pem'),
  };

  let builder: ECDSA_NIT_P256Builder;
  let keyService: IDSAKeyService;

  beforeEach(() => {
    builder = new ECDSA_NIT_P256Builder();
    keyService = builder.buildKeyService();
  });

  test('Validate public key', () => {
    const validation = keyService.validatePublicKey(validPair.publicKey);
    expect(validation.errorReason).toBeUndefined();
    expect(validation.valid).toBeTruthy();
  });

  test('Validate private key', () => {
    const validation = keyService.validatePrivateKey(validPair.privateKey);
    expect(validation.errorReason).toBeUndefined();
    expect(validation.valid).toBeTruthy();
  });

  test('Validate generated pair', () => {
    const pair = keyService.generateKeys();

    const privateKeyValidation = keyService.validatePrivateKey(pair.privateKey);
    const publicKeyValidation = keyService.validatePublicKey(pair.publicKey);

    expect(privateKeyValidation.errorReason).toBeUndefined();
    expect(publicKeyValidation.errorReason).toBeUndefined();
    expect(privateKeyValidation.valid).toBeTruthy();
    expect(publicKeyValidation.valid).toBeTruthy();
  });

  test('Invalidate secp256k1 public key', () => {
    const validation = keyService.validatePublicKey(invalidPair.publicKey);
    expect(validation.valid).toBeFalsy();
  });

  test('Invalidate secp256k1 private key', () => {
    const validation = keyService.validatePrivateKey(invalidPair.privateKey);
    expect(validation.valid).toBeFalsy();
  });

  test('Invalidate public key because invalid PEM format', () => {
    const keyStr = validPair.privateKey.toString();
    const invalidPEM = keyStr.substring(0, keyStr.length / 2);
    const validation = keyService.validatePublicKey(invalidPEM);
    expect(validation.valid).toBeFalsy();
  });

  test('Invalidate public key because receiving private key', () => {
    const validation = keyService.validatePublicKey(validPair.privateKey);
    expect(validation.valid).toBeFalsy();
  });

  test('Invalidate private key because receiving public key', () => {
    const validation = keyService.validatePrivateKey(validPair.publicKey);
    expect(validation.valid).toBeFalsy();
  });

  test('Verify with invalid signature', async () => {
    const verifier = builder.buildVerifier(validPair.publicKey);
    const valid = await verifier.verify('test', 'signature');
    expect(valid).toBeFalsy();
  });

  test('Sign', async () => {
    const signer = builder.buildSigner(validPair.privateKey);
    const signature = await signer.sign('test');
    expect(signature.length).toBeGreaterThan(0);
  });

  test('Sign and verify', async () => {
    const signer = builder.buildSigner(validPair.privateKey);
    const verifier = builder.buildVerifier(validPair.publicKey);

    const signature = await signer.sign('test');
    const valid = await verifier.verify('test', signature);

    expect(valid).toBeTruthy();
  });
});

function getFixture(keyname: string): PEM {
  const fixturePath: string = path.join(__dirname, '..', 'fixtures', keyname);
  const content = readFileSync(fixturePath, { encoding: 'utf8' }) as PEM;
  return content;
}
