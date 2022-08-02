import { Locale } from './locale';
import { Controller } from './controller';
import { Log } from '@core/log';
import { Window } from '@frontend/global';

const log = new Log('audit', '#18a9e1');

const auditLogHandler = (element: HTMLElement) =>
  new Promise<void>((resolve) => {
    log.Message('register', element.id);
    new Controller(new Locale(window.navigator.languages), element, log);
    resolve();
  });
(<Window>window).OneKey.setAuditLogHandler(auditLogHandler);
