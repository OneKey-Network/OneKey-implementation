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
import { Identifier, IdsAndPreferences } from '@core/model/generated-model';
import fetch from 'jest-fetch-mock';

const proxyHostName = 'http://localhost';

afterEach(() => {
  // cleaning up the mess left behind the previous test
  fetch.resetMocks();
});

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

  test('should return new ID', async () => {
    const identifiers = getFakeIdentifiers(FAKE_ID);
    fetch.mockResponseOnce(JSON.stringify({ body: { identifiers } }));
    try {
      const identifier: Identifier = await getNewId({ proxyHostName });
      expect(identifier.value).toBe(FAKE_ID);
      expect(fetch.mock.calls.length).toEqual(1);
    } catch (error) {
      throw new Error(error);
    }
  });
});

describe('Function writeIdsAndPref', () => {
  const idAndPreferences: IdsAndPreferences = {
    preferences: getFakePreferences(true),
    identifiers: getFakeIdentifiers(),
  };

  describe('without 3PC', () => {
    const redirectUrl = new URL('http://redirect-url.fake');
    const redirectMock = jest.fn();
    const realLocation = location;

    beforeEach(() => {
      delete global.location;
      global.location = {
        replace: redirectMock,
      } as unknown as Location;
    });

    afterEach(() => {
      redirectMock.mockClear();
      global.location = realLocation;
    });

    test('should redirect to operator', async () => {
      await writeIdsAndPref({ proxyHostName, redirectUrl }, idAndPreferences);

      expect(redirectMock.mock.calls.length).toBe(1);
      // FIXME: redirect Url is changed inside writeIdsAndPref
      expect(redirectMock.mock.calls[0][0]).toBe(redirectUrl.toString());
    });
  });
});
