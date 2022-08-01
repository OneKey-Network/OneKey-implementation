import { CookiesHelpers, getFakeIdentifier, getFakeIdentifiers, getFakePreferences } from '../helpers/cookies';
import { Cookies } from '@core/cookies';
import { PafStatus } from '../../src/enums/status.enum';
import {
  Error,
  GetIdsPrefsResponse,
  Identifier,
  IdsAndPreferences,
  PostSeedResponse,
  TransactionId,
} from '@core/model/generated-model';
import fetch from 'jest-fetch-mock';
import { isBrowserKnownToSupport3PC } from '@core/user-agent';
import { MockedFunction } from 'ts-jest';
import { IdsAndPreferencesResult, OneKeyLib, SeedEntry } from '@frontend/lib/paf-lib';
import { IAuditLogStorageService } from '@frontend/services/audit-log-storage.service';
import { ISeedStorageService } from '@frontend/services/seed-storage.service';
import { DEFAULT_TTL_IN_SECONDS, MAXIMUM_TTL_IN_SECONDS } from '@frontend/utils/cookie';

jest.mock('@core/user-agent', () => ({ isBrowserKnownToSupport3PC: jest.fn() }));
jest.mock('ua-parser-js', () => () => ({ getBrowser: () => 'JEST-DOM' }));

const pafClientNodeHost = 'http://localhost';

let lib: OneKeyLib;
let notificationHandler: jest.Mock<Promise<void>, []>;

const auditLogStorageService: IAuditLogStorageService = {
  saveAuditLog: jest.fn(),
  getAuditLogByDivId: jest.fn(),
};
const seedEntry: SeedEntry = {
  seed: undefined,
  idsAndPreferences: undefined,
};
const seedStorageService: ISeedStorageService = {
  saveSeed: jest.fn(),
  getSeed: jest.fn((transactionId: TransactionId) => seedEntry),
};
const resetLib = () => {
  lib = new OneKeyLib(pafClientNodeHost, true, auditLogStorageService, seedStorageService);
  notificationHandler = jest.fn(() => Promise.resolve());
  lib.setNotificationHandler(notificationHandler);
};

afterEach(() => {
  // cleaning up the mess left behind the previous test
  fetch.resetMocks();
});

describe('Function getIdsAndPreferences', () => {
  beforeEach(() => {
    resetLib();
    CookiesHelpers.clearPafCookies();
  });

  /* FIXME update with a scenario where refresh() is implemented
  test('should return undefined with no cookies', () => {
    await expect(getIdsAndPreferences()).resolves.toBeUndefined();
  });
   */

  test('should return value stored in cookies', async () => {
    const fakeId = 'FAKE_TEST_ID';
    const testConsent = false;

    CookiesHelpers.mockIdentifiers(fakeId);
    CookiesHelpers.mockPreferences(testConsent);
    CookiesHelpers.mockRefreshTime();
    await expect(lib.getIdsAndPreferences()).resolves.toEqual({
      data: {
        preferences: getFakePreferences(testConsent),
        identifiers: getFakeIdentifiers(fakeId),
      },
      status: PafStatus.PARTICIPATING,
    });
  });

  test('should return undefined if refreshTime is missing', async () => {
    const fakeId = 'FAKE_TEST_ID';
    const testConsent = false;

    CookiesHelpers.mockIdentifiers(fakeId);
    CookiesHelpers.mockPreferences(testConsent);

    await expect(lib.getIdsAndPreferences()).resolves.toEqual({
      status: PafStatus.REDIRECTING,
    });
  });

  test('should return undefined if user is not participating', async () => {
    CookiesHelpers.setCookies(Cookies.preferences, PafStatus.NOT_PARTICIPATING);
    CookiesHelpers.setCookies(Cookies.preferences, PafStatus.NOT_PARTICIPATING);
    CookiesHelpers.mockRefreshTime();
    await expect(lib.getIdsAndPreferences()).resolves.toEqual({
      status: PafStatus.NOT_PARTICIPATING,
    });
  });

  test('should return undefined if redirect is needed', async () => {
    lib.triggerRedirectIfNeeded = false;
    CookiesHelpers.setCookies(Cookies.preferences, PafStatus.REDIRECT_NEEDED);
    CookiesHelpers.setCookies(Cookies.identifiers, PafStatus.REDIRECT_NEEDED);
    CookiesHelpers.mockRefreshTime();
    await expect(lib.getIdsAndPreferences()).resolves.toEqual({
      status: PafStatus.REDIRECT_NEEDED,
    });

    lib.triggerRedirectIfNeeded = true;
  });
});

