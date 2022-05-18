import {
  generateSeed,
  getAuditLogByDivId,
  getAuditLogByTransaction,
  getIdsAndPreferences,
  getNewId,
  queue,
  refreshIdsAndPreferences,
  registerTransmissionResponse,
  signPreferences,
  updateIdsAndPreferences,
} from './lib/paf-lib';
import { NotificationEnum } from './enums/notification.enum';

declare global {
  interface Window {
    PAF: {
      queue: typeof queue;
      getNewId: typeof getNewId;
      signPreferences: typeof signPreferences;
      getIdsAndPreferences: typeof getIdsAndPreferences;
      refreshIdsAndPreferences: typeof refreshIdsAndPreferences;
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
  }
}

export {};
