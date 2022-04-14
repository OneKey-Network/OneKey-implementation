import UAParser from 'ua-parser-js';
import {
  Error,
  Get3PcResponse,
  GetIdsPrefsResponse,
  GetNewIdResponse,
  Identifier,
  IdsAndOptionalPreferences,
  IdsAndPreferences,
  PostIdsPrefsRequest,
  PostSeedRequest,
  PostSignPreferencesRequest,
  Preferences,
  Seed,
  TransactionId,
} from '@core/model/generated-model';
import { Cookies, getPrebidDataCacheExpiration } from '@core/cookies';
import { jsonProxyEndpoints, proxyUriParams, redirectProxyEndpoints } from '@core/endpoints';
import { isBrowserKnownToSupport3PC } from '@core/user-agent';
import { QSParam } from '@core/query-string';
import { fromClientCookieValues, getPafStatus, PafStatus } from '@core/operator-client-commons';
import { getCookieValue } from '../utils/cookie';
import { NotificationEnum } from '../enums/notification.enum';

declare const PAFUI: {
  promptConsent: () => Promise<boolean>;
  showNotification: (notificationType: NotificationEnum) => void;
};

const logger = console;

const redirect = (url: string): void => {
  location.replace(url);
};

// Note: we don't use Content-type JSON to avoid having to trigger OPTIONS pre-flight.
// See https://stackoverflow.com/questions/37668282/unable-to-fetch-post-without-no-cors-in-header
const postJson = (url: string, input: object) =>
  fetch(url, {
    method: 'POST',
    body: JSON.stringify(input),
    credentials: 'include',
  });

const postText = (url: string, input: string) =>
  fetch(url, {
    method: 'POST',
    body: input,
    credentials: 'include',
  });

const get = (url: string) =>
  fetch(url, {
    method: 'GET',
    credentials: 'include',
  });

// Remove any "paf data" param from the query string
// From https://stackoverflow.com/questions/1634748/how-can-i-delete-a-query-string-parameter-in-javascript/25214672#25214672
// TODO should be able to use a more standard way, but URL class is immutable :-(
const removeUrlParameter = (url: string, parameter: string) => {
  const urlParts = url.split('?');

  if (urlParts.length >= 2) {
    // Get first part, and remove from array
    const urlBase = urlParts.shift();

    // Join it back up
    const queryString = urlParts.join('?');

    const prefix = `${encodeURIComponent(parameter)}=`;
    const parts = queryString.split(/[&;]/g);

    // Reverse iteration as may be destructive
    for (let i = parts.length; i-- > 0; ) {
      // Idiom for string.startsWith
      if (parts[i].lastIndexOf(prefix, 0) !== -1) {
        parts.splice(i, 1);
      }
    }

    url = urlBase + (parts.length > 0 ? `?${parts.join('&')}` : '');
  }

  return url;
};

const setCookie = (cookieName: string, value: string, expiration: Date) => {
  document.cookie = `${cookieName}=${value};expires=${expiration.toUTCString()}`;
};

export const removeCookie = (cookieName: string) => {
  setCookie(cookieName, null, new Date(0));
};

const showNotification = (consent: boolean) => {
  PAFUI.showNotification(consent ? NotificationEnum.personalizedContent : NotificationEnum.generalContent);
};

// Update the URL shown in the address bar, without PAF data
const cleanUpUrL = () => history.pushState(null, '', removeUrlParameter(location.href, QSParam.paf));

const getProxyUrl =
  (proxyHost: string) =>
  (endpoint: string): string =>
    `https://${proxyHost}${endpoint}`;

export const saveCookieValue = <T>(cookieName: string, cookieValue: T | undefined): string => {
  logger.info(`Value for ${cookieName}: ${cookieValue !== undefined ? 'YES' : 'NO'}`);

  const valueToStore = cookieValue === undefined ? PafStatus.NOT_PARTICIPATING : JSON.stringify(cookieValue);

  logger.info(`Save ${cookieName} value: ${valueToStore}`);

  // TODO use different expiration if "not participating"
  setCookie(cookieName, valueToStore, getPrebidDataCacheExpiration());
  setCookie(Cookies.lastRefresh, new Date().toISOString(), new Date(Date.now() + 1000 * 60 * 1)); // 1 minute

  return valueToStore;
};

