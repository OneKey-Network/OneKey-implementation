import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';
import { NotificationEnum } from '@frontend/enums/notification.enum';
import { currentScript } from '@frontend/utils/current-script';
import { Window } from './global';

currentScript.setScript(document.currentScript as HTMLScriptElement);

(async () => {
  const originalData = (await (window as Window).PAF.getIdsAndPreferences()).data;
  const promptConsent = () =>
    new Promise<boolean>((resolve) => new PromptConsent({ emitConsent: resolve, originalData }).render());
  const showNotification = (type: NotificationEnum) => notificationService.showNotification(type);

  (window as Window).PAF.setPromptHandler(promptConsent);
  (window as Window).PAF.setNotificationHandler((type) => {
    showNotification(type);
    return Promise.resolve();
  });
})();
