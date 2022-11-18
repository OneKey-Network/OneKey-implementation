/**
 * TODO this file should be split into sub-modules, like i-one-key-lib.ts, one-key-lib.ts and rtb.ts
 */
import { executeInQueueAsync } from '../utils/queue';
import { PafStatus } from '@onekey/frontend/enums/status.enum';
import {
  AuditLog,
  DeleteIdsPrefsResponse,
  Error,
  Get3PcResponse,
  GetIdsPrefsResponse,
  GetNewIdResponse,
  Identifier,
  IdsAndOptionalPreferences,
  IdsAndPreferences,
  PostIdsPrefsRequest,
  PostIdsPrefsResponse,
  PostSeedRequest,
  PostSignPreferencesRequest,
  PostVerifySeedRequest,
  PostVerifyTransmissionResultRequest,
  Preferences,
  Seed,
  TransactionId,
  TransmissionResponse,
  TransmissionResult,
} from '@onekey/core/model';
import { NotificationEnum } from '@onekey/frontend/enums/notification.enum';
import { Log } from '@onekey/core/log';
import { EventHandler } from '@onekey/frontend/utils/event-handler';
import { Cookies, getPrebidDataCacheExpiration, typedCookie } from '@onekey/core/cookies';
import { DEFAULT_TTL_IN_SECONDS, getCookieValue, MAXIMUM_TTL_IN_SECONDS } from '@onekey/frontend/utils/cookie';
import { QSParam } from '@onekey/core/query-string';
import { client, clientUriParams } from '@onekey/core/routes';
import { isBrowserKnownToSupport3PC } from '@onekey/core/user-agent';
import { browserName } from 'detect-browser';
import { mapAdUnitCodeToDivId } from '@onekey/frontend/utils/ad-unit-code';
import { buildAuditLog, findTransactionPath } from '@onekey/core/model/audit-log';
import { IAuditLogStorageService } from '@onekey/frontend/services/audit-log-storage.service';
import { ISeedStorageService } from '@onekey/frontend/services/seed-storage.service';
import { parseDuration } from '@onekey/frontend/utils/date-utils';
import { IHttpService } from '@onekey/frontend/services/http.service';
import {
  CookieData,
  IdsAndPreferencesResult,
  IOneKeyLib,
  RefreshResult,
  ShowPromptOption,
} from '@onekey/frontend/lib/i-one-key-lib';

// TODO ------------------------------------------------------ move to one-key-lib.ts START
export class OneKeyLib implements IOneKeyLib {
  // Special query string param to remember the prompt must be shown
  private localQSParamShowPrompt = 'paf_show_prompt';

  private log = new Log('OneKey', '#3bb8c3');
  private promptManager = new EventHandler<void, boolean>();
  private notificationManager = new EventHandler<NotificationEnum, void>();
  private clientHostname: string;
  triggerRedirectIfNeeded: boolean;
  private thirdPartyCookiesSupported: boolean | undefined;
  private auditLogStorageService: IAuditLogStorageService;
  private seedStorageService: ISeedStorageService;
  private httpService: IHttpService;
  private auditLogManager = new EventHandler<HTMLElement, void>();
  private readonly cookieTTL: number;

  unpersistedIds?: Identifier[];

  constructor(
    clientHostname: string,
    triggerRedirectIfNeeded = true,
    auditLogStorageService: IAuditLogStorageService,
    seedStorageService: ISeedStorageService,
    httpService: IHttpService,
    cookieTTL?: string
  ) {
    this.clientHostname = clientHostname;
    this.triggerRedirectIfNeeded = triggerRedirectIfNeeded;
    this.auditLogStorageService = auditLogStorageService;
    this.seedStorageService = seedStorageService;
    this.httpService = httpService;
    this.cookieTTL = this.parseCookieTTL(cookieTTL);
  }

