import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';
import { NotificationEnum } from '@frontend/enums/notification.enum';
import { currentScript } from '@frontend/utils/current-script';
import { oneKeyLib } from './lib/paf-lib';
import { Window } from './global';

currentScript.setScript(document.currentScript as HTMLScriptElement);

(<Window>window).PAF = {
  ...((<Window>window).PAF ?? {}),
  // The rest has to be the official methods, should not be overridden from the outside
  ...oneKeyLib,
};

(async () => {
  const originalData = (await (window as Window).PAF.getIdsAndPreferences()).data;
  const promptConsent = () =>
    new Promise<boolean>((resolve) => new PromptConsent({ emitConsent: resolve, originalData }).render());
  const showNotification = (type: NotificationEnum) => notificationService.showNotification(type);

  (<Window>window).PAFUI ??= { promptConsent, showNotification };
  (window as Window).PAF.setPromptHandler(promptConsent);
})();
