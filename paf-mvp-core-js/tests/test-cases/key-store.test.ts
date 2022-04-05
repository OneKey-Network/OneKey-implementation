import { PublicKeyStore } from '@core/express/key-store';
import { GetIdentityResponse, Timestamp } from '@core/model/generated-model';
import mockAxios from 'jest-mock-axios';
import { publicKeyFromString } from '@core/crypto/keys';
import { getTimeStampInSec } from '@core/timestamp';

interface KeyInfo {
  key: string;
  start: Timestamp;
  end?: Timestamp;
}

describe('key store', () => {
  beforeEach(() => {
    mockAxios.reset();
  });

  const nowTimestampSeconds = getTimeStampInSec();

  const oldKey: KeyInfo = {
    key: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEl0278pcupaxUfiqHJ9AG9gVMyIO+
n07PJaNI22v+s7hR1Hkb71De6Ot5Z4JLoZ7aj1xYhFcQJsYkFlXxcBWfRQ==
-----END PUBLIC KEY-----`,
    start: nowTimestampSeconds - 3 * 3600, // 3 hours in the past
    end: nowTimestampSeconds - 3600, // 1 hour in the past
  };

  const currentKey: KeyInfo = {
    key: `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEUnarwp0gUZgjb9fsYNLcNrddNKV5
h4/WfMRMVh3HIqojt3LIsvUQig1rm9ZkcNx+IHZVhDM+hso2sXlGjF9xOQ==
-----END PUBLIC KEY-----`,
    start: nowTimestampSeconds - 3600, // 1 hour in the past
    end: nowTimestampSeconds + 3600, // 1 hour in the future
  };

  test('returns known key and cache it', async () => {
    const mockIdentity: GetIdentityResponse = {
      version: '1.0',
      type: 'vendor',
      name: 'My domain',
      keys: [oldKey, currentKey],
    };

    const keyStore = new PublicKeyStore({});
    const call = keyStore.getPublicKey('domain.com');

    mockAxios.mockResponse({ data: mockIdentity });

    const expectedKey = {
      start: new Date(currentKey.start * 1000),
      end: new Date(currentKey.end * 1000),
      publicKey: currentKey.key,
      publicKeyObj: publicKeyFromString(currentKey.key),
    };

    expect(await call).toEqual(expectedKey);

    expect(mockAxios.get).toHaveBeenCalledWith('https://domain.com/paf/v1/identity');

    expect(await call).toEqual(expectedKey);

    mockAxios.reset();

    expect(mockAxios.get).toHaveBeenCalledTimes(0);
  });

  test('returns key with no end date', async () => {
    const mockIdentity: GetIdentityResponse = {
      version: '1.0',
      type: 'vendor',
      name: 'My domain',
      keys: [
        oldKey,
        {
          ...currentKey,
          end: undefined, // No end date
        },
      ],
    };

    const keyStore = new PublicKeyStore({});
    const call = keyStore.getPublicKey('domain.com');

    mockAxios.mockResponse({ data: mockIdentity });

    const expectedKey = {
      start: new Date(currentKey.start * 1000),
      publicKey: currentKey.key,
      publicKeyObj: publicKeyFromString(currentKey.key),
    };

    expect(await call).toEqual(expectedKey);
  });

  test('throws if no key matches', async () => {
    const mockIdentity: GetIdentityResponse = {
      version: '1.0',
      type: 'vendor',
      name: 'My domain',
      keys: [oldKey],
    };

    const keyStore = new PublicKeyStore({});
    const call = keyStore.getPublicKey('domain.com');

    mockAxios.mockResponse({ data: mockIdentity });

    await expect(call).rejects.toThrow();
  });

  test('throws on network error', async () => {
    const keyStore = new PublicKeyStore({});
    const call = keyStore.getPublicKey('domain.com');

    mockAxios.mockError(new Error('Network error'));

    await expect(call).rejects.toThrow();
  });

  test('throws on 404', async () => {
    const keyStore = new PublicKeyStore({});
    const call = keyStore.getPublicKey('domain.com');

    mockAxios.mockResponse({
      data: {},
      status: 404,
      statusText: 'Not found',
      headers: {},
      config: {},
    });

    await expect(call).rejects.toThrow();
  });
});
