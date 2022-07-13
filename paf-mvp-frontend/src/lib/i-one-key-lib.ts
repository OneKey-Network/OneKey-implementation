// TODO ------------------------------------------------------ move to i-one-key-lib.ts START
import { PafStatus } from '@frontend/enums/status.enum';
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
} from '@core/model';
import { DivId, PrebidTransactionId, SeedEntry, TransmissionRegistryContext } from '@frontend/lib/rtb';
import { NotificationEnum } from '@frontend/enums/notification.enum';

export enum ShowPromptOption {
  doNotPrompt = 'doNotPrompt',
  doPrompt = 'doPrompt',
  promptIfUnknownUser = 'promptIfUnknownUser',
}

/**
 * Refresh result
 */
export interface RefreshResult {
  status: PafStatus;
  data?: IdsAndOptionalPreferences;
}

/**
 * Refresh result
 */
export interface IdsAndPreferencesResult {
  status: PafStatus;
  data?: IdsAndPreferences;
}

export type CookieData = {
  strIds: string;
  lastRefresh: string;
  strPreferences: string;
  currentlySelectedConsent: boolean;
  currentPafData: IdsAndOptionalPreferences;
};

export interface IOneKeyLib {
  unpersistedIds?: Identifier[];
  triggerNotification: (initialData: CookieData, newConsent: boolean) => Promise<void>;
  refreshIdsAndPreferences: (showPrompt?: ShowPromptOption) => Promise<RefreshResult>;
  writeIdsAndPref: (input: IdsAndPreferences) => Promise<IdsAndOptionalPreferences | undefined>;
  signPreferences: (input: PostSignPreferencesRequest) => Promise<Preferences>;
  getNewId: () => Promise<Identifier>;
  getIdsAndPreferences: () => Promise<IdsAndPreferencesResult | undefined>;
  createSeed: (transactionIds: TransactionId[]) => Promise<SeedEntry | undefined>;
  generateSeed: (pafTransactionIds: TransactionId[]) => Promise<Seed | undefined>;
  registerTransmissionResponse: (
    { prebidTransactionId, pafTransactionId, divIdOrAdUnitCode, contentId, auditHandler }: TransmissionRegistryContext,
    transmissionResponse: TransmissionResponse
  ) => AuditLog | undefined;
  getAuditLogByTransaction: (prebidTransactionId: PrebidTransactionId) => AuditLog | undefined;
  getAuditLogByDivId: (divId: DivId) => AuditLog | undefined;
  deleteIdsAndPreferences: () => Promise<void>;
  setPromptHandler: (handler: () => Promise<boolean>) => void;
  promptConsent: () => Promise<boolean>;
  setNotificationHandler: (handler: (notificationType: NotificationEnum) => Promise<void>) => void;
  showNotification: (notificationType: NotificationEnum) => Promise<void>;
  updateIdsAndPreferences: (
    optIn: boolean,
    identifiers: Identifier[]
  ) => Promise<IdsAndOptionalPreferences | undefined>;
  removeCookie: (cookieName: string) => void;
}
