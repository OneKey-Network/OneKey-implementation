import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';
import { NotificationEnum } from '@frontend/enums/notification.enum';
import { currentScript } from '@frontend/utils/current-script';
import {
  deleteIdsAndPreferences,
  generateSeed,
  getAuditLogByDivId,
  getAuditLogByTransaction,
  getIdsAndPreferences,
  getNewId,
  registerTransmissionResponse,
  removeCookie,
  signPreferences,
  updateIdsAndPreferences,
} from './lib/paf-lib';
import { Window } from './global';

currentScript.setScript(document.currentScript as HTMLScriptElement);

(<Window>window).PAF = {
  ...((<Window>window).PAF ?? {}),
  // The rest has to be the official methods, should not be overridden from the outside
  getNewId,
  signPreferences,
  deleteIdsAndPreferences,
  removeCookie,
  getIdsAndPreferences,
  updateIdsAndPreferences,
  generateSeed,
  registerTransmissionResponse,
  getAuditLogByTransaction,
  getAuditLogByDivId,
};

(async () => {
  const originalData = await (window as Window).PAF.getIdsAndPreferences();
  const promptConsent = () =>
    new Promise<boolean>((resolve) => new PromptConsent({ emitConsent: resolve, originalData }).render());
  const showNotification = (type: NotificationEnum) => notificationService.showNotification(type);

  (<Window>window).PAFUI ??= { promptConsent, showNotification };
})();
