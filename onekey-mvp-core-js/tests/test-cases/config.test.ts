import { Config, JSONConfig, parseConfig } from '@core/express/config';
import mock from 'mock-fs';

describe('parseConfig', () => {
  const configFile = <JSONConfig>{
    identity: {
      name: 'PAF advertiser',
      dpoEmailAddress: 'contact@www.pafmarket.shop',
      privacyPolicyUrl: 'https://www.pafmarket.shop/privacy',
      keyPairs: [
        {
          startDateTimeISOString: '2022-01-01T12:00:00.000Z',
          endDateTimeISOString: '2022-12-31T12:00:00.000Z',
          privateKeyPath: 'private-key.pem',
          publicKeyPath: 'public-key.pem',
        },
      ],
    },
    host: 'paf.pafmarket.shop',
    operatorHost: 'crto-poc-1.onekey.network',
  };

  const privateKey =
    '-----BEGIN PRIVATE KEY-----\n' +
    'MIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgxrHgVC3uFlEqnqab\n' +
    'cPqLNBFbMbt1tAPsvKy8DBV2m+ChRANCAARSdqvCnSBRmCNv1+xg0tw2t100pXmH\n' +
    'j9Z8xExWHcciqiO3csiy9RCKDWub1mRw3H4gdlWEMz6GyjaxeUaMX3E5\n' +
    '-----END PRIVATE KEY-----\n';

  const publicKey =
    '-----BEGIN PUBLIC KEY-----\n' +
    'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEUnarwp0gUZgjb9fsYNLcNrddNKV5\n' +
    'h4/WfMRMVh3HIqojt3LIsvUQig1rm9ZkcNx+IHZVhDM+hso2sXlGjF9xOQ==\n' +
    '-----END PUBLIC KEY-----';

  afterAll(() => {
    // Back to a real filesystem!
    mock.restore();
  });

  test('should parse valid file', async () => {
    mock({
      'config/': {
        'file.json': JSON.stringify(configFile),
        'private-key.pem': privateKey,
        'public-key.pem': publicKey,
      },
    });

    const config = await parseConfig('config/file.json');

    const expectedConfig = <Config>{
      host: 'paf.pafmarket.shop',
      operatorHost: 'crto-poc-1.onekey.network',
      currentPrivateKey: privateKey,
      identity: {
        name: 'PAF advertiser',
        dpoEmailAddress: 'contact@www.pafmarket.shop',
        privacyPolicyUrl: new URL('https://www.pafmarket.shop/privacy'),
        publicKeys: [
          {
            startTimestampInSec: 1641038400,
            endTimestampInSec: 1672488000,
            publicKey: publicKey,
          },
        ],
      },
    };
    expect(config).toEqual(expectedConfig);
  });

  test('should throw on config file not found', async () => {
    mock({
      'config/': {
        'private-key.pem': privateKey,
        'public-key.pem': publicKey,
      },
    });

    await expect(parseConfig('config/file.json')).rejects.toThrow(/ENOENT.*config\/file.json/);
  });

  test('should throw on private file not found', async () => {
    mock({
      'config/': {
        'file.json': JSON.stringify(configFile),
        'public-key.pem': publicKey,
      },
    });

    await expect(parseConfig('config/file.json')).rejects.toThrow(/ENOENT.*config\/private-key.pem/);
  });

  test('should throw on public file not found', async () => {
    mock({
      'config/': {
        'file.json': JSON.stringify(configFile),
        'private-key.pem': privateKey,
      },
    });

    await expect(parseConfig('config/file.json')).rejects.toThrow(/ENOENT.*config\/public-key.pem/);
  });

  test('should throw on both key files not found', async () => {
    mock({
      'config/': {
        'file.json': JSON.stringify(configFile),
      },
    });

    // TODO do we want to throw with all files not found?
    await expect(parseConfig('config/file.json')).rejects.toThrow(/ENOENT.*config\/public-key.pem/);
  });
});
