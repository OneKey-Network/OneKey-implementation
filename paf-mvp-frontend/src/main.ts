import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';
import { NotificationEnum } from '@frontend/enums/notification.enum';
import { currentScript } from '@frontend/utils/current-script';
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

currentScript.setScript(document.currentScript as HTMLScriptElement);

const promptConsent = () => new Promise<boolean>((resolve) => new PromptConsent({ emitConsent: resolve }).render());
const showNotification = (type: NotificationEnum) => notificationService.showNotification(type);

// TODO: avoid global declaration
window.PAFUI ??= { promptConsent, showNotification };
window.PAF ??= {
  // Inject the "official" queue
  queue,
  // If the queue has been defined outside of this script, will be replaced by it
  ...(window.PAF ?? {}),
  // The rest has to be the official methods, should not be overridden from the outside
  getNewId,
  signPreferences,
  getIdsAndPreferences,
  refreshIdsAndPreferences,
  updateIdsAndPreferences,
  generateSeed,
  registerTransmissionResponse,
  getAuditLogByTransaction,
  getAuditLogByDivId,
};
