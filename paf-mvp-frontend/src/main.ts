import './polyfills/assign';
import './styles.scss';
import habitat from 'preact-habitat';
import { WelcomeWidget } from './containers/welcome-widget/WelcomeWidget';
import { env } from './config';
import { createElement } from './utils/create-element';
import { IWidgetEvent } from './serivces/widget-events';
import { globalEventManager } from './managers/event-manager';

function checkLoaded() {
  return document.readyState === 'complete';
}

function render(element?: HTMLElement) {
  const selector = '[paf-root]';
  const widgetElement = element ?? document.querySelector(selector) as HTMLElement;

  if (!widgetElement) return;
  const widget = habitat(WelcomeWidget);
  const styles = createElement('link', { href: `${env.host}/dist/app.bundle.css`, rel: 'stylesheet' });

  widget.render({ selector });
  widgetElement.appendChild(styles);
  globalEventManager.getSubscription()
    .subscribe((widgetEvent: IWidgetEvent) => {
      const customEvent = new CustomEvent(widgetEvent.type, {detail: widgetEvent.payload});
      widgetElement.dispatchEvent(customEvent);
    });

// Add shadow root if the browser supports it
  if (document.head.attachShadow) {
    const shadowRoot = widgetElement.attachShadow({ mode: 'open' });
    Array.from(widgetElement.children).forEach((child) => shadowRoot.appendChild(child));
  }
}

if (env.isDevelopment) {
  render();
}

const promptConsent = () => {
  const widgetElement = createElement('div', {'paf-root': ''});
  const renderCallback = () => {
    document.body.appendChild(widgetElement);
    render(widgetElement);
  }
  if (checkLoaded()) {
    renderCallback();
  } else {
    window.addEventListener('load', renderCallback);
  }

  return new Promise<boolean>((resolve) => {
    widgetElement.addEventListener('grantConsent', (response: CustomEvent<boolean>) => {
      resolve(response.detail);
      widgetElement.remove();
    }, true);
  });
}


declare global {
  interface Window {
    __promptConsent: () => Promise<boolean>;
  }
}
window.__promptConsent = promptConsent;
