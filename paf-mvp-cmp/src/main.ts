import { Locale } from './locale';
import { Config } from './config';
import { Controller } from './controller';
import { Log } from '@core/log';
import { NotificationEnum } from '@frontend/enums/notification.enum';

const log = new Log('ok-ui', '#18a9e1');
let controller: Controller = null;

// TODO: See later comment on how to align the UI and data layer.
const promptConsent = () =>
  new Promise<boolean | undefined>((resolve) => {
    log.Message('promptConsent');
    if (controller !== null) {
      controller.display('settings');
    }
    resolve(undefined);
  });

// TODO: See later comment on how to align the UI and data layer.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const showNotification = (type: NotificationEnum) => {
  if (controller !== null) {
    controller.display('settings');
  }
};

controller = new Controller(
  document.currentScript,
  new Locale(window.navigator.languages),
  new Config(document.currentScript, log),
  log
);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore this is needed because the paf-lib expects a global object called PAFUI. Consider altering paf-lib to
// become a data layer only without any UI considerations.
window.PAFUI ??= { promptConsent, showNotification, controller };
