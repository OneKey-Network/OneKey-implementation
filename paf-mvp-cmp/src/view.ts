/**
 * Resources used by the controller for HTML views and CSS.
 * TODO: fix the warning associated with can't find module or type.
 */
import logoSvg from './images/OneKey.svg';
import logoCenterSvg from './images/OneKeyCenter.svg';
import tooltipsJs from './scripts/tooltips.js';
import css from './css/ok-ui.css';
import introTemplate from './views/intro.html';
import aboutTemplate from './views/about.html';
import settingsTemplate from './views/settings.html';
import customizeTemplate from './views/customize.html';
import snackbarTemplate from './views/snackbar.html';
import popupTemplate from './views/popup.html';
import { Locale } from './locale';
import { Config } from './config';

/**
 * Type to use with HTML views that support locale language customization.
 */
type ViewTemplate = (l: Locale) => string;

/**
 * Type to use with HTML containers that take a single string for the content.
 */
type ContainerTemplate = (s: string) => string;

export class View {
  // The element that contains this script. Used to add the UI components to the DOM.
  private readonly script: HTMLOrSVGScriptElement;

  // The container element for the UI, or null if the UI has not yet been added to the DOM.
  private container: HTMLDivElement | null = null;

  // The locale that the UI should adopt.
  public readonly locale: Locale;

  // The options provided to the controller.
  public readonly config: Config;

  // Timer used to hide the snackbar.
  private countDown: NodeJS.Timer;

  /**
   * Constructs a new instance of Controller.
   * @param locale the language file to use with the UI
   * @param config the configuration for the controller
   */
  constructor(locale: Locale, config: Config) {
    this.script = document.currentScript;
    this.config = config;

    // Setup the locale with the text and images to use.
    this.locale = locale;
    this.locale.Logo = logoSvg;
    this.locale.LogoCenter = logoCenterSvg;
  }

  /**
   * Set the card. Common tokens in square brackets [] are replaced with the values from the configuration after the
   * language text has been applied.
   * @remarks
   * If the card is the snackbar then a timer to automatically hide it is provided.
   * @param card the name of the card to display, or null if the default card should be displayed.
   */
  public setCard(card: string) {
    this.stopSnackbarHide();
    this.setContainerCard(card);
    if ('snackbar' === card) {
      this.countDown = setInterval(() => this.hidePopup(), this.config.snackbarTimeoutMs);
      document.body.addEventListener('click', (e) => this.hideSnackbar(e));
    }
  }

  /**
   * Hides the snackbar if display. Checks that the element provided is not part of this UI before hiding.
   * @param t target that has triggered the event to hide the snackbar
   */
  private hideSnackbar(t: MouseEvent) {
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
    this.stopSnackbarHide();
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
   * Used to remove the snackbar hide logic if the user wants to interact.
   */
  private stopSnackbarHide() {
    clearInterval(this.countDown);
    document.body.removeEventListener('click', (t) => this.hideSnackbar(t));
  }

  /**
   * Sets the HTML in the container appropriate for the view card provided.
   * @param card Card to display
   */
  private setContainerCard(card: string): void {
    let html: string;
    const template = this.getTemplate(card);
    const container = this.getTemplateContainer(card);
    if (container !== null) {
      html = container(template(this.locale));
    } else {
      html = template(this.locale);
    }
    this.getContainer().innerHTML = this.config.replace(html);
  }

  /**
   * Gets the template for the card from the enumeration.
   * @param card name of the card which corresponds to the ./views file name
   * @returns the HTML string that represents the card
   */
  private getTemplate(card: string): ViewTemplate {
    switch (card) {
      case 'about':
        return aboutTemplate;
      case 'intro':
        return introTemplate;
      case 'settings':
        return settingsTemplate;
      case 'customize':
        return customizeTemplate;
      case 'snackbar':
        return snackbarTemplate;
      default:
        if (this.config.displayIntro) {
          return introTemplate;
        }
        return settingsTemplate;
    }
  }

  /**
   * Gets the container, if any, that should be used for the card.
   * @param card to be displayed
   * @returns template that will be the container
   */
  private getTemplateContainer(card: string): ContainerTemplate {
    switch (card) {
      case 'snackbar':
        return null;
      default:
        return popupTemplate;
    }
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

    // Add a new javascript element for the tooltips.
    const tooltipsScript = <HTMLScriptElement>document.createElement('script');
    tooltipsScript.type = 'text/javascript';
    tooltipsScript.innerHTML = tooltipsJs;

    // Create the new container with the pop up template.
    this.container = document.createElement('div');
    this.container.classList.add('ok-ui');

    // If the pop up is valid then append the container and store a reference to the pop up element.
    parent.appendChild(style);
    parent.appendChild(tooltipsScript);
    parent.appendChild(this.container);
  }
}
