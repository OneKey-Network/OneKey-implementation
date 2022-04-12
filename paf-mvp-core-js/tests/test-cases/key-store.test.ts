import { PublicKeyInfo, PublicKeyStore } from '@core/crypto/key-store';
import { GetIdentityResponse, Timestamp } from '@core/model/generated-model';
import { publicKeyFromString } from '@core/crypto/keys';
import { getTimeStampInSec } from '@core/timestamp';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MockTimer } from '../helpers/timestamp.helper';

interface KeyInfo {
  key: string;
  start: Timestamp;
  end?: Timestamp;
}

describe('key store', () => {
  // This sets the mock adapter on the default instance
  const mock = new MockAdapter(axios);

  beforeEach(() => {
    mock.reset();
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

    const keyStore = new PublicKeyStore({}, axios.create({}));

    mock.onGet().reply(200, mockIdentity);

    const expectedKey: PublicKeyInfo = {
      startTimestampInSec: currentKey.start,
      endTimestampInSec: currentKey.end,
      publicKey: currentKey.key,
      publicKeyObj: publicKeyFromString(currentKey.key),
    };

    // Two consecutive calls
    expect(await keyStore.getPublicKey('domain.com')).toEqual(expectedKey);
    expect(await keyStore.getPublicKey('domain.com')).toEqual(expectedKey);

    // Only one HTTP refresh
    expect(mock.history.get.length).toBe(1);
    expect(mock.history.get[0].url).toEqual('https://domain.com/paf/v1/identity');
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

    mock.onGet().reply(200, mockIdentity);

    const expectedKey: PublicKeyInfo = {
      startTimestampInSec: currentKey.start,
      // No end date
      publicKey: currentKey.key,
      publicKeyObj: publicKeyFromString(currentKey.key),
    };

    // Two consecutive calls
    expect(await keyStore.getPublicKey('domain.com')).toEqual(expectedKey);
    expect(await keyStore.getPublicKey('domain.com')).toEqual(expectedKey);

    // Only one HTTP refresh
    expect(mock.history.get.length).toBe(1);
  });

  test('will refresh keys that expire', async () => {
    const mockIdentity: GetIdentityResponse = {
      version: '1.0',
      type: 'vendor',
      name: 'My domain',
      keys: [oldKey, currentKey],
    };

    // Provide mock timer
    const mockTimer = new MockTimer(nowTimestampSeconds - 2 * 3600); // happens 2 hours in the past
    const keyStore = new PublicKeyStore({}, axios.create(), () => mockTimer.timestamp);

    mock.onGet().reply(200, mockIdentity);

    const expectedOldKey: PublicKeyInfo = {
      startTimestampInSec: oldKey.start,
      endTimestampInSec: oldKey.end,
      publicKey: oldKey.key,
      publicKeyObj: publicKeyFromString(oldKey.key),
    };

    // First call will query it
    expect(await keyStore.getPublicKey('domain.com')).toEqual(expectedOldKey);
    expect(mock.history.get.length).toBe(1);

    // Second call later => key is out of date and will be refreshed
    mockTimer.timestamp = nowTimestampSeconds;

    const expectedNewKey: PublicKeyInfo = {
      startTimestampInSec: currentKey.start,
      endTimestampInSec: currentKey.end,
      publicKey: currentKey.key,
      publicKeyObj: publicKeyFromString(currentKey.key),
    };

    expect(await keyStore.getPublicKey('domain.com')).toEqual(expectedNewKey);
    expect(mock.history.get.length).toBe(2);
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

    mock.onGet().reply(200, mockIdentity);

    await expect(call).rejects.toThrow();
  });

  test('throws on network error', async () => {
    const keyStore = new PublicKeyStore({});
    const call = keyStore.getPublicKey('domain.com');

    mock.onGet().networkError();

    await expect(call).rejects.toThrow();
  });

  test('throws on 404', async () => {
    const keyStore = new PublicKeyStore({});
    const call = keyStore.getPublicKey('domain.com');

    mock.onGet().reply(404);

    await expect(call).rejects.toThrow();
  });
});
