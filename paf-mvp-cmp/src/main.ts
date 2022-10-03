import { Config } from './config';
import { Controller } from './controller';
import { Log, LogLevel } from '@onekey/core/log';
import { NotificationEnum } from '@onekey/frontend/enums/notification.enum';
import { Window } from '@onekey/frontend/global';

/**
 * The language text object populated by rollup.config.js at build time based on the YAML resource language files.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore rollup replaces this with the JS object for the language.
const locale = <ILocale>__Locale__;

// The TCF core template string. Populated from the environment variable TCF_CORE_TEMPLATE at build time. See
// ../rollup.config.js for details.
const tcfCoreTemplate = '__TcfCoreTemplate__';

// Debug level while playing with MVP
Log.level = LogLevel.Debug;

const log = new Log('ok-ui', '#18a9e1');
let controller: Controller = null;

// TODO: See later comment on how to align the UI and data layer.
const promptConsent = () =>
  new Promise<boolean | undefined>((resolve) => {
    log.Info('promptConsent');
    if (controller !== null) {
      log.Info('show settings');
      controller.display('settings');
    }
    resolve(undefined); // FIXME should return values!
  });

// TODO: See later comment on how to align the UI and data layer.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const showNotification = (type: NotificationEnum) =>
  new Promise<void>((resolve) => {
    if (controller !== null) {
      // Show notification snack bar
      controller.display('snackbar');
    }
    resolve();
  });

// Construct the controller with the loosely typed language object.
controller = new Controller(
  document.currentScript,
  new Config(document.currentScript, tcfCoreTemplate, log),
  locale,
  log
);

(window as Window).OneKey.setPromptHandler(promptConsent);
(window as Window).OneKey.setNotificationHandler(showNotification);