  parseCookieTTL(duration: string): number {
    if (duration === undefined) {
      this.log.Info(`No cookie ttl was specified! Using default value: ${DEFAULT_TTL_IN_SECONDS} seconds`);
      return DEFAULT_TTL_IN_SECONDS;
    }
    const durationInSeconds = parseDuration(duration);
    if (durationInSeconds === null) {
      this.log.Warn(
        `The provided cookie ttl "${duration}" is not a valid ISO 8601 string! Using default value: ${DEFAULT_TTL_IN_SECONDS} seconds`
      );
      return DEFAULT_TTL_IN_SECONDS;
    }
    if (durationInSeconds > MAXIMUM_TTL_IN_SECONDS) {
      this.log.Warn(
        `The provided cookie ttl "${duration}" is too big! using maximum allowed value: ${MAXIMUM_TTL_IN_SECONDS} seconds`
      );
      return MAXIMUM_TTL_IN_SECONDS;
    }
    this.log.Info(`Cookie ttl is set to ${durationInSeconds} seconds`);
    return durationInSeconds;
  }

  // Remove any "paf data" param from the query string
  // From https://stackoverflow.com/questions/1634748/how-can-i-delete-a-query-string-parameter-in-javascript/25214672#25214672
  // TODO should be able to use a more standard way, but URL class is immutable :-(
  private removeUrlParameters(url: string, parameters: string[]) {
    const urlParts = url.split('?');

    if (urlParts.length >= 2) {
      // Get first part, and remove from array
      const urlBase = urlParts.shift();

      // Join it back up
      const queryString = urlParts.join('?');

      const prefixes = parameters.map((param) => `${encodeURIComponent(param)}=`);
      const parts = queryString.split(/[&;]/g);

      // Reverse iteration as may be destructive
      prefixes.forEach((prefix) => {
        for (let i = parts.length; i-- > 0; ) {
          // Idiom for string.startsWith
          if (parts[i].lastIndexOf(prefix, 0) !== -1) {
            parts.splice(i, 1);
          }
        }
      });

      url = urlBase + (parts.length > 0 ? `?${parts.join('&')}` : '');
    }

    return url;
  }

  private setCookie(cookieName: string, value: string, expiration: Date) {
    document.cookie = `${cookieName}=${value};expires=${expiration.toUTCString()}`;
  }

  removeCookie(cookieName: string): void {
    this.setCookie(cookieName, null, new Date(0));
  }

  private async showNotificationIfValid(consent: boolean | undefined) {
    if (consent !== undefined) {
      this.log.Debug('Show notification with consent', consent);
      await this.notificationManager.fireEvent(
        consent ? NotificationEnum.personalizedContent : NotificationEnum.generalContent
      );
    }
  }

  private getProxyUrl(endpoint: string): string {
    return `https://${this.clientHostname}${endpoint}`;
  }

  private saveCookieValue<T>(cookieName: string, cookieValue: T | undefined): string {
    const valueToStore = cookieValue === undefined ? PafStatus.NOT_PARTICIPATING : JSON.stringify(cookieValue);

    this.log.Debug(`Save cookie ${cookieName}:`, valueToStore);

    // TODO use different expiration if "not participating"
    this.setCookie(cookieName, valueToStore, getPrebidDataCacheExpiration());
    this.setCookie(Cookies.lastRefresh, new Date().toISOString(), this.getPafRefreshExpiration());

    return valueToStore;
  }

  private getPafRefreshExpiration = () => {
    return new Date(Date.now() + 1000 * this.cookieTTL);
  };

  /**
   * Sign new optin value and send it with ids to the operator for writing
   */
  async updateIdsAndPreferences(
    optIn: boolean,
    identifiers: Identifier[]
  ): Promise<IdsAndOptionalPreferences | undefined> {
    // 1. sign preferences
    const unsignedPreferences = {
      version: '0.1',
      data: {
        use_browsing_for_personalization: optIn,
      },
    };
    const signedPreferences = await this.signPreferences({
      identifiers,
      unsignedPreferences,
    });

    // 2. write
    return await this.writeIdsAndPref({
      identifiers,
      preferences: signedPreferences,
    });
  }

