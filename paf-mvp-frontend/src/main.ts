import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';

const promptConsent = () => {
  return new Promise<boolean>((resolve) => {
    const widget = new PromptConsent({
      emitConsent: value => resolve(value),
    });
    widget.render();
  });
}

declare global {
  interface Window {
    __promptConsent: () => Promise<boolean>;
  }
}
window.__promptConsent = promptConsent;