describe('Function getNewId', () => {
  const FAKE_ID = 'A-B-TEST-ID';

  beforeEach(() => {
    resetLib();
  });

  test('should return new ID', async () => {
    const identifiers = getFakeIdentifiers(FAKE_ID);
    fetch.mockResponses(
      'operatorURLGet', // Call to the proxy to get the operator URL
      JSON.stringify(<GetIdsPrefsResponse>{ body: { identifiers } }) // Actual call to the operator
    );
    try {
      const identifier: Identifier = await lib.getNewId();
      expect(identifier.value).toBe(FAKE_ID);
      expect(fetch.mock.calls.length).toEqual(2);
    } catch (error) {
      throw new Error(error);
    }
  });
});

// FIXME test updateIdsAndPreferences
/*
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

 */

describe('Function refreshIdsAndPreferences', () => {
  const realLocation = location;
  beforeEach(() => {
    resetLib();
  });

  describe('when redirect needed', () => {
    const redirectMock = jest.fn();
    const realLocation = location;

    beforeAll(() => {
      delete global.location;
      global.location = {
        replace: redirectMock,
        href: 'http://localhost',
      } as unknown as Location;
      CookiesHelpers.setCookies(Cookies.identifiers, PafStatus.REDIRECT_NEEDED);
    });

    afterAll(() => {
      CookiesHelpers.clearPafCookies();
      global.location = realLocation;
    });

    test('should redirect', async () => {
      lib.triggerRedirectIfNeeded = false;
      let result = await lib.refreshIdsAndPreferences();

      expect(global.location.replace).not.toBeCalled();
      expect(result).toEqual({
        status: PafStatus.REDIRECT_NEEDED,
      });

      lib.triggerRedirectIfNeeded = true;

      result = await lib.refreshIdsAndPreferences();

      expect(redirectMock).toBeCalled();

      expect(result).toEqual({
        status: PafStatus.REDIRECTING,
      });
    });
  });

  describe('when local cookies', () => {
    const fakeId = 'FAKE_IDENTIFIER';

    beforeAll(() => {
      CookiesHelpers.mockPreferences(true);
      CookiesHelpers.mockIdentifiers(fakeId);
      CookiesHelpers.mockRefreshTime();
    });

    afterAll(() => {
      CookiesHelpers.clearPafCookies();
    });

    test('should return cookies value', async () => {
      const result = await lib.refreshIdsAndPreferences();

      expect(result).toEqual({
        status: PafStatus.PARTICIPATING,
        data: {
          identifiers: getFakeIdentifiers(fakeId),
          preferences: getFakePreferences(true),
        },
      });
    });
  });

  const cases = [
    {
      cachedCookies: false,
      message: 'no local cookies',
    },
    {
      cachedCookies: true,
      message: 'local cookies expired',
    },
  ];

  describe.each(cases)('when $message', (data) => {
    const fakeId = 'FAKE_IDENTIFIER';

    beforeAll(() => {
      if (data.cachedCookies) {
        CookiesHelpers.mockPreferences(true);
        CookiesHelpers.mockIdentifiers(fakeId);
        // Note: no refreshTime => ids and preferences must be considered expired
      }
    });

    afterAll(() => {
      CookiesHelpers.clearPafCookies();
      lib.triggerRedirectIfNeeded = true;
    });

    describe('when browser is known to support 3PC', () => {
      beforeAll(() => {
        (isBrowserKnownToSupport3PC as MockedFunction<typeof isBrowserKnownToSupport3PC>).mockImplementation(
          () => true
        );
      });

      test('should return data from operator', async () => {
        fetch.mockResponses(
          // Call to the proxy to get the operator URL
          'operatorURLGet1',
          // Actual call to the operator
          JSON.stringify(<GetIdsPrefsResponse>{
            body: {
              identifiers: getFakeIdentifiers(),
              preferences: getFakePreferences(),
            },
          })
        );
        const result = await lib.refreshIdsAndPreferences();

        expect(isBrowserKnownToSupport3PC).toHaveBeenCalled();
        expect(result).toEqual({
          status: PafStatus.PARTICIPATING,
          data: {
            identifiers: getFakeIdentifiers(),
            preferences: getFakePreferences(),
          },
        });
        expect(document.cookie).toContain(`${Cookies.identifiers}=${JSON.stringify(getFakeIdentifiers())}`);
        expect(document.cookie).toContain(`${Cookies.preferences}=${JSON.stringify(getFakePreferences())}`);

        CookiesHelpers.clearPafCookies();
      });

      describe("but browser doesn't actually support it", () => {
        beforeAll(() => {
          fetch.mockResponses(
            'operatorURLGet', // Call to the proxy to get the operator URL
            JSON.stringify(<GetIdsPrefsResponse>{
              body: {
                identifiers: [
                  {
                    ...getFakeIdentifier('0c7966db-9e6a-4060-be81-824a9ce671d3'),
                    persisted: false, // A newly generated ID
                  },
                ],
              },
            }), // Actual call to the operator
            'operatorURLCheck3PC', // Call to the proxy to get the operator URL
            JSON.stringify(<Error>{
              message: 'No 3PC supported',
            }) // Actual call to the operator
          );
        });

        test('should require redirect', async () => {
          lib.triggerRedirectIfNeeded = false;
          const result = await lib.refreshIdsAndPreferences();

          expect(isBrowserKnownToSupport3PC).toHaveBeenCalled();
          expect(result).toEqual({
            status: PafStatus.REDIRECT_NEEDED,
          });
          expect(document.cookie).toContain(`${Cookies.identifiers}="${PafStatus.REDIRECT_NEEDED}"`);
          expect(document.cookie).toContain(`${Cookies.preferences}="${PafStatus.REDIRECT_NEEDED}"`);

          CookiesHelpers.clearPafCookies();
          lib.triggerRedirectIfNeeded = true;
        });
      });

      describe('when browser is known NOT to support 3PC', () => {
        const replaceMock = jest.fn();
        beforeAll(() => {
          (isBrowserKnownToSupport3PC as MockedFunction<typeof isBrowserKnownToSupport3PC>).mockImplementation(
            () => false
          );
          delete global.location;
          global.location = {
            replace: replaceMock,
            href: 'http://localhost/my-page.html?foo=bar',
          } as unknown as Location;
        });

        afterAll(() => {
          global.location = realLocation;
        });

        test('triggers redirect', async () => {
          await lib.refreshIdsAndPreferences();

          expect(replaceMock).toHaveBeenCalled();
        });
      });
    });

    describe('when redirect has been deferred', () => {
      test('should return status "redirect needed"', async () => {
        CookiesHelpers.setCookies(Cookies.identifiers, PafStatus.REDIRECT_NEEDED);
        CookiesHelpers.setCookies(Cookies.preferences, PafStatus.REDIRECT_NEEDED);
        CookiesHelpers.mockRefreshTime();

        const result = await lib.refreshIdsAndPreferences();

        expect(result).toEqual(<IdsAndPreferencesResult>{
          status: PafStatus.REDIRECTING,
        });
      });
    });
  });
});