let thirdPartyCookiesSupported: boolean | undefined;

export interface Options {
  proxyHostName: string;
}

export interface RefreshIdsAndPrefsOptions extends Options {
  triggerRedirectIfNeeded: boolean;
  redirectUrl?: URL;
}

export interface WriteIdsAndPrefsOptions extends Options {
  redirectUrl?: URL;
}

export type SignPrefsOptions = Options;

export type GetNewIdOptions = Options;

export type CreateSeedOptions = Options;

/**
 * Refresh result
 */
export interface RefreshResult {
  status: PafStatus;
  data?: IdsAndOptionalPreferences;
}

/**
 * Ensure local cookies for PAF identifiers and preferences are up-to-date.
 * If they aren't, contact the operator to get fresh values.
 * @param options:
 * - proxyHostName: servername of operator proxy. ex: www.myproxy.com
 * - triggerRedirectIfNeeded: `true` if redirect can be triggered immediately, `false` if it should wait
 * - redirectUrl: the redirectUrl that must be called in return when no 3PC are available. Default = current page
 * @return a status and optional data
 */
export const refreshIdsAndPreferences = async ({
  proxyHostName,
  triggerRedirectIfNeeded,
  redirectUrl,
}: RefreshIdsAndPrefsOptions): Promise<RefreshResult> => {
  const getUrl = getProxyUrl(proxyHostName);

  const redirectToRead = () => {
    logger.info('Redirect to operator');
    const url = redirectUrl ?? new URL(getUrl(redirectProxyEndpoints.read));
    url.searchParams.set(proxyUriParams.returnUrl, location.href);
    redirect(url.toString());
  };

  const processGetIdsAndPreferences = async (): Promise<RefreshResult> => {
    const urlParams = new URLSearchParams(window.location.search);
    const uriData = urlParams.get(QSParam.paf);

    cleanUpUrL();

    // 1. Any Prebid 1st party cookie?
    const strIds = getCookieValue(Cookies.identifiers);
    const lestRefresh = getCookieValue(Cookies.lastRefresh);
    const strPreferences = getCookieValue(Cookies.preferences);
    const currentPafData = fromClientCookieValues(strIds, strPreferences);

    const triggerNotification = (freshConsent: boolean) => {
      const currentlySelectedConsent = currentPafData.preferences?.data?.use_browsing_for_personalization;
      const shouldShowNotification = !strPreferences || freshConsent !== currentlySelectedConsent;

      if (shouldShowNotification) {
        showNotification(freshConsent);
      }
    };

    // 2. Redirected from operator?
    if (uriData) {
      logger.info('Redirected from operator: YES');

      // Consider that if we have been redirected, it means 3PC are not supported
      thirdPartyCookiesSupported = false;

      // Verify message
      const response = await postText(getUrl(jsonProxyEndpoints.verifyRead), uriData);
      const operatorData = (await response.json()) as GetIdsPrefsResponse;

      if (!operatorData) {
        throw 'Verification failed';
      }

      console.debug('received:');
      console.debug(operatorData);

      // 3. Received data?
      const persistedIds = operatorData.body.identifiers?.filter((identifier) => identifier?.persisted !== false);
      saveCookieValue(Cookies.identifiers, persistedIds.length === 0 ? undefined : persistedIds);
      saveCookieValue(Cookies.preferences, operatorData.body.preferences);

      triggerNotification(operatorData.body.preferences?.data?.use_browsing_for_personalization);

      return {
        status: PafStatus.UP_TO_DATE,
        data: operatorData.body,
      };
    }

    logger.info('Redirected from operator: NO');

    if (getPafStatus(strIds, strPreferences) === PafStatus.REDIRECT_NEEDED) {
      logger.info('Redirect previously deferred');

      if (triggerRedirectIfNeeded) {
        redirectToRead();
      }

      return {
        status: PafStatus.REDIRECT_NEEDED,
      };
    }

    if (lestRefresh) {
      logger.info('Cookie found: YES');

      const pafStatus = getPafStatus(strIds, strPreferences);

      if (pafStatus === PafStatus.NOT_PARTICIPATING) {
        logger.info('User is not participating');
      }

      return {
        status: pafStatus,
        data: currentPafData,
      };
    } else if (strIds || strPreferences) {
      removeCookie(Cookies.preferences);
      removeCookie(Cookies.identifiers);
    }

    logger.info('Cookie found: NO');

    // 4. Browser known to support 3PC?
    const userAgent = new UAParser(navigator.userAgent);

    if (isBrowserKnownToSupport3PC(userAgent.getBrowser())) {
      logger.info('Browser known to support 3PC: YES');

      logger.info('Attempt to read from JSON');
      const readResponse = await get(getUrl(jsonProxyEndpoints.read));
      const operatorData = (await readResponse.json()) as GetIdsPrefsResponse;

      const persistedIds = operatorData.body.identifiers?.filter((identifier) => identifier?.persisted !== false);

      // 3. Received data?
      if (persistedIds?.length > 0) {
        logger.info('Operator returned id & prefs: YES');

        // If we got data, it means 3PC are supported
        thirdPartyCookiesSupported = true;

        // /!\ Note: we don't need to verify the message here as it is a REST call

        saveCookieValue(Cookies.identifiers, persistedIds);
        saveCookieValue(Cookies.preferences, operatorData.body.preferences);

        triggerNotification(operatorData.body.preferences?.data?.use_browsing_for_personalization);

        return {
          status: PafStatus.UP_TO_DATE,
          data: operatorData.body,
        };
      }
      logger.info('Operator returned id & prefs: NO');

      logger.info('Verify 3PC on operator');
      // Note: need to include credentials to make sure cookies are sent
      const verifyResponse = await get(getUrl(jsonProxyEndpoints.verify3PC));
      const testOk: Get3PcResponse | Error = await verifyResponse.json();

      // 4. 3d party cookie ok?
      if ((testOk as Get3PcResponse)?.['3pc']) {
        // TODO might want to do more verification
        logger.info('3PC verification OK: YES');

        thirdPartyCookiesSupported = true;

        logger.info('Save "not participating"');
        saveCookieValue(Cookies.identifiers, undefined);
        saveCookieValue(Cookies.preferences, undefined);

        return {
          status: PafStatus.UP_TO_DATE,
          data: {
            identifiers: operatorData.body.identifiers,
          },
        };
      }
      logger.info('3PC verification OK: NO');
      thirdPartyCookiesSupported = false;
      logger.info('Fallback to JS redirect');
    } else {
      logger.info('Browser known to support 3PC: NO');
      thirdPartyCookiesSupported = false;
      logger.info('JS redirect');
    }

    if (triggerRedirectIfNeeded) {
      redirectToRead();
    } else {
      logger.info('Deffer redirect to later, in agreement with options');
      saveCookieValue(Cookies.identifiers, PafStatus.REDIRECT_NEEDED);
      saveCookieValue(Cookies.preferences, PafStatus.REDIRECT_NEEDED);
    }

    return {
      status: PafStatus.REDIRECT_NEEDED,
    };
  };

  const idsAndPreferences = await processGetIdsAndPreferences();

  logger.info('Finished', idsAndPreferences);

  return idsAndPreferences;
};

