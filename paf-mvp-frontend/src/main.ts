import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';
import { NotificationEnum } from '@frontend/enums/notification.enum';
import { currentScript } from '@frontend/utils/current-script';
import {
  getIdsAndPreferences,
  getNewId,
  refreshIdsAndPreferences,
  signPreferences,
  updateIdsAndPreferences,
} from './lib/paf-lib';

currentScript.setScript(document.currentScript as HTMLScriptElement);

const promptConsent = () => new Promise<boolean>((resolve) => new PromptConsent({ emitConsent: resolve }).render());
const showNotification = (type: NotificationEnum) => notificationService.showNotification(type);

// TODO: avoid global declaration
window.PAFUI ??= { promptConsent, showNotification };
window.PAF ??= { getNewId, signPreferences, getIdsAndPreferences, refreshIdsAndPreferences, updateIdsAndPreferences };
