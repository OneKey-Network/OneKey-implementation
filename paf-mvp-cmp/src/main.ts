import { Config } from './config';
import { Controller } from './controller';
import { Log } from '@core/log';
import { NotificationEnum } from '@frontend/enums/notification.enum';
import { Window } from '@frontend/global';

/**
 * The language text object populated by rollup.config.js at build time based on the YAML resource language files.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore rollup replaces this with the JS object for the language.
const locale = <ILocale>__Locale__;

// The TCF core template string. Populated from the environment variable TCF_CORE_TEMPLATE at build time. See
// ../rollup.config.js for details.
const tcfCoreTemplate = '__TcfCoreTemplate__';

const log = new Log('ok-ui', '#18a9e1');
let controller: Controller = null;

// TODO: See later comment on how to align the UI and data layer.
const promptConsent = () =>
  new Promise<boolean | undefined>((resolve) => {
    log.Message('promptConsent');
    if (controller !== null) {
      log.Message('show settings');
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore this is needed because the paf-lib expects a global object called PAFUI. Consider altering paf-lib to
// become a data layer only without any UI considerations.
window.PAFUI ??= { promptConsent, showNotification };

// Construct the controller with the loosely typed language object.
controller = new Controller(
  document.currentScript,
  new Config(document.currentScript, tcfCoreTemplate, log),
  locale,
  log
);

(window as Window).PAF.setPromptHandler(promptConsent);