describe('Function signPreferences', () => {
  test('should return fetch response', async () => {
    resetLib();
    const mockResponse = { body: 'response' };
    fetch.mockResponseOnce(JSON.stringify(mockResponse));
    const input = { unsignedPreferences: getFakePreferences(), identifiers: getFakeIdentifiers() };
    const result = await lib.signPreferences(input);
    expect(result).toEqual(mockResponse);
  });
});

describe('Function createSeed', () => {
  const transmission_ids = ['1234', '5678'];
  const idsAndPreferences: IdsAndPreferences = {
    preferences: getFakePreferences(true),
    identifiers: getFakeIdentifiers(),
  };
  const response: PostSeedResponse = {
    version: '0.1',
    transaction_ids: transmission_ids,
    publisher: pafClientNodeHost,
    source: {
      domain: 'proxyHostName',
      timestamp: 123454,
      signature: 'signature_value',
    },
  };

  beforeEach(() => {
    resetLib();
    CookiesHelpers.clearPafCookies();
    CookiesHelpers.setIdsAndPreferences(idsAndPreferences);
    fetch.mockResponseOnce(JSON.stringify(response));
  });

  afterEach(() => {
    CookiesHelpers.clearPafCookies();
    fetch.resetMocks();
  });

  test('with empty transmission_ids', async () => {
    const seed = await lib.createSeed([]);
    expect(seed).toBeUndefined();
  });

  test('nominal path', async () => {
    const entry = await lib.createSeed(transmission_ids);
    expect(entry).toEqual({
      seed: response,
      idsAndPreferences,
    });
  });
});
describe('Function handleAfterBoomerangRedirect', () => {
  const realLocation = location;
  const historySpy = jest.spyOn(global.history, 'pushState');
  const uriData = 'TEST-STRING';
  const identifier = getFakeIdentifiers()[0];
  const preferences = getFakePreferences(true);

  beforeEach(() => {
    resetLib();
    delete global.location;
    global.location = {
      search: `?paf=${uriData}`,
      href: 'fake-href?foo=42&paf=TO_BE_REMOVED&baz=bar',
    } as unknown as Location;
  });

  afterEach(() => {
    historySpy.mockClear();
    CookiesHelpers.clearPafCookies();
  });

  afterAll(() => {
    global.location = realLocation;
  });

  test('should clean paf parameter in the URI', async () => {
    fetch.mockResponseOnce(JSON.stringify({ body: { identifiers: [] } }));

    await lib.handleAfterBoomerangRedirect();

    expect(historySpy).toBeCalledWith(null, '', 'fake-href?foo=42&baz=bar');
  });

  test('should verify uriData', async () => {
    // Just one call to the proxy to verify data
    fetch.mockResponseOnce(JSON.stringify({ body: { identifiers: [] } }));

    await lib.handleAfterBoomerangRedirect();

    expect(fetch.mock.calls[0][1].body).toBe(uriData);
  });

  test('should throw an error if empty response received', async () => {
    fetch.mockResponseOnce('null');
    await expect(lib.handleAfterBoomerangRedirect()).rejects.toBe('Verification failed');
  });

  test('should save NOT_PARTICIPATING, if no preferences received', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        body: {
          identifiers: [],
          preferences: undefined,
        },
      })
    );
    await lib.handleAfterBoomerangRedirect();

    expect(document.cookie).toContain(`${Cookies.identifiers}=NOT_PARTICIPATING`);
    expect(document.cookie).toContain(`${Cookies.preferences}=NOT_PARTICIPATING`);
  });

  test('should save persistedIds to Cookies', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        body: {
          identifiers: [identifier],
          preferences,
        },
      })
    );

    await lib.handleAfterBoomerangRedirect();

    expect(document.cookie).toContain(JSON.stringify(identifier));
    expect(document.cookie).toContain(JSON.stringify(preferences));
  });

  test('should not display notification if no change', async () => {
    fetch.mockResponseOnce(
      JSON.stringify({
        body: {
          identifiers: [identifier],
          preferences,
        },
      })
    );

    await lib.handleAfterBoomerangRedirect();

    expect(notificationHandler).toBeCalledWith('PERSONALIZED');
  });

  test('should display notification if any change', async () => {
    CookiesHelpers.mockIdentifiers(identifier.value);
    CookiesHelpers.mockPreferences(false); // Will be different in URI
    fetch.mockResponseOnce(
      JSON.stringify({
        body: {
          identifiers: [identifier],
          preferences,
        },
      })
    );

    await lib.handleAfterBoomerangRedirect();

    expect(notificationHandler).toBeCalledWith('PERSONALIZED');
  });
});
describe('Cookie TTL setting', () => {
  const lib = new OneKeyLib(pafClientNodeHost, true, auditLogStorageService, seedStorageService);
  test('should use the default value when no value was specified', () => {
    const ttlInSeconds = lib.parseCookieTTL(undefined);
    expect(ttlInSeconds).toEqual(DEFAULT_TTL_IN_SECONDS);
  });
  test('should use the default value when the specified one is mal formatted', () => {
    const ttlInSeconds = lib.parseCookieTTL('SOME_RANDOM_STRING');
    expect(ttlInSeconds).toEqual(DEFAULT_TTL_IN_SECONDS);
  });
  test('should use the maximum allowed value when the specified one is too big', () => {
    const ttlInSeconds = lib.parseCookieTTL('P1M'); // one month
    expect(ttlInSeconds).toEqual(MAXIMUM_TTL_IN_SECONDS);
  });
  const cases = [
    {
      input: 'PT1M', // one minute
      expectedOutput: 60,
    },
    {
      input: 'PT15M51S', // 15 minutes and 51 seconds
      expectedOutput: 951,
    },
    {
      input: 'PT2H30M', // Two and a half hours
      expectedOutput: 9000,
    },
    {
      input: 'P3DT4H59M', // Three days, four hours and 59 minutes
      expectedOutput: 277140,
    },
  ];
  test.each(cases)('should use specified value when it is correct ($input)', (data) => {
    const ttlInSeconds = lib.parseCookieTTL(data.input);
    expect(ttlInSeconds).toEqual(data.expectedOutput);
  });
});
