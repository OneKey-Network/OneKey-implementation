import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';
import { NotificationEnum } from '@frontend/enums/notification.enum';
import { currentScript } from '@frontend/utils/current-script';
import { Window } from './global';

currentScript.setScript(document.currentScript as HTMLScriptElement);

const promptConsent = () =>
  new Promise<boolean>((resolve) => {
    (window as Window).PAF.getIdsAndPreferences().then((response) => {
      const originalData = response.data;
      new PromptConsent({ emitConsent: resolve, originalData }).render();
    });
  });

const showNotification = (type: NotificationEnum) =>
  new Promise<void>((resolve) => {
    notificationService.showNotification(type);
    resolve();
  });

(window as Window).PAF.setPromptHandler(promptConsent);
(window as Window).PAF.setNotificationHandler(showNotification);
