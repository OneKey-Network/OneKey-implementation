import { ComponentFactory, createElement, render, VNode } from 'preact';
import { createHtmlElement } from '../../utils/create-html-element';
import { env } from '../../config';
import { currentScript } from '@onekey/frontend/utils/current-script';

const fontFaces = (domain: string) => `@font-face {
  font-family: 'SF Pro Display';
  src: url('${domain}/fonts/SFProDisplay-Regular.woff2') format('woff2'),
  url('${domain}/fonts/SFProDisplay-Regular.woff') format('woff');
  font-weight: normal;
}

@font-face {
  font-family: 'SF Pro Display';
  src: url('${domain}/fonts/SFProDisplay-Bold.woff2') format('woff2'),
  url('${domain}/fonts/SFProDisplay-Bold.woff') format('woff');
  font-weight: bold;
}`;

export abstract class BasePafWidget<T> {
  private readonly element: HTMLElement;
  private readonly elementNode: VNode;

  get scriptPath() {
    return `${new URL(currentScript.getSource()).origin}/${env.isDevelopment ? 'dist' : 'assets'}`;
  }

  constructor(component: ComponentFactory<T>, props: T | null = null) {
    this.injectFontFaces();
    this.element = createHtmlElement('div', { 'paf-root': '' });
    this.elementNode = createElement(component, props);
  }

  async render() {
    const stylesElement = document.getElementById('PAF-styles');
    currentScript.getParent().appendChild(this.element);

    // Add shadow root if the browser supports it
    if (document.head.attachShadow) {
      this.renderAsShadow(stylesElement.cloneNode(true));
    } else {
      this.renderAsLegacy();
    }
  }

  remove() {
    this.element.remove();
  }

  private renderAsShadow(stylesElement: Node) {
    const shadowRoot = this.element.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(stylesElement);
    render(this.elementNode, shadowRoot);
  }

  private renderAsLegacy() {
    render(this.elementNode, this.element);
  }

  /* we need to inject font-face into head, because it doesn't apply in the shadow DOM*/
  private injectFontFaces() {
    const styleElement = createHtmlElement('style');
    styleElement.appendChild(document.createTextNode(fontFaces(this.scriptPath)));
    document.head.appendChild(styleElement);
  }
}