  /**
   *
   * @param idsAndPreferences
   * @param showPrompt
   */
  private async updateDataWithPrompt(idsAndPreferences: RefreshResult, showPrompt: ShowPromptOption) {
    const { status, data } = idsAndPreferences;

    this.log.Debug('showPrompt', showPrompt);
    this.log.Debug('status', status);

    // If a redirect is needed, nothing more to do
    if (status === PafStatus.REDIRECT_NEEDED) {
      return;
    }

    let optIn: boolean | undefined;

    // Show prompt only if explicitly requested, or if user is unknown and prompt is accepted
    if (
      showPrompt === ShowPromptOption.doPrompt ||
      (showPrompt === ShowPromptOption.promptIfUnknownUser && status === PafStatus.UNKNOWN)
    ) {
      optIn = await this.promptManager.fireEvent();
    }

    if (optIn === undefined) {
      // User closed the prompt consent without defining their preferences, or the prompt was not even shown
      // => either they canceled modification of existing ids and preferences, or they don't want to participate

      // Was not participating => save this information
      if (status === PafStatus.UNKNOWN) {
        this.saveCookieValue(Cookies.identifiers, undefined);
        this.saveCookieValue(Cookies.preferences, undefined);
      }
      // Otherwise, don't do anything, preserve existing cookies
    } else {
      let identifiers = data.identifiers;
      if (identifiers?.length === 0) {
        // If opening the prompt while the user is unknown, it can happen that we need to query for a new id
        identifiers = [await this.getNewId()];
      }
      await this.updateIdsAndPreferences(optIn, identifiers);
    }
  }

  private getCleanCookieValue = (cookieValue: string): string | undefined =>
    cookieValue === PafStatus.NOT_PARTICIPATING || cookieValue === PafStatus.REDIRECT_NEEDED ? undefined : cookieValue;

  /**
   * Parse string cookie values and build an IdsAndOptionalPreferences accordingly
   * @param idsCookie
   * @param prefsCookie
   */
  private fromClientCookieValues = (idsCookie: string, prefsCookie: string): IdsAndOptionalPreferences => {
    return {
      identifiers: typedCookie(this.getCleanCookieValue(idsCookie)) ?? [],
      preferences: typedCookie(this.getCleanCookieValue(prefsCookie)),
    };
  };

  private getPafStatus(idsCookie: string, prefsCookie: string): PafStatus {
    if (idsCookie === PafStatus.REDIRECT_NEEDED || prefsCookie === PafStatus.REDIRECT_NEEDED) {
      return PafStatus.REDIRECT_NEEDED;
    }

    // TODO might need to refine this one
    if (idsCookie === PafStatus.NOT_PARTICIPATING || prefsCookie === PafStatus.NOT_PARTICIPATING) {
      return PafStatus.NOT_PARTICIPATING;
    }

    return PafStatus.PARTICIPATING;
  }

