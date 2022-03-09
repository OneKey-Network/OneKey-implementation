import './polyfills/assign';
import './styles.scss';
import { PromptConsent } from './widgets/prompt-consent';

const promptConsent = () => {
  const widget = new PromptConsent();
  widget.render();
  return new Promise<boolean>((resolve) => {
    widget.getElement().addEventListener('grantConsent', (response: CustomEvent<boolean>) => {
      resolve(response.detail);
      widget.remove();
    }, true);
  });
}

declare global {
  interface Window {
    __promptConsent: () => Promise<boolean>;
  }
}
window.__promptConsent = promptConsent;
