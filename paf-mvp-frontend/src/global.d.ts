import {
  deleteIdsAndPreferences,
  generateSeed,
  getAuditLogByDivId,
  getAuditLogByTransaction,
  getIdsAndPreferences,
  getNewId,
  registerTransmissionResponse,
  removeCookie,
  setNotificationHandler,
  setPromptHandler,
  signPreferences,
  updateIdsAndPreferences,
} from './lib/paf-lib';
import { NotificationEnum } from './enums/notification.enum';
import { IProcessingQueue } from './utils/queue';
import { Identifiers } from '@core/model';
import { PafStatus } from '@frontend/enums/status.enum';

export type Window = WindowProxy &
  typeof globalThis & {
    PAF: {
      queue?: IProcessingQueue;
      deleteIdsAndPreferences: typeof deleteIdsAndPreferences;
      removeCookie: typeof removeCookie;
      getNewId: typeof getNewId;
      signPreferences: typeof signPreferences;
      getIdsAndPreferences: typeof getIdsAndPreferences;
      updateIdsAndPreferences: typeof updateIdsAndPreferences;
      setPromptHandler: typeof setPromptHandler;
      setNotificationHandler: typeof setNotificationHandler;
      generateSeed: typeof generateSeed;
      registerTransmissionResponse: typeof registerTransmissionResponse;
      getAuditLogByTransaction: typeof getAuditLogByTransaction;
      getAuditLogByDivId: typeof getAuditLogByDivId;
      unpersistedIds?: Identifiers;
      status?: PafStatus;
    };
    PAFUI: {
      // FIXME remove
      promptConsent: () => Promise<boolean>;
      showNotification: (notificationType: NotificationEnum) => void;
    };
  };
