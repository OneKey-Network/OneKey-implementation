import {
  generateSeed,
  getAuditLogByDivId,
  getAuditLogByTransaction,
  getIdsAndPreferences,
  getNewId,
  registerTransmissionResponse,
  signPreferences,
  updateIdsAndPreferences,
} from './lib/paf-lib';
import { NotificationEnum } from './enums/notification.enum';
import { ICommandProcessor } from './utils/queue';

export type Window = WindowProxy &
  typeof globalThis & {
    PAF: {
      queue?: ICommandProcessor;
      getNewId: typeof getNewId;
      signPreferences: typeof signPreferences;
      getIdsAndPreferences: typeof getIdsAndPreferences;
      updateIdsAndPreferences: typeof updateIdsAndPreferences;
      generateSeed: typeof generateSeed;
      registerTransmissionResponse: typeof registerTransmissionResponse;
      getAuditLogByTransaction: typeof getAuditLogByTransaction;
      getAuditLogByDivId: typeof getAuditLogByDivId;
    };
    PAFUI: {
      promptConsent: () => Promise<boolean>;
      showNotification: (notificationType: NotificationEnum) => void;
    };
  };
