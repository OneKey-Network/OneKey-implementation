import {
  getIdsAndPreferences,
  getNewId,
  refreshIdsAndPreferences,
  signPreferences,
  updateIdsAndPreferences,
} from './lib/paf-lib';
import { NotificationEnum } from './enums/notification.enum';

declare global {
  interface Window {
    PAF: {
      getNewId: typeof getNewId;
      signPreferences: typeof signPreferences;
      getIdsAndPreferences: typeof getIdsAndPreferences;
      refreshIdsAndPreferences: typeof refreshIdsAndPreferences;
      updateIdsAndPreferences: typeof updateIdsAndPreferences;
    };
    PAFUI: {
      promptConsent: () => Promise<boolean>;
      showNotification: (notificationType: NotificationEnum) => void;
    };
  }
}

export {};
