import {
  getIdsAndPreferences,
  refreshIdsAndPreferences,
  signPreferences,
  writeIdsAndPref,
  getNewId,
} from './lib/paf-lib';
import { NotificationEnum } from './enums/notification.enum';

declare global {
  interface Window {
    PAF: {
      getNewId: typeof getNewId;
      signPreferences: typeof signPreferences;
      writeIdsAndPref: typeof writeIdsAndPref;
      getIdsAndPreferences: typeof getIdsAndPreferences;
      refreshIdsAndPreferences: typeof refreshIdsAndPreferences;
    };
    PAFUI: {
      promptConsent: () => Promise<boolean>;
      showNotification: (notificationType: NotificationEnum) => void;
    };
  }
}

export {};
