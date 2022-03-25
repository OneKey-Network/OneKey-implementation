import {
  getNewId,
  writeIdsAndPref,
  getIdsAndPreferences,
  signPreferences,
  refreshIdsAndPreferences,
} from '../../src/lib/paf-lib';
import { CookiesHelpers, getFakeIdentifiers, getFakePreferences } from '../helpers/cookies';
import { Cookies } from '@core/cookies';
import { PafStatus } from '@core/operator-client-commons';
import { Identifier } from '@core/model/generated-model';

const proxyHostName = 'http://localhost';

describe('Function getIdsAndPreferences', () => {
  beforeEach(() => {
    CookiesHelpers.clearPafCookies();
  });

  test('should return undefined with no cookies', () => {
    expect(getIdsAndPreferences()).toBeUndefined();
  });

  test('should return value stored in cookies', () => {
    const fakeId = 'FAKE_TEST_ID';
    const testConsent = false;

    CookiesHelpers.mockIdentifiers(fakeId);
    CookiesHelpers.mockPreferences(testConsent);
    expect(getIdsAndPreferences()).toEqual({
      preferences: getFakePreferences(testConsent),
      identifiers: getFakeIdentifiers(fakeId),
    });
  });

  test('should return undefined if user is not participating', () => {
    CookiesHelpers.setCookies(Cookies.preferences, PafStatus.NOT_PARTICIPATING);
    CookiesHelpers.setCookies(Cookies.identifiers, PafStatus.NOT_PARTICIPATING);
    expect(getIdsAndPreferences()).toBeUndefined();
  });

  test('should return undefined if redirect is needed', () => {
    CookiesHelpers.setCookies(Cookies.preferences, PafStatus.REDIRECT_NEEDED);
    CookiesHelpers.setCookies(Cookies.identifiers, PafStatus.REDIRECT_NEEDED);
    expect(getIdsAndPreferences()).toBeUndefined();
  });
});

describe('Function getNewId', () => {
  const FAKE_ID = 'A-B-TEST-ID';

  beforeEach(() => {
    const identifiers = getFakeIdentifiers(FAKE_ID);
    global.fetch = jest.fn((input: RequestInfo, init?: RequestInit): Promise<Response> => {
      return Promise.resolve({
        json: () => Promise.resolve({ body: { identifiers } }),
      } as Response);
    });
  });

  test('should return new ID', async () => {
    try {
      const identifier: Identifier = await getNewId({ proxyHostName });
      expect(identifier.value).toBe(FAKE_ID);
    } catch (error) {
      throw new Error(error);
    }
  });
});
