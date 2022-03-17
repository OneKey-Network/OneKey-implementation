import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { notificationService } from './services/notification.service';

const promptConsent = () => {
  return new Promise<boolean>(resolve => new PromptConsent({ emitConsent: value => resolve(value), }).render());
};

notificationService.displayDelayedNotification();

declare global {
  interface Window {
    __promptConsent: () => Promise<boolean>;
  }
}
window.__promptConsent = promptConsent;
