import { Locale } from './locale';
import { Config } from './config';
import { Controller } from './controller';
import { Log } from '@core/log';
import { NotificationEnum } from '@frontend/enums/notification.enum';

let controller: Controller = null;

const promptConsent = () =>
  new Promise<void>((resolve) => {
    if (controller !== null) {
      controller.display('settings');
    }
    resolve();
  });
const showNotification = (type: NotificationEnum) => new Log('ok-ui', '#18a9e1').Message('showNotification', type);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore this is needed because the paf-lib expects a global object called PAFUI. Consider altering paf-lib to
// become a data layer only without any UI considerations.
window.PAFUI ??= { promptConsent, showNotification };
controller = new Controller(
  document.currentScript,
  new Locale(window.navigator.languages),
  new Config(document.currentScript)
);
