import UAParser from 'ua-parser-js';
import {
  Error,
  Get3PcResponse,
  GetIdsPrefsResponse, GetNewIdResponse, Identifier,
  IdsAndOptionalPreferences,
  IdsAndPreferences,
  PostIdsPrefsRequest,
  PostSignPreferencesRequest,
  Preferences,
} from '@core/model/generated-model';
import {Cookies, getPrebidDataCacheExpiration} from '@core/cookies';
import {jsonProxyEndpoints, proxyUriParams, redirectProxyEndpoints} from '@core/endpoints';
import {isBrowserKnownToSupport3PC} from '@core/user-agent';
import {QSParam} from '@core/query-string';
import {fromClientCookieValues, getPafStatus, PafStatus} from '@core/operator-client-commons';
import {getCookieValue} from '../utils/cookie';

const logger = console;

const redirect = (url: string): void => {
  document.location = url;
};

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
    for (let i = parts.length; i-- > 0;) {
      // Idiom for string.startsWith
      if (parts[i].lastIndexOf(prefix, 0) !== -1) {
        parts.splice(i, 1);
      }
    }

    url = urlBase + (parts.length > 0 ? `?${parts.join('&')}` : '');
  }

  return url;
};

const setCookie = (name: string, value: string, expiration: Date) => {
  document.cookie = `${name}=${value};expires=${expiration.toUTCString()}`;
};

// Update the URL shown in the address bar, without PAF data
const cleanUpUrL = () => history.pushState(null, '', removeUrlParameter(location.href, QSParam.paf));

const getProxyUrl = (proxyHost: string) => (endpoint: string): string => `https://${proxyHost}${endpoint}`;

const saveCookieValue = <T>(cookieName: string, cookieValue: T | undefined): string => {
  logger.info(`Operator returned value for ${cookieName}: ${cookieValue !== undefined ? 'YES' : 'NO'}`);

  const valueToStore = cookieValue === undefined ? PafStatus.NOT_PARTICIPATING : JSON.stringify(cookieValue);

  logger.info(`Save ${cookieName} value: ${valueToStore}`);

  // TODO use different expiration if "not participating"
  setCookie(cookieName, valueToStore, getPrebidDataCacheExpiration());

  return valueToStore;
};

const removeCookie = (cookieName: string) => {
  setCookie(cookieName, null, new Date(0));
};

let thirdPartyCookiesSupported: boolean | undefined;

export interface Options {
  proxyHostName: string;
}

export interface RefreshIdsAndPrefsOptions extends Options {
  triggerRedirectIfNeeded: boolean;
}

export type WriteIdsAndPrefsOptions = Options;

export type SignPrefsOptions = Options;

export type GetNewIdOptions = Options;

/**
 * Ensure local cookies for PAF identifiers and preferences are up-to-date.
 * If they aren't, contact the operator to get fresh values.
 * @param options:
 * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
 * - triggerRedirectIfNeeded: `true` if redirect can be triggered immediately, `false` if it should wait
 * @return ids and preferences or undefined if user is not participating or if values can't be refreshed
 */
