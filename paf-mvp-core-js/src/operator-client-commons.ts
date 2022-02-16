import {IdsAndOptionalPreferences} from "./model/generated-model";
import {fromIdsCookie, fromPrefsCookie} from "./cookies";

export enum PafStatus {
    NOT_PARTICIPATING = "NOT_PARTICIPATING",
    REDIRECT_NEEDED = "REDIRECT_NEEDED",
    UP_TO_DATE = "UP_TO_DATE"
}

const getCleanCookieValue = (cookieValue: string): string | undefined =>
    cookieValue === PafStatus.NOT_PARTICIPATING || cookieValue === PafStatus.REDIRECT_NEEDED
        ? undefined
        : cookieValue

/**
 * Parse string cookie values and build an IdsAndOptionalPreferences accordingly
 * @param idsCookie
 * @param prefsCookie
 */
export const fromClientCookieValues = (idsCookie: string, prefsCookie: string): IdsAndOptionalPreferences => {
    return {
        identifiers: fromIdsCookie(getCleanCookieValue(idsCookie)) ?? [],
        preferences: fromPrefsCookie(getCleanCookieValue(prefsCookie))
    }
}

export const getPafStatus = (idsCookie: string, prefsCookie: string): PafStatus => {
    if (idsCookie === PafStatus.REDIRECT_NEEDED || prefsCookie === PafStatus.REDIRECT_NEEDED) {
        return PafStatus.REDIRECT_NEEDED
    }

    // TODO might need to refine this one
    if (idsCookie === PafStatus.NOT_PARTICIPATING || prefsCookie === PafStatus.NOT_PARTICIPATING) {
        return PafStatus.NOT_PARTICIPATING
    }

    return PafStatus.UP_TO_DATE
}
