import { Cookies } from '@core/cookies';
import { Identifiers, Preferences } from '@core/model/generated-model';

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

export const getFakeIdentifiers = (fakeId = '0c7966db-9e6a-4060-be81-824a9ce671d3'): Identifiers => [
  {
    version: '0.1',
    type: 'paf_browser_id',
    value: fakeId,
    source: {
      domain: 'crto-poc-1.onekey.network',
      timestamp,
      signature: 'cAudj1JsA2IqrOx8bt/1wiijLiAnsbALw+8c0h6Z8YrOIp/jsJoa5QHfvi+SL6wcorwwZifvfj0j0ERY3baiSg==',
    },
  },
];

export class CookiesHelpers {
  static clearPafCookies() {
    CookiesHelpers.setCookies(Cookies.preferences, '');
    CookiesHelpers.setCookies(Cookies.identifiers, '');
  }

  static setCookies(name: string, value: string) {
    document.cookie = `${name}=${value}`;
  }

  static mockPreferences(consent: boolean) {
    CookiesHelpers.setCookies(Cookies.preferences, JSON.stringify(getFakePreferences(consent)));
  }

  static mockIdentifiers(fakeId: string) {
    CookiesHelpers.setCookies(Cookies.identifiers, JSON.stringify(getFakeIdentifiers(fakeId)));
  }
}
