import { IdBuilder } from '@core/model/id-builder';

describe('IdBuilder', () => {
  const privateKey =
    '-----BEGIN PRIVATE KEY-----\n' +
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab\n' +
    'cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH\n' +
    'j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5\n' +
    '-----END PRIVATE KEY-----\n';

  const mockSigner = { sign: jest.fn(() => 'signature-value') };
  const idBuilder = new IdBuilder('host.com', privateKey, mockSigner);

  test('Signs id', () => {
    const id = idBuilder.signId('1fb0571c-87ec-41c3-9a91-15fd351968ba', 12345);

    expect(id).toEqual({
      version: '0.1',
      type: 'paf_browser_id',
      value: '1fb0571c-87ec-41c3-9a91-15fd351968ba',
      source: {
        domain: 'host.com',
        timestamp: 12345,
        signature: 'signature-value',
      },
    });

    expect(mockSigner.sign).toHaveBeenCalledTimes(1);
  });

  test('Generates different ids', () => {
    const firstId = idBuilder.generateNewId();
    const secondId = idBuilder.generateNewId();

    expect(firstId.value).not.toEqual(secondId.value);
  });
});
