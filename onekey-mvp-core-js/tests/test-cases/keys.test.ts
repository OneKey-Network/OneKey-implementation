import { generateKeyPair } from '@core/crypto/keys';
import { EOL } from 'os';

describe('Keys', () => {
  test('should generate valid PEM keys', () => {
    const { publicKey, privateKey } = generateKeyPair();

    expect(publicKey.startsWith(`-----BEGIN PUBLIC KEY-----${EOL}`)).toBe(true);
    expect(publicKey.endsWith(`${EOL}-----END PUBLIC KEY-----${EOL}`)).toBe(true);

    expect(privateKey.startsWith(`-----BEGIN PRIVATE KEY-----${EOL}`)).toBe(true);
    expect(privateKey.endsWith(`${EOL}-----END PRIVATE KEY-----${EOL}`)).toBe(true);
  });
});
