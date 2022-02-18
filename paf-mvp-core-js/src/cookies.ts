import {Identifiers, IdsAndOptionalPreferences, Preferences, Test3Pc} from "./model/generated-model";

export enum Cookies {
    identifiers = "paf_identifiers",
    preferences = 'paf_preferences',
    test_3pc = 'paf_test_3pc'
}

// 1st party cookie expiration: 10 min
export const getPrebidDataCacheExpiration = (date: Date = new Date()) => {
    const expirationDate = new Date(date);
    expirationDate.setTime(expirationDate.getTime() + 1000 * 60 * 10)
    return expirationDate;
}

/**
 * Parse string cookie values and build an IdsAndOptionalPreferences accordingly
 * @param idsCookie
 * @param prefsCookie
 */
export const fromCookieValues = (idsCookie: string, prefsCookie: string): IdsAndOptionalPreferences => {
    return {
        identifiers: fromIdsCookie(idsCookie) ?? [],
        preferences: fromPrefsCookie(prefsCookie)
    }
}

export const fromIdsCookie = (idsCookie: string | undefined): Identifiers | undefined => (idsCookie === undefined) ? undefined : JSON.parse(idsCookie) as Identifiers
export const fromPrefsCookie = (prefsCookie: string | undefined): Preferences | undefined => (prefsCookie === undefined) ? undefined : JSON.parse(prefsCookie) as Preferences
export const fromTest3pcCookie = (test3pcCookie: string | undefined): Test3Pc | undefined => (test3pcCookie === undefined) ? undefined : JSON.parse(test3pcCookie) as Test3Pc

export const toIdsCookie = (identifiers: Identifiers): string => JSON.stringify(identifiers)
export const toPrefsCookie = (preferences: Preferences): string => JSON.stringify(preferences)
export const toTest3pcCookie = (test3pc: Test3Pc): string => JSON.stringify(test3pc)
