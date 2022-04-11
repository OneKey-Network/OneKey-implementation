import { ComponentFactory, createElement, render, VNode } from 'preact';
import { createHtmlElement } from '../../utils/create-html-element';
import { env } from '../../config';
import { currentScript } from '@frontend/utils/current-script';

export abstract class BasePafWidget<T> {
  private readonly element: HTMLElement;
  private readonly elementNode: VNode;

  get styleHref() {
    const scriptUrlOrigin = new URL(currentScript.getSource()).origin;
    return `${scriptUrlOrigin}/${env.isDevelopment ? 'dist' : 'assets'}/app.bundle.css`;
  }

  constructor(component: ComponentFactory<T>, props: T | null = null) {
    render(createElement('link', { rel: 'preload', href: this.styleHref, as: 'style' }), document.head);
    this.renderWidget = this.renderWidget.bind(this);
    this.element = createHtmlElement('div', { 'paf-root': '' });
    this.elementNode = createElement(component, props);
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
    const container = createElement('div', null, stylesElement, this.elementNode);
    render(container, shadowRoot);
  }

  private renderAsLegacy(stylesElement: VNode) {
    render(this.elementNode, this.element);
    render(stylesElement, document.head);
  }

  protected checkLoaded() {
    return document.readyState === 'complete';
  }
}
