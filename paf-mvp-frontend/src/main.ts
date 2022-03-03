import './polyfills/assign';
import './styles.scss';
import habitat from 'preact-habitat';
import { WelcomeWidget } from './containers/welcome-widget/WelcomeWidget';
import { env } from './config';
import { createElement } from './utils/create-element';
import { IWidgetEvent, WidgetEvents } from './serivces/widget-events';

export const globalEventService = new WidgetEvents();

function render() {
  const selector = '[paf-root]';
  const widgetElement = document.querySelector(selector) as HTMLElement;

  if (!widgetElement) return;
  const widget = habitat(WelcomeWidget);
  const styles = createElement('link', { href: `${env.host}/dist/app.bundle.css`, rel: 'stylesheet' });

  widget.render({ selector });
  widgetElement.appendChild(styles);
  globalEventService.getSubscription()
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

declare global {
  interface Window {
    __renderPafWidget: () => void;
  }
}
window.__renderPafWidget = render;