  /**
   * Ensure local cookies for OneKey identifiers and preferences are up-to-date.
   * If they aren't, contact the operator to get fresh values.
   * @param options:
   * - proxyHostName: servername of the OneKey client node. ex: paf.my-website.com
   * - triggerRedirectIfNeeded: `true` if redirect can be triggered immediately, `false` if it should wait
   * - returnUrl: the URL that must be called in return (after a redirect to the operator) when no 3PC are available. Default = current page
   * @return a status and optional data
   */
  refreshIdsAndPreferences = async (
    showPrompt: ShowPromptOption = ShowPromptOption.promptIfUnknownUser
  ): Promise<RefreshResult> => {
    this.log.Debug('refreshIdsAndPreferences', showPrompt);

    const redirectToRead = async () => {
      this.log.Info('Redirect to operator');

      const clientUrl = new URL(this.getProxyUrl(client.read.redirect));
      const boomerangUrl = new URL(location.href);
      boomerangUrl.searchParams.set(this.localQSParamShowPrompt, showPrompt);

      clientUrl.searchParams.set(clientUriParams.returnUrl, boomerangUrl.toString());
      const clientResponse = await this.httpService.get(clientUrl.toString());
      // TODO handle errors
      const operatorUrl = await clientResponse.text();
      this.httpService.redirect(operatorUrl);
    };

    const processRefreshIdsAndPreferences = async (): Promise<RefreshResult> => {
      // TODO the parsing and cleaning of the query string should be moved to a dedicated function
      const initialData = this.getAllCookies();

      let status = this.getPafStatus(initialData.strIds, initialData.strPreferences);

      if (status === PafStatus.REDIRECT_NEEDED) {
        this.log.Info('Redirect previously deferred');

        if (this.triggerRedirectIfNeeded) {
          await redirectToRead();
          status = PafStatus.REDIRECTING;
        }

        return {
          status,
        };
      }

      if (initialData.lastRefresh) {
        this.log.Info('Cookie found: YES');

        if (status === PafStatus.NOT_PARTICIPATING) {
          this.log.Info('User is not participating');
        }

        return {
          status,
          data: initialData.currentPafData,
        };
      }

      this.log.Info('Cookie found: NO');

      if (isBrowserKnownToSupport3PC(browserName(navigator.userAgent))) {
        this.log.Info('Browser known to support 3PC: YES');

        this.log.Info('Attempt to read from JSON');
        const getOperatorUrlResponse = await this.httpService.get(this.getProxyUrl(client.read.rest));
        const operatorUrl = await getOperatorUrlResponse.text();
        const readResponse = await this.httpService.get(operatorUrl);
        const operatorData = (await readResponse.json()) as GetIdsPrefsResponse;

        const persistedIds = operatorData.body.identifiers?.filter((identifier) => identifier?.persisted !== false);
        const hasPersistedId = persistedIds.length > 0;
        const preferences = operatorData?.body?.preferences;
        const hasPreferences = preferences !== undefined;

        // 3. Received data?
        if (hasPersistedId && hasPreferences) {
          this.log.Debug('Operator returned id & prefs: YES');

          // If we got data, it means 3PC are supported
          this.thirdPartyCookiesSupported = true;

          // /!\ Note: we don't need to verify the message here as it is a REST call

          this.saveCookieValue(Cookies.identifiers, persistedIds);
          this.saveCookieValue(Cookies.preferences, operatorData.body.preferences);

          await this.triggerNotification(
            initialData,
            operatorData.body.preferences?.data?.use_browsing_for_personalization
          );

          return {
            status: PafStatus.PARTICIPATING,
            data: operatorData.body,
          };
        }
        this.log.Info('Operator returned id & prefs: NO');

        this.log.Info('Verify 3PC on operator');
        // Note: need to include credentials to make sure cookies are sent
        const verifyUrl = await this.httpService.get(this.getProxyUrl(client.verify3PC.rest));
        const verifyResponse = await this.httpService.get(await verifyUrl.text());
        const testOk: Get3PcResponse | Error = await verifyResponse.json();

        // 4. 3d party cookie ok?
        if ((testOk as Get3PcResponse)?.['3pc']) {
          this.log.Debug('3PC verification OK: YES');

          this.thirdPartyCookiesSupported = true;

          // Save the newly generated id(s)
          this.unpersistedIds = operatorData.body.identifiers;

          return {
            status: PafStatus.UNKNOWN,
            data: {
              identifiers: operatorData.body.identifiers,
            },
          };
        }
        this.log.Info('3PC verification OK: NO');
        this.thirdPartyCookiesSupported = false;
        this.log.Info('Fallback to JS redirect');
      } else {
        this.log.Info('Browser known to support 3PC: NO');
        this.thirdPartyCookiesSupported = false;
        this.log.Info('JS redirect');
      }

      if (this.triggerRedirectIfNeeded) {
        await redirectToRead();
        status = PafStatus.REDIRECTING;
      } else {
        this.log.Info('Deffer redirect to later, in agreement with options');
        status = PafStatus.REDIRECT_NEEDED;
        this.saveCookieValue(Cookies.identifiers, status);
        this.saveCookieValue(Cookies.preferences, status);
      }

      return {
        status,
      };
    };

    const idsAndPreferences = await processRefreshIdsAndPreferences();

    this.log.Debug('refreshIdsAndPreferences return', idsAndPreferences);

    // Now handle prompt, if relevant
    await this.updateDataWithPrompt(idsAndPreferences, showPrompt);

    return idsAndPreferences;
  };

  private getAllCookies = (): CookieData => {
    const strIds = getCookieValue(Cookies.identifiers);
    const strPreferences = getCookieValue(Cookies.preferences);
    const currentPafData = this.fromClientCookieValues(strIds, strPreferences);
    return {
      strIds,
      lastRefresh: getCookieValue(Cookies.lastRefresh),
      strPreferences,
      currentPafData,
      currentlySelectedConsent: currentPafData.preferences?.data?.use_browsing_for_personalization,
    };
  };

