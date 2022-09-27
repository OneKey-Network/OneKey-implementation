import { Locale } from './locale';
import { Controller } from './controller';
import { Window } from '@onekey/frontend/global';
import { Log, LogLevel } from '@onekey/core';

// Debug level while playing with MVP
Log.level = LogLevel.Debug;

const log = new Log('audit', '#18a9e1');
const auditLogHandler = (element: HTMLElement) =>
  new Promise<void>((resolve) => {
    log.Info('register', element.id);
    new Controller(new Locale(window.navigator.languages), element, log);
    resolve();
  });
(<Window>window).OneKey.setAuditLogHandler(auditLogHandler);