/**
 * Write update of identifiers and preferences on the PAF domain
 * @param options:
 * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
 * @param input the identifiers and preferences to write
 * @return the written identifiers and preferences
 */
export const writeIdsAndPref = async (
  { proxyHostName, redirectUrl }: WriteIdsAndPrefsOptions,
  input: IdsAndPreferences
): Promise<IdsAndOptionalPreferences | undefined> => {
  const getUrl = getProxyUrl(proxyHostName);

  const processWriteIdsAndPref = async (): Promise<IdsAndOptionalPreferences | undefined> => {
    console.log('Attempt to write:');
    console.log(input.identifiers);
    console.log(input.preferences);

    // First clean up local cookies
    removeCookie(Cookies.identifiers);
    removeCookie(Cookies.preferences);

    // FIXME this boolean will be up to date only if a read occurred just before. If not, would need to explicitly test
    if (thirdPartyCookiesSupported) {
      console.log('3PC supported');

      // 1) sign the request
      const signedResponse = await postJson(getUrl(jsonProxyEndpoints.signWrite), input);
      const signedData = (await signedResponse.json()) as PostIdsPrefsRequest;

      // 2) send
      const response = await postJson(getUrl(jsonProxyEndpoints.write), signedData);
      const operatorData = (await response.json()) as GetIdsPrefsResponse;

      const persistedIds = operatorData.body.identifiers.filter((identifier) => identifier?.persisted !== false);

      saveCookieValue(Cookies.identifiers, persistedIds.length === 0 ? undefined : persistedIds);
      saveCookieValue(Cookies.preferences, operatorData.body.preferences);

      showNotification(operatorData?.body?.preferences?.data?.use_browsing_for_personalization);

      return operatorData.body;
    }

    console.log('3PC not supported: redirect');

    // Redirect. Signing of the request will happen on the backend proxy
    const returnUrl = redirectUrl ?? new URL(getUrl(redirectProxyEndpoints.write));
    returnUrl.searchParams.set(proxyUriParams.returnUrl, location.href);
    returnUrl.searchParams.set(proxyUriParams.message, JSON.stringify(input));

    const url = returnUrl.toString();

    console.log(`Redirecting to ${url}`);

    redirect(url);
  };

  const idsAndPreferences = await processWriteIdsAndPref();

  logger.info('Finished', idsAndPreferences);

  return idsAndPreferences;
};

