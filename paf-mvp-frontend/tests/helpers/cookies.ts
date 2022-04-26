import { Cookies } from '@core/cookies';
import { Identifiers, Preferences, IdsAndPreferences, Identifier } from '@core/model/generated-model';

const timestamp = Date.now();

export const getFakePreferences = (consent = true): Preferences => ({
  version: '0.1',
  data: {
    use_browsing_for_personalization: consent,
  },
  source: {
    domain: 'cmp.pafdemopublisher.com',
    timestamp,
    signature: 'e8daiMMRZISmyDTYhIwxOgi4eOedTDh5Ne3ACJ2JbUK0EzxZjAUn/ak7FOlEsPpfgw3WQGFKVYI5sz+ADqvGxA==',
  },
});

export const getFakeIdentifier = (fakeId: string, type = 'paf_browser_id'): Identifier => ({
  version: '0.1',
  type: type as 'paf_browser_id',
  value: fakeId,
  source: {
    domain: 'crto-poc-1.onekey.network',
    timestamp,
    signature: 'cAudj1JsA2IqrOx8bt/1wiijLiAnsbALw+8c0h6Z8YrOIp/jsJoa5QHfvi+SL6wcorwwZifvfj0j0ERY3baiSg==',
  },
});

export const getFakeIdentifiers = (
  fakeId = '0c7966db-9e6a-4060-be81-824a9ce671d3',
  type = 'paf_browser_id'
): Identifiers => [getFakeIdentifier(fakeId)];

export class CookiesHelpers {
  static clearPafCookies() {
    CookiesHelpers.setCookies(Cookies.preferences, '');
    CookiesHelpers.setCookies(Cookies.identifiers, '');
    CookiesHelpers.setCookies(Cookies.lastRefresh, '');
  }

  static setCookies(name: string, value: string) {
    document.cookie = `${name}=${value}`;
  }

  static setIdsAndPreferences(idsAndPreferences: IdsAndPreferences) {
    CookiesHelpers.setIdentifiers(idsAndPreferences.identifiers);
    CookiesHelpers.setPreferences(idsAndPreferences.preferences);
    CookiesHelpers.mockRefreshTime();
  }

  static setIdentifiers(identifiers: Identifiers) {
    CookiesHelpers.setCookies(Cookies.identifiers, JSON.stringify(identifiers));
  }

  static setPreferences(preferences: Preferences) {
    CookiesHelpers.setCookies(Cookies.preferences, JSON.stringify(preferences));
  }

  static mockPreferences(consent: boolean) {
    CookiesHelpers.setPreferences(getFakePreferences(consent));
  }

  static mockIdentifiers(fakeId: string) {
    CookiesHelpers.setIdentifiers(getFakeIdentifiers(fakeId));
  }

  static mockRefreshTime() {
    CookiesHelpers.setCookies(Cookies.lastRefresh, new Date().toISOString());
  }
}
