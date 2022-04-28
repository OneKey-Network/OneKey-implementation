import { ComponentFactory, createElement, render, VNode } from 'preact';
import { createHtmlElement } from '../../utils/create-html-element';
import { env } from '../../config';
import { currentScript } from '@frontend/utils/current-script';

const cashedStyles: { [url: string]: string } = {};
const getCashedStyles = async (stylesUrl: string) => {
  if (!cashedStyles[stylesUrl]) {
    const response = await fetch(stylesUrl);
    cashedStyles[stylesUrl] = await response.text();
  }
  return cashedStyles[stylesUrl];
};

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
    const stylesElement = createHtmlElement('style');
    stylesElement.appendChild(document.createTextNode(await getCashedStyles(`${this.scriptPath}/app.bundle.css`)));
    currentScript.getParent().appendChild(this.element);

    // Add shadow root if the browser supports it
    if (document.head.attachShadow) {
      this.renderAsShadow(stylesElement);
    } else {
      this.renderAsLegacy(stylesElement);
    }
  }

  remove() {
    this.element.remove();
  }

  private renderAsShadow(stylesElement: HTMLElement) {
    const shadowRoot = this.element.attachShadow({ mode: 'open' });
    shadowRoot.appendChild(stylesElement);
    render(this.elementNode, shadowRoot);
  }

  private renderAsLegacy(stylesElement: HTMLElement) {
    document.head.appendChild(stylesElement);
    render(this.elementNode, this.element);
  }

  /* we need to inject font-face into head, because it doesn't apply in the shadow DOM*/
  private injectFontFaces() {
    const styleElement = createHtmlElement('style');
    styleElement.appendChild(document.createTextNode(fontFaces(this.scriptPath)));
    document.head.appendChild(styleElement);
  }
}