/**
 * Sign preferences
 * @param options:
 * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
 * @param input the main identifier of the web user, and the optin value
 * @return the signed Preferences
 */
export const signPreferences = async (
  { proxyHostName }: SignPrefsOptions,
  input: PostSignPreferencesRequest
): Promise<Preferences> => {
  const getUrl = getProxyUrl(proxyHostName);

  // TODO use ProxyRestSignPreferencesRequestBuilder
  const signedResponse = await postJson(getUrl(jsonProxyEndpoints.signPrefs), input);
  return (await signedResponse.json()) as Preferences;
};

/**
 * Sign preferences
 * @param options:
 * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
 * @param input the main identifier of the web user, and the optin value
 * @return the signed Preferences
 */
export const getNewId = async ({ proxyHostName }: GetNewIdOptions): Promise<Identifier> => {
  const getUrl = getProxyUrl(proxyHostName);

  const response = await get(getUrl(jsonProxyEndpoints.newId));
  // Assume no error. FIXME should handle potential errors
  return ((await response.json()) as GetNewIdResponse).body.identifiers[0];
};

/**
 * If at least one identifier and some preferences are present as a 1P cookie, return them
 * Otherwise, return undefined
 */
export const getIdsAndPreferences = (): IdsAndPreferences | undefined => {
  if (!getCookieValue(Cookies.lastRefresh)) {
    return undefined;
  }
  // Remove special string values
  const cleanCookieValue = (rawValue: string) =>
    rawValue === PafStatus.REDIRECT_NEEDED || rawValue === PafStatus.NOT_PARTICIPATING ? undefined : rawValue;

  const strIds = cleanCookieValue(getCookieValue(Cookies.identifiers));
  const strPreferences = cleanCookieValue(getCookieValue(Cookies.preferences));

  const values = fromClientCookieValues(strIds, strPreferences);

  // If the object is not complete (no identifier or no preferences), then consider no valid data
  if (values.identifiers === undefined || values.identifiers.length === 0 || values.preferences === undefined) {
    return undefined;
  }

  return values as IdsAndPreferences;
};

export const createSeed = async (
  { proxyHostName }: CreateSeedOptions,
  transactionIds: TransactionId[]
): Promise<Seed | undefined> => {
  if (transactionIds.length == 0) {
    return undefined;
  }

  const getUrl = getProxyUrl(proxyHostName);
  const url = getUrl(jsonProxyEndpoints.createSeed);
  const idsAndPrefs = getIdsAndPreferences();
  if (idsAndPrefs === undefined) {
    return undefined;
  }

  const requestContent: PostSeedRequest = {
    transaction_ids: transactionIds,
    data: idsAndPrefs,
  };
  const response = await postJson(url, requestContent);

  return await response.json();
};