  setPromptHandler = (handler: () => Promise<boolean>) => {
    this.promptManager.handler = handler;
  };

  async promptConsent(): Promise<boolean> {
    return this.promptManager.fireEvent();
  }

  setNotificationHandler(handler: (notificationType: NotificationEnum) => Promise<void>) {
    this.notificationManager.handler = handler;
  }

  showNotification(notificationType: NotificationEnum): Promise<void> {
    return this.notificationManager.fireEvent(notificationType);
  }

  triggerNotification = async (initialData: CookieData, newConsent: boolean) => {
    // the new value is different from the previous one
    if (newConsent !== initialData.currentlySelectedConsent) {
      this.log.Debug(
        `Preferences changes detected (${initialData.currentlySelectedConsent} => ${newConsent}), show notification`
      );
      await this.showNotificationIfValid(newConsent);
    } else {
      this.log.Debug(`No preferences changes (${initialData.currentlySelectedConsent}), don't show notification`);
    }
  };

  handleAfterBoomerangRedirect = async () => {
    // Update the URL shown in the address bar, without OneKey data
    const urlParams = new URLSearchParams(window.location.search);
    const uriOperatorData = urlParams.get(QSParam.paf);
    const uriShowPrompt = urlParams.get(this.localQSParamShowPrompt);

    const cleanedUrl = this.removeUrlParameters(location.href, [QSParam.paf, this.localQSParamShowPrompt]);
    history.pushState(null, '', cleanedUrl);

    // 1. Any OneKey 1st party cookie?
    const initialData = this.getAllCookies();

    this.log.Info(`Redirected from operator: ${uriOperatorData ? 'YES' : 'NO'}`);

    // 2. Redirected from operator?
    if (uriOperatorData) {
      // Consider that if we have been redirected, it means 3PC are not supported
      this.thirdPartyCookiesSupported = false;

      // Verify message
      const response = await this.httpService.postText(this.getProxyUrl(client.verifyRead.rest), uriOperatorData);
      const operatorData = (await response.json()) as
        | GetIdsPrefsResponse
        | PostIdsPrefsResponse
        | DeleteIdsPrefsResponse;

      if (!operatorData) {
        throw 'Verification failed';
      }

      this.log.Debug('Operator data after redirect', operatorData);

      let status: PafStatus;

      // Remember what was asked for prompt, before the redirect
      const showPrompt = uriShowPrompt as ShowPromptOption;

      // 3. Received data?
      if (operatorData.body.preferences === undefined && operatorData.body.identifiers.length === 0) {
        // Deletion of ids and preferences requested
        this.saveCookieValue(Cookies.identifiers, undefined);
        this.saveCookieValue(Cookies.preferences, undefined);
        status = PafStatus.NOT_PARTICIPATING;

        this.log.Info('Deleted ids and preferences');
      } else {
        // Ids and preferences received
        const persistedIds = operatorData.body.identifiers?.filter((identifier) => identifier?.persisted !== false);
        const hasPersistedId = persistedIds.length > 0;
        const preferences = operatorData?.body?.preferences;
        const hasPreferences = preferences !== undefined;
        this.saveCookieValue(Cookies.identifiers, hasPersistedId ? persistedIds : undefined);
        this.saveCookieValue(Cookies.preferences, preferences);

        await this.triggerNotification(initialData, preferences?.data?.use_browsing_for_personalization);

        status = hasPersistedId && hasPreferences ? PafStatus.PARTICIPATING : PafStatus.UNKNOWN;

        if (!hasPersistedId) {
          this.unpersistedIds = operatorData.body.identifiers;
        }
      }

      // Now handle prompt, if relevant
      await this.updateDataWithPrompt(
        {
          status,
          data: operatorData.body,
        },
        showPrompt
      );
    }
  };

