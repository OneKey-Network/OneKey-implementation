import './polyfills/assign';
import './styles.scss';
import habitat from 'preact-habitat';
import { WelcomeWidget } from './containers/welcome-widget/WelcomeWidget';
import { env } from './config';
import { createElement } from './utils/create-element';

const selector = '[paf-root]';
const widget = habitat(WelcomeWidget);
const styles = createElement('link', { href: `${env.host}/dist/app.bundle.css`, rel: 'stylesheet' });
const widgetElement = document.querySelector(selector) as HTMLElement;

widget.render({ selector });
widgetElement.appendChild(styles);

// Add shadow root if the browser supports it
if (document.head.attachShadow) {
  const shadowRoot = widgetElement.attachShadow({ mode: 'open' });
  Array.from(widgetElement.children).forEach((child) => shadowRoot.appendChild(child));
}
