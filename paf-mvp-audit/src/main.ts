import { Locale } from './locale';
import { Controller } from './controller';
import { Log, LogLevel } from '@core/log';

// Debug level while playing with MVP
Log.level = LogLevel.Debug;

const log = new Log('audit', '#18a9e1');

class MonitoredElement extends HTMLDivElement {
  public timer: NodeJS.Timer;
}

document.querySelectorAll('[auditLog]').forEach((e) => {
  if (e instanceof HTMLDivElement) {
    log.Info('register', e.id);
    const content = e.innerHTML;
    (<MonitoredElement>e).timer = setInterval(() => {
      log.Info('check', e.id);
      if (content !== e.innerHTML) {
        log.Info('adding', e.id);
        clearInterval((<MonitoredElement>e).timer);
        new Controller(new Locale(window.navigator.languages), e, log);
      }
    }, 1000);
  }
});