  /**
   * Write update of identifiers and preferences on the OneKey domain
   * @param options:
   * - proxyBase: base URL (scheme, servername) of the OneKey client node. ex: https://paf.my-website.com
   * @param input the identifiers and preferences to write
   * @return the written identifiers and preferences
   */
  private writeIdsAndPref = async (input: IdsAndPreferences): Promise<IdsAndOptionalPreferences | undefined> => {
    const processWriteIdsAndPref = async (): Promise<IdsAndOptionalPreferences | undefined> => {
      this.log.Info('Attempt to write:', input.identifiers, input.preferences);

      // First clean up local cookies
      this.removeCookie(Cookies.identifiers);
      this.removeCookie(Cookies.preferences);

      // FIXME this boolean will be up to date only if a read occurred just before. If not, would need to explicitly test
      if (this.thirdPartyCookiesSupported) {
        this.log.Info('3PC supported');

        // Sign the request and get operator URL to call
        const clientResponse = await this.httpService.postJson(this.getProxyUrl(client.write.rest), input);
        // TODO handle errors
        const { url, payload } = (await clientResponse.json()) as { url: string; payload: PostIdsPrefsRequest };
        const operatorResponse = await this.httpService.postJson(url, payload);
        const operatorData = (await operatorResponse.json()) as GetIdsPrefsResponse;

        const persistedIds = operatorData?.body?.identifiers?.filter((identifier) => identifier?.persisted !== false);
        const hasPersistedId = persistedIds.length > 0;

        this.saveCookieValue(Cookies.identifiers, hasPersistedId ? persistedIds : undefined);
        this.saveCookieValue(Cookies.preferences, operatorData.body.preferences);

        await this.showNotificationIfValid(operatorData?.body?.preferences?.data?.use_browsing_for_personalization);

        return operatorData.body;
      }

      this.log.Info('3PC not supported: redirect');

      // Redirect. Signing of the request will happen on the backend proxy
      const clientUrl = new URL(this.getProxyUrl(client.write.redirect));
      clientUrl.searchParams.set(clientUriParams.returnUrl, location.href);
      clientUrl.searchParams.set(clientUriParams.message, JSON.stringify(input));

      const clientResponse = await this.httpService.get(clientUrl.toString());
      // TODO handle errors
      const operatorUrl = await clientResponse.text();
      this.httpService.redirect(operatorUrl);
    };

    const idsAndPreferences = await processWriteIdsAndPref();

    this.log.Info('Finished', idsAndPreferences);

    return idsAndPreferences;
  };

  /**
   * Sign preferences
   * @param options:
   * - proxyBase: base URL (scheme, servername) of the OneKey client node. ex: https://paf.my-website.com
   * @param input the main identifier of the web user, and the optin value
   * @return the signed Preferences
   */
  signPreferences = async (input: PostSignPreferencesRequest): Promise<Preferences> => {
    // TODO use ProxyRestSignPreferencesRequestBuilder
    const signedResponse = await this.httpService.postJson(this.getProxyUrl(client.signPrefs.rest), input);
    return (await signedResponse.json()) as Preferences;
  };

  /**
   * Get new random identifier
   * @param options:
   * - proxyBase: base URL (scheme, servername) of the OneKey client node. ex: https://paf.my-website.com
   * @return the new Id, signed
   */
  getNewId = async (): Promise<Identifier> => {
    const newIdUrl = await this.httpService.get(this.getProxyUrl(client.newId.rest));
    const response = await this.httpService.get(await newIdUrl.text());
    // Assume no error. FIXME should handle potential errors
    return ((await response.json()) as GetNewIdResponse).body.identifiers[0];
  };

  /**
   * Get Ids and Preferences by checking locally and refresh it if necessary.
   */
  getIdsAndPreferences: () => Promise<IdsAndPreferencesResult | undefined> = executeInQueueAsync<
    void,
    IdsAndPreferencesResult | undefined
  >(async () => {
    let data = this.getIdsAndPreferencesFromCookies();
    let status = PafStatus.PARTICIPATING;

    // If data is not available locally, refresh from the operator
    if (data === undefined) {
      const refreshed = await this.refreshIdsAndPreferences();
      if (refreshed.status === PafStatus.PARTICIPATING) {
        data = refreshed.data as IdsAndPreferences;
      }
      status = refreshed.status;
    }

    return {
      data,
      status,
    };
  });

