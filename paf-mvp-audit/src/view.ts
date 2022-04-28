/**
 * Resources used by the controller for HTML views and CSS.
 * TODO: fix the warning associated with can't find module or type.
 */
import logoSvg from './images/OneKey.svg';
import css from './css/ok-ui.css';
import auditTemplate from './views/audit.html';
import { Locale } from './locale';

/**
 * Type to use with HTML views that support locale language customization.
 */
type ViewTemplate = (l: Locale) => string;

export class View {
  // The element that contains this script. Used to add the UI components to the DOM.
  private readonly script: HTMLOrSVGScriptElement;

  // The container element for the UI, or null if the UI has not yet been added to the DOM.
  private container: HTMLDivElement | null = null;

  // The locale that the UI should adopt.
  public readonly locale: Locale;

  /**
   * Constructs a new instance of Controller.
   * @param locale the language file to use with the UI
   */
  constructor(locale: Locale) {
    this.script = document.currentScript;

    // Setup the locale with the text and images to use.
    this.locale = locale;
    this.locale.Logo = logoSvg;
  }

  /**
   * Displays the audit log card ready for the providers to be added.
   */
  public display() {
    this.setContainerCard();
    document.body.addEventListener('click', (t) => this.hideAudit(t));
  }

  /**
   * Hides the audit if display. Checks that the element provided is not part of this UI before hiding.
   * @param t target that has triggered the event to hide the audit
   */
  private hideAudit(t: MouseEvent) {
    let p = <HTMLElement>t.target;
    while (p !== null) {
      for (let i = 0; i < p.classList.length; i++) {
        const className = p.classList[i];
        if (className.startsWith('ok-ui')) {
          return;
        }
      }
      p = p.parentElement;
    }
    this.hidePopup();
  }

  /**
   * Hides the popup UI but does not remove it from the DOM.
   */
  public hidePopup() {
    document.body.removeEventListener('click', (t) => this.hideAudit(t));
    this.getContainer().style.display = 'none';
    this.getPopUp()?.classList.remove('ok-ui-popup--open');
  }

  /**
   * Displays the popup UI.
   */
  public showPopup() {
    this.getContainer().style.display = '';
    this.getPopUp()?.classList.add('ok-ui-popup--open');
  }

  /**
   * Used to get an array of action elements from the current view.
   * @returns array of HTMLElements that can have events added to them
   */
  public getActionElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    View.addElements(elements, this.container.getElementsByTagName('button'));
    View.addElements(elements, this.container.getElementsByTagName('a'));
    return elements;
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
   * Sets the HTML in the container for the audit template.
   */
  private setContainerCard(): void {
    const template = <ViewTemplate>auditTemplate;
    this.getContainer().innerHTML = template(this.locale);
  }

  /**
   * Gets the pop up element within the container.
   * @returns
   */
  private getPopUp(): HTMLDivElement {
    const popups = this.getContainer().getElementsByClassName('ok-ui-popup');
    if (popups !== null && popups.length > 0) {
      return <HTMLDivElement>popups[0];
    }
    return null;
  }

  /**
   * Returns the container for the entire UI adding it if it does not already exist.
   * @returns
   */
  private getContainer(): HTMLDivElement {
    if (this.container === null) {
      this.addContainer();
    }
    return this.container;
  }

  /**
   * Adds the CSS, javascript, and the container div for the UI elements.
   */
  private addContainer() {
    const parent = this.script.parentElement;

    // Create the CSS style element.
    const style = <HTMLStyleElement>document.createElement('style');
    // TODO: Fix CSS include to remove the magic character at the beginning of the CSS file.
    style.innerHTML = (<string>css).trim();

    // Create the new container with the pop up template.
    this.container = document.createElement('div');
    this.container.classList.add('ok-ui');

    // If the pop up is valid then append the container and store a reference to the pop up element.
    parent.appendChild(style);
    parent.appendChild(this.container);
  }
}
