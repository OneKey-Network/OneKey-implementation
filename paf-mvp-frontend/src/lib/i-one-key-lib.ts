import {
  AuditLog,
  Identifier,
  IdsAndOptionalPreferences,
  IdsAndPreferences,
  PostSignPreferencesRequest,
  Preferences,
  Seed,
  TransactionId,
  TransmissionResponse,
  TransmissionResult,
} from '@onekey/core/model';
import { NotificationEnum } from '@onekey/frontend/enums/notification.enum';
import { DivId, TransmissionRegistryContext } from '@onekey/frontend/lib/paf-lib';
import { PafStatus } from '@onekey/frontend/enums/status.enum';

export type CookieData = {
  strIds: string;
  lastRefresh: string;
  strPreferences: string;
  currentlySelectedConsent: boolean;
  currentPafData: IdsAndOptionalPreferences;
};

export interface IOneKeyLib {
  // ---------------------------------------------------------------------------------- Ids and preferences manipulation

  /**
   * Return the list of identifiers and the user preferences (`paf_identifiers` and `paf_preferences`),
   * if they exist as 1st party cookies.
   * If they don't, trigger a call to refreshIdsAndPreferences, to refresh data from the operator
   */
  getIdsAndPreferences: () => Promise<IdsAndPreferencesResult | undefined>;

  /**
   * Call the OneKey operator (via the client node) to get fresh ids and preferences.
   * This is done via XHR calls or HTTP redirect if needed, when 3d party cookies are not supported.
   * 1st party cookies are updated if needed.
   * If the user is not known from OneKey yet, a new id is generated and saved in unpersistedIds for future usage.
   * @param showPrompt if the data from the operator doesn't exist, should we prompt the user for consent?
   */
  refreshIdsAndPreferences: (showPrompt?: ShowPromptOption) => Promise<RefreshResult>;

  /**
   * Ids that have generated from the operator, but not persisted as 1st party or 3d party cookies
   */
  unpersistedIds?: Identifier[];

  /**
   * Call the operator (via the client node) to get a **new OneKey ID** value.
   * Note that this id is **not** yet persisted: to persist it, updateIdsAndPreferences must be called
   */
  getNewId: () => Promise<Identifier>;

  /**
   * Take identifiers and unsigned preferences as input, and **sign it** through a call to the client.
   * @param idsAndPreferencesToSign
   */
  signPreferences: (idsAndPreferencesToSign: PostSignPreferencesRequest) => Promise<Preferences>;

  /**
   * Create a preferences value based on optIn parameter, sign it (through a call to signPreferences) and writes it
   * on the OneKey domain (via the client).
   * @param optIn
   * @param identifiers
   */
  updateIdsAndPreferences: (
    optIn: boolean,
    identifiers: Identifier[]
  ) => Promise<IdsAndOptionalPreferences | undefined>;

  /**
   * Delete the identifiers and preferences (locally and from the operator) via the client node
   */
  deleteIdsAndPreferences: () => Promise<void>;

  /**
   * Remove a local (1st party) cookie
   * @param cookieName
   */
  removeCookie: (cookieName: string) => void;

  // --------------------------------------------------------------------------------------------------------------- RTB

  /**
   * Generate a "seed" object based on transaction ids, to be used in OneKey-compliant bids
   * @param pafTransactionIds
   */
  generateSeed: (pafTransactionIds: TransactionId[]) => Promise<Seed | undefined>;

  // ------------------------------------------------------------------------------------------------------------- Audit

  /**
   * Register a transmission response part of a bid response, and get the audit log
   * @param divIdOrAdUnitCode
   * @param contentId
   * @param auditHandler
   * @param transmissionResponse
   */
  registerTransmissionResponse: (
    { divIdOrAdUnitCode, contentId, auditHandler }: TransmissionRegistryContext,
    transmissionResponse: TransmissionResponse
  ) => AuditLog | undefined;

  /**
   * Verify the seed has been correctly signed with ids and preferences (via a call to the client node)
   * @param seed
   * @param idsAndPreferences
   */
  verifySeed: (seed: Seed, idsAndPreferences: IdsAndPreferences) => Promise<boolean>;

  /**
   * Verify that a transmission result has been correctly signed with the seed (via a call to the client node)
   * @param transmissionResult
   * @param seed
   */
  verifyTransmissionResult: (transmissionResult: TransmissionResult, seed: Seed) => Promise<boolean>;

  /**
   * Get the audit log of a specific div id
   * @param divId
   */
  getAuditLogByDivId: (divId: DivId) => AuditLog | undefined;

  // -------------------------------------------------------------------------------------------------- User interaction

  /**
   * Trigger the display of the user prompt
   */
  promptConsent: () => Promise<boolean>;

  /**
   * Show a notification
   * @param notificationType
   */
  showNotification: (notificationType: NotificationEnum) => Promise<void>;

  // -------------------------------------------------------------------------------------------- Technical integrations

  /**
   * Register the "prompt handler", called when promptConsent is called
   * @param handler
   */
  setPromptHandler: (handler: () => Promise<boolean>) => void;

  /**
   * Register the "audit log handler", called when new audit is available
   * @param handler
   */
  setAuditLogHandler: (handler: (element: HTMLElement) => Promise<void>) => void;

  /**
   * Register the "notification handler", called when showNotification is called
   * @param handler
   */
  setNotificationHandler: (handler: (notificationType: NotificationEnum) => Promise<void>) => void;
}

/**
 * Prompt option when calling "refresh"
 */
export enum ShowPromptOption {
  doNotPrompt = 'doNotPrompt',
  doPrompt = 'doPrompt',
  promptIfUnknownUser = 'promptIfUnknownUser',
}

/**
 * Output of a "refresh"
 */
export interface RefreshResult {
  status: PafStatus;
  data?: IdsAndOptionalPreferences;
}

/**
 * Output of a "read"
 */
export interface IdsAndPreferencesResult {
  status: PafStatus;
  data?: IdsAndPreferences;
}