  /**
   * If at least one identifier and some preferences are present as a 1P cookie, return them
   * Otherwise, return undefined
   */
  private getIdsAndPreferencesFromCookies = (): IdsAndPreferences | undefined => {
    if (!getCookieValue(Cookies.lastRefresh)) {
      return undefined;
    }

    // Remove special string values
    const cleanCookieValue = (rawValue: string) =>
      rawValue === PafStatus.REDIRECT_NEEDED || rawValue === PafStatus.NOT_PARTICIPATING ? undefined : rawValue;

    const strIds = cleanCookieValue(getCookieValue(Cookies.identifiers));
    const strPreferences = cleanCookieValue(getCookieValue(Cookies.preferences));

    const values = this.fromClientCookieValues(strIds, strPreferences);

    // If the object is not complete (no identifier or no preferences), then consider no valid data
    if (values.identifiers === undefined || values.identifiers.length === 0 || values.preferences === undefined) {
      return undefined;
    }

    return values as IdsAndPreferences;
  };

  private createSeed = async (transactionIds: TransactionId[]): Promise<SeedEntry | undefined> => {
    if (transactionIds.length == 0) {
      return undefined;
    }
    const url = this.getProxyUrl(client.createSeed.rest);
    const idsAndPreferencesResult = await this.getIdsAndPreferences();
    if (idsAndPreferencesResult === undefined || idsAndPreferencesResult.data === undefined) {
      return undefined;
    }
    const requestContent: PostSeedRequest = {
      transaction_ids: transactionIds,
      data: idsAndPreferencesResult.data,
    };
    const response = await this.httpService.postJson(url, requestContent);
    const seed = (await response.json()) as Seed;

    return {
      seed,
      idsAndPreferences: idsAndPreferencesResult.data,
    };
  };

  /**
   * Call hostname endpoint for generating a seed
   * and store the Seed on Browser side so that it can be retrieved later.
   *
   * @param options domain called for creating the Seed (POST /paf-proxy/v1/seed).
   * @param pafTransactionIds List of Transaction Ids for OneKey (visible in the Audit).
   * @returns A new signed Seed that can be used to start Transmissions Requests.
   */
  generateSeed = async (pafTransactionIds: TransactionId[]): Promise<Seed | undefined> => {
    const entry = await this.createSeed(pafTransactionIds);

    if (entry !== undefined) {
      for (const id of pafTransactionIds) {
        this.seedStorageService.saveSeed(id, entry);
      }
    }

    return entry?.seed;
  };

  /**
   * Calls the proxy to verify the seed signature, based on both the seed and the ids and preferences.
   * Note: ids and preferences must be provided because they might be different from the ones currently stored as cookies.
   * @param seed
   * @param idsAndPreferences
   */
  verifySeed = async (seed: Seed, idsAndPreferences: IdsAndPreferences): Promise<boolean> => {
    const url = this.getProxyUrl(client.verifySeed.rest);
    const requestContent: PostVerifySeedRequest = {
      seed,
      idsAndPreferences,
    };
    const response = await this.httpService.postJson(url, requestContent);
    return response.ok;
  };

  /**
   * Calls the proxy to verify the transmission result, based on both the transmission result and the seed.
   * @param transmissionResult
   * @param seed
   */
  verifyTransmissionResult = async (transmissionResult: TransmissionResult, seed: Seed): Promise<boolean> => {
    const url = this.getProxyUrl(client.verifyTransmission.rest);
    const requestContent: PostVerifyTransmissionResultRequest = {
      seed,
      transmissionResult,
    };
    const response = await this.httpService.postJson(url, requestContent);
    return response.ok;
  };

  /**
   * Register the Transmission Response of an initial Transmission Request for a given Seed.
   * @param context
   * @param transmissionResponse Transmission Response of an initial Transmission Request containing all the children.
   * @returns The generated AuditLog or undefined if the given Transaction Id is unknown or malformed.
   */
  registerTransmissionResponse = (
    { divIdOrAdUnitCode, contentId, auditHandler }: TransmissionRegistryContext,
    transmissionResponse: TransmissionResponse
  ): AuditLog | undefined => {
    const divId = mapAdUnitCodeToDivId(divIdOrAdUnitCode) || divIdOrAdUnitCode;
    const divContainer = document.getElementById(divId);
    if (divContainer === undefined) {
      this.log.Warn('No div found with id', divId);
      return undefined;
    }
    const pafTransactionId = findTransactionPath(transmissionResponse, contentId)?.transactionId;
    if (pafTransactionId === undefined) {
      this.log.Warn('Transaction id not found for content id', contentId);
      return undefined;
    }
    const seedEntry = this.seedStorageService.getSeed(pafTransactionId);
    if (seedEntry === undefined) {
      this.log.Warn('Seed entry not found for transaction', pafTransactionId);
      return undefined;
    }
    const auditLog = buildAuditLog(seedEntry.seed, seedEntry.idsAndPreferences, transmissionResponse, contentId);
    if (auditLog === undefined) {
      this.log.Warn('Empty audit log');
      return undefined;
    }
    this.auditLogStorageService.saveAuditLog(divId, auditLog);
    if (auditHandler) {
      auditHandler.bind(divContainer);
    }
    this.sendAuditLogNotification(divContainer);
    return auditLog;
  };

