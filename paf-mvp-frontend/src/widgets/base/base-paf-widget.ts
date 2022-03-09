import { ComponentFactory, createElement, render, VNode } from 'preact';
import { createHtmlElement } from '../../utils/create-html-element';
import { env } from '../../config';

export abstract class BasePafWidget {
  protected element: HTMLElement;

  get styleHref() {
    return `${env.host}/${env.isDevelopment ? 'dist' : 'assets'}/app.bundle.css`;
  }

  constructor(selector: string, private component: ComponentFactory<any>) {
    this.preloadStyles();
    this.renderWidget = this.renderWidget.bind(this);
    this.element = createHtmlElement('div', { [selector]: '' });
  }

  render() {
    if (this.checkLoaded()) {
      this.renderWidget();
    } else {
      window.addEventListener('load', this.renderWidget);
    }
  }

  remove() {
    this.element.remove();
  }

  private renderWidget() {
    const stylesElement = createElement('link', { rel: 'stylesheet', href: this.styleHref });
    document.body.appendChild(this.element);
    this.bindEvents();
    window.removeEventListener('load', this.renderWidget);

    // Add shadow root if the browser supports it
    if (document.head.attachShadow) {
      this.renderAsShadow(stylesElement);
    } else {
      this.renderAsLegacy(stylesElement);
    }
  }

  private renderAsShadow(stylesElement: VNode) {
    const shadowRoot = this.element.attachShadow({ mode: 'open' });

    render(createElement(this.component, null), shadowRoot);
    render(stylesElement, shadowRoot.firstChild as Element);
  }

  private renderAsLegacy(stylesElement: VNode) {
    render(createElement(this.component, null), this.element);
    render(stylesElement, document.head);
  }

  protected bindEvents() {
  }

  protected checkLoaded() {
    return document.readyState === 'complete';
  }

  private preloadStyles() {
    const preloadElement = createElement('link', { rel: 'preload', href: this.styleHref, as: 'style' });
    render(preloadElement, document.head);
  }
}
