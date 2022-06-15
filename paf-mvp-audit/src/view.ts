/**
 * Resources used by the controller for HTML views and CSS.
 */
import css from './css/ok-ui.css';
import auditTemplate from './html/containers/audit.html';
import buttonTemplate from './html/components/button.html';
import { ILocale } from '@core/ui/ILocale';
import { IView } from '@core/ui/binding';
import { Log } from '@core/log';
import okResponse from './html/components/okResponse.html';
import noResponse from './html/components/noresponse.html';
import { Model } from './model';

export class View implements IView {
  // The shadow root for the UI.
  public root: ShadowRoot = null;

  // The outer container for the UI.
  private outerContainer: HTMLElement = null;

  // The element that contains the advert. Used to add the UI components to the DOM around the advert.
  private readonly advert: HTMLElement;

  // The container element for the UI, or null if the UI has not yet been added to the DOM.
  private auditContainer: HTMLDivElement | null = null;

  // Log used to output status messages.
  private readonly log: Log;

  // The locale that the UI should adopt.
  public readonly locale: ILocale;

  /**
   * Constructs a new instance of View.
   * @param advert element the module relates to
   * @param locale the language file to use with the UI
   */
  constructor(advert: HTMLElement, locale: ILocale, log: Log) {
    this.advert = advert;
    this.locale = locale;
    this.log = log;
  }

  /**
   * Displays the audit log card ready for the providers to be added.
   */
  public display(card: string) {
    this.setContainerCard(card);
  }

  /**
   * Adds the good data to the view.
   * @param element that the component should be added to
   * @param data data to be displayed by the component
   */
  public addOkResponse(element: HTMLDivElement, data: unknown) {
    View.addComponent(element, okResponse, data);
  }

  /**
   * Adds the no response data to the view.
   * @param element that the component should be added to
   * @param data data to be displayed by the component
   */
  public addNoResponse(element: HTMLDivElement, data: unknown) {
    View.addComponent(element, noResponse, data);
  }

  /**
   * Used to get an array of action elements from the current view.
   * @returns array of HTMLElements that can have events added to them
   */
  public getActionElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    View.addElements(elements, this.auditContainer.getElementsByTagName('button'));
    View.addElements(elements, this.auditContainer.getElementsByTagName('a'));
    return elements;
  }

  /**
   * Modifies the view temporarily to trigger the download of the audit log.
   * @param model with the audit log to download.
   */
  public download(model: Model): void {
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(model.jsonContent));
    downloadAnchor.setAttribute('download', model.jsonFileName);
    this.auditContainer.appendChild(downloadAnchor); // required for firefox
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Adds element from the other collection to the array.
   * @param array
   * @param other
   */
  private static addElements(array: HTMLElement[], other: HTMLCollectionOf<HTMLElement>) {
    for (let i = 0; i < other.length; i++) {
      array.push(other[i]);
    }
  }

  /**
   * Sets the HTML in the container for the template.
   */
  private setContainerCard(card: string): void {
    let template: Language;
    switch (card) {
      case 'audit':
        template = auditTemplate;
        break;
      case 'button':
        template = buttonTemplate;
        break;
      default:
        throw `Card '${card}' is not known`;
    }
    this.getContainer().innerHTML = template(this.locale);
  }

  /**
   * Returns the container for the entire UI adding it if it does not already exist.
   * @returns
   */
  private getContainer(): HTMLDivElement {
    if (this.auditContainer === null) {
      this.addContainer();
    }
    return this.auditContainer;
  }

  /**
   * Adds the CSS, javascript, and the container div for the UI elements.
   */
  private addContainer() {
    // Create an outer container to add the shadow root and UI components to.
    this.outerContainer = <HTMLElement>this.advert.appendChild(document.createElement('div'));

    // Create the CSS style element.
    const style = <HTMLStyleElement>document.createElement('style');
    // TODO: Fix CSS include to remove the magic character at the beginning of the CSS file.
    style.innerHTML = (<string>css).trim();

    // Create the new container with the pop up template.
    this.auditContainer = document.createElement('div');
    this.auditContainer.classList.add('ok-ui');

    // If the pop up is valid then append the container and store a reference to the pop up element.
    this.root = this.outerContainer.attachShadow({ mode: 'closed' });
    this.root.appendChild(style);
    this.root.appendChild(this.auditContainer);
  }

  private static addComponent(element: HTMLDivElement, component: Component, data: unknown) {
    const item = <HTMLParagraphElement>document.createElement('div');
    item.className = 'ok-ui-provider';
    item.innerHTML = component(data);
    element.appendChild(item);
  }
}