  private sendAuditLogNotification(element: HTMLElement) {
    this.auditLogManager.fireEvent(element).then(() => {
      this.log.Info(`Emitting event: AuditLog available for ${element.id}`);
    });
  }

  /**
   * @param divId The id of the tag (<div id="something">) that contains the addressable content..
   * @returns The Audit Log attached to this DivId.
   */
  getAuditLogByDivId = (divId: DivId): AuditLog | undefined => {
    return this.auditLogStorageService.getAuditLogByDivId(divId);
  };

  setAuditLogHandler(handler: (element: HTMLElement) => Promise<void>) {
    this.auditLogManager.handler = handler;
  }

  deleteIdsAndPreferences = async (): Promise<void> => {
    this.log.Info('Attempt to delete ids and preferences');

    const strIds = getCookieValue(Cookies.identifiers);
    const strPreferences = getCookieValue(Cookies.preferences);
    const pafStatus = this.getPafStatus(strIds, strPreferences);

    if (pafStatus === PafStatus.NOT_PARTICIPATING) {
      this.log.Info('User is already not participating, nothing to clean');
      return;
    }

    // FIXME this boolean will be up to date only if a read occurred just before. If not, would need to explicitly test
    if (this.thirdPartyCookiesSupported) {
      this.log.Info('3PC supported: deleting the ids and preferences');

      // Get the signed request for the operator
      const clientNodeDeleteResponse = await this.httpService.deleteHttp(this.getProxyUrl(client.delete.rest));
      const operatorDeleteUrl = await clientNodeDeleteResponse.text();

      // Call the operator, which will clean its cookies
      await this.httpService.deleteHttp(operatorDeleteUrl);

      // Clean the local cookies
      this.saveCookieValue(Cookies.identifiers, undefined);
      this.saveCookieValue(Cookies.preferences, undefined);

      this.log.Info('Deleted ids and preferences');
      return;
    }

    this.log.Info('3PC not supported: redirecting to delete ids and preferences');

    // Redirect. Signing of the request will happen on the backend proxy
    const clientUrl = new URL(this.getProxyUrl(client.delete.redirect));
    clientUrl.searchParams.set(clientUriParams.returnUrl, location.href);
    const clientResponse = await this.httpService.get(clientUrl.toString());

    // TODO handle errors
    const operatorUrl = await clientResponse.text();
    this.httpService.redirect(operatorUrl);
  };
}

// TODO ------------------------------------------------------ move to one-key-lib.ts END

// TODO ------------------------------------------------------ move to rtb.ts START
export type PrebidTransactionId = string;
export type DivId = string;
export type ContentId = string;

export interface AuditHandler {
  // Binds the element to the audit handler.
  bind(element: HTMLElement): void;
}

export interface TransmissionRegistryContext {
  /**
   * The Id of the tag (<div id="something">) that contains the
   * addressable content or the Google Publisher Tag adUnitCode.
   */
  divIdOrAdUnitCode: string;
  contentId: ContentId;
  auditHandler?: AuditHandler;
}

/**
 * Aggregate Seed and Preferences for storage.
 *
 * We must record the Ids and Preferences
 * in case they change in the cookies after the
 * generation of the Seed.
 */
export interface SeedEntry {
  seed: Seed;
  idsAndPreferences: IdsAndPreferences;
}

// TODO ------------------------------------------------------ move to rtb.ts END

// TODO ------------------------------------------------------ move to i-one-key-lib.ts END
