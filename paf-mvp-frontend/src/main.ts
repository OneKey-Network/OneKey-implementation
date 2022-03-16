import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';
import { NotificationWidget } from './widgets/notification';

const promptConsent = () => {
  return new Promise<boolean>((resolve) => {
    const widget = new PromptConsent({
      emitConsent: value => resolve(value),
    });
    widget.render();
  });
};

const showNotification = () => {
  const widget = new NotificationWidget({ type: 'personalized' });
  widget.render();
};

declare global {
  interface Window {
    __promptConsent: () => Promise<boolean>;
    __showNotification: () => void;
  }
}
window.__promptConsent = promptConsent;
window.__showNotification = showNotification;