export const refreshIdsAndPreferences = async ({
                                                 proxyHostName,
                                                 triggerRedirectIfNeeded,
                                               }: RefreshIdsAndPrefsOptions): Promise<IdsAndOptionalPreferences | undefined> => {
  const getUrl = getProxyUrl(proxyHostName);

  const redirectToRead = () => {
    logger.info('Redirect to operator');
    const redirectUrl = new URL(getUrl(redirectProxyEndpoints.read));
    redirectUrl.searchParams.set(proxyUriParams.returnUrl, location.href);
    redirect(redirectUrl.toString());
  };

  const processGetIdsAndPreferences = async (): Promise<IdsAndOptionalPreferences | undefined> => {
    const urlParams = new URLSearchParams(window.location.search);
    const uriData = urlParams.get(QSParam.paf);

    cleanUpUrL();

    // 1. Any Prebid 1st party cookie?
    const rawIds = getCookieValue(Cookies.identifiers);
    const rawPreferences = getCookieValue(Cookies.preferences);

    // 2. Redirected from operator?
    if (uriData) {
      logger.info('Redirected from operator: YES');

      // Consider that if we have been redirected, it means 3PC are not supported
      thirdPartyCookiesSupported = false;

      // Verify message
      const response = await fetch(getUrl(jsonProxyEndpoints.verifyRead), {
        method: 'POST',
        body: uriData,
        credentials: 'include',
      });
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

      return operatorData.body;
    }

    logger.info('Redirected from operator: NO');

    if (getPafStatus(rawIds, rawPreferences) === PafStatus.REDIRECT_NEEDED) {
      logger.info('Redirect previously deferred');

      if (triggerRedirectIfNeeded) {
        redirectToRead();
      }

      return undefined;
    }

    if (rawIds && rawPreferences) {
      logger.info('Cookie found: YES');

      if (getPafStatus(rawIds, rawPreferences) === PafStatus.NOT_PARTICIPATING) {
        logger.info('User is not participating');
      }

      return fromClientCookieValues(rawIds, rawPreferences);
    }

    logger.info('Cookie found: NO');

    // 4. Browser known to support 3PC?
    const userAgent = new UAParser(navigator.userAgent);

    if (isBrowserKnownToSupport3PC(userAgent.getBrowser())) {
      logger.info('Browser known to support 3PC: YES');

      logger.info('Attempt to read from JSON');
      const readResponse = await fetch(getUrl(jsonProxyEndpoints.read), {credentials: 'include'});
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

        return operatorData.body;
      }
      logger.info('Operator returned id & prefs: NO');

      logger.info('Verify 3PC on operator');
      // Note: need to include credentials to make sure cookies are sent
      const verifyResponse = await fetch(getUrl(jsonProxyEndpoints.verify3PC), {credentials: 'include'});
      const testOk: Get3PcResponse | Error = (await verifyResponse.json());

      // 4. 3d party cookie ok?
      if ((testOk as Get3PcResponse)?.["3pc"]) {
        // TODO might want to do more verification
        logger.info('3PC verification OK: YES');

        thirdPartyCookiesSupported = true;

        logger.info('Save "not participating"');
        setCookie(Cookies.identifiers, PafStatus.NOT_PARTICIPATING, getPrebidDataCacheExpiration());
        setCookie(Cookies.preferences, PafStatus.NOT_PARTICIPATING, getPrebidDataCacheExpiration());

        return {identifiers: operatorData.body.identifiers};
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
      setCookie(Cookies.identifiers, PafStatus.REDIRECT_NEEDED, getPrebidDataCacheExpiration());
      setCookie(Cookies.preferences, PafStatus.REDIRECT_NEEDED, getPrebidDataCacheExpiration());
    }

    return undefined;
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
  {proxyHostName}: WriteIdsAndPrefsOptions,
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
      const signedResponse = await fetch(getUrl(jsonProxyEndpoints.signWrite), {
        method: 'POST',
        body: JSON.stringify(input),
        credentials: 'include',
      });
      const signedData = (await signedResponse.json()) as PostIdsPrefsRequest;

      // 2) send
      const response = await fetch(getUrl(jsonProxyEndpoints.write), {
        method: 'POST',
        body: JSON.stringify(signedData),
        credentials: 'include',
      });
      const operatorData = (await response.json()) as GetIdsPrefsResponse;

      const persistedIds = operatorData.body.identifiers.filter((identifier) => identifier?.persisted !== false);

      saveCookieValue(Cookies.identifiers, persistedIds.length === 0 ? undefined : persistedIds);
      saveCookieValue(Cookies.preferences, operatorData.body.preferences);

      return operatorData.body;
    }

    console.log('3PC not supported: redirect');

    // Redirect. Signing of the request will happen on the backend proxy
    const redirectUrl = new URL(getUrl(redirectProxyEndpoints.write));
    redirectUrl.searchParams.set(proxyUriParams.returnUrl, location.href);
    redirectUrl.searchParams.set(proxyUriParams.message, JSON.stringify(input));

    const url = redirectUrl.toString();

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
export const signPreferences = async ({proxyHostName}: SignPrefsOptions, input: PostSignPreferencesRequest): Promise<Preferences> => {
  const getUrl = getProxyUrl(proxyHostName);

  // TODO use ProxyRestSignPreferencesRequestBuilder
  const signedResponse = await fetch(getUrl(jsonProxyEndpoints.signPrefs), {
    method: 'POST',
    body: JSON.stringify(input),
    credentials: 'include',
  });
  return (await signedResponse.json()) as Preferences;
};

/**
 * Sign preferences
 * @param options:
 * - proxyBase: base URL (scheme, servername) of operator proxy. ex: http://myproxy.com
 * @param input the main identifier of the web user, and the optin value
 * @return the signed Preferences
 */
export const getNewId = async ({proxyHostName}: GetNewIdOptions): Promise<Identifier> => {
  const getUrl = getProxyUrl(proxyHostName);

  const response = await fetch(getUrl(jsonProxyEndpoints.newId), {
    method: 'GET',
    credentials: 'include',
  });
  // Assume no error. FIXME should handle potential errors
  return ((await response.json()) as GetNewIdResponse).body.identifiers[0];
};
