import { Identifiers, IdsAndOptionalPreferences, Preferences, Test3Pc } from './model/generated-model';

export enum Cookies {
  identifiers = 'paf_identifiers',
  preferences = 'paf_preferences',
  test_3pc = 'paf_test_3pc',
  lastRefresh = 'paf_last_refresh',
}

// 1st party cookie expiration: 3 month
export const getPrebidDataCacheExpiration = (date: Date = new Date()) => {
  const expirationDate = new Date(date);
  const monthsCount = 3;
  expirationDate.setMonth(expirationDate.getMonth() + monthsCount);
  return expirationDate;
};

/**
 * Parse string cookie values and build an IdsAndOptionalPreferences accordingly
 * @param idsCookie
 * @param prefsCookie
 */
export const fromCookieValues = (idsCookie: string, prefsCookie: string): IdsAndOptionalPreferences => {
  return {
    identifiers: typedCookie<Identifiers>(idsCookie) ?? [],
    preferences: typedCookie<Preferences>(prefsCookie),
  };
};

export const typedCookie = <T>(cookieString: string | undefined): T | undefined =>
  cookieString === undefined ? undefined : (JSON.parse(cookieString) as T);

export const toIdsCookie = (identifiers: Identifiers): string => JSON.stringify(identifiers);
export const toPrefsCookie = (preferences: Preferences): string => JSON.stringify(preferences);
export const toTest3pcCookie = (test3pc: Test3Pc): string => JSON.stringify(test3pc);
