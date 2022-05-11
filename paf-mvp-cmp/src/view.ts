/**
 * Resources used by the controller for HTML views and CSS.
 */
import css from './css/ok-ui.css';
import introTemplate from './html/cards/intro.html';
import aboutTemplate from './html/cards/about.html';
import settingsTemplate from './html/cards/settings.html';
import customizeTemplate from './html/cards/customize.html';
import itemTemplate from './html/components/customize.html';
import snackbarTemplate from './html/cards/snackbar.html';
import popupTemplate from './html/containers/popup.html';
import { Config } from './config';
import { IView } from '@core/ui/binding';
import { ILocale } from './ILocale.js';
import { Tooltip } from './tooltip.js';

export class View implements IView {
  // The shadow root for the UI.
  public root: ShadowRoot = null;

  // The current card being displayed if any.
  public currentCard: string = null;

  // The element that contains this script. Used to add the UI components to the DOM.
  private readonly script: HTMLOrSVGScriptElement;

  // The container element for the UI, or null if the UI has not yet been added to the DOM.
  private cardContainer: HTMLDivElement = null;

  // The outer container for the UI.
  private outerContainer: HTMLElement = null;

  // The locale that the UI should adopt.
  private readonly locale: ILocale;

  // The options provided to the controller.
  private readonly config: Config;

  /**
   * Constructs a new instance of View
   * @param script element this method is contained within
   * @param locale the language text to use with the UI
   * @param config the configuration for the controller
   */
  constructor(script: HTMLOrSVGScriptElement, locale: ILocale, config: Config) {
    this.script = script;
    this.config = config;
    this.locale = <ILocale>locale;
  }

  /**
   * Set the card. Common tokens in square brackets [] are replaced with the values from the configuration after the
   * language text has been applied.
   * @remarks
   * If the card is the snackbar then a timer to automatically hide it is provided.
   * @param card the name of the card to display, or null if the default card should be displayed.
   */
  public setCard(card: string) {
    this.setContainerCard(card);
  }

  /**
   * Hides the popup UI but does not remove it from the DOM.
   */
  public hidePopup() {
    this.getCardContainer().style.display = 'none';
    this.getPopUp()?.classList.remove('ok-ui-popup--open');
  }

  /**
   * Displays the popup UI.
   */
  public showPopup() {
    this.getCardContainer().style.display = '';
    this.getPopUp()?.classList.add('ok-ui-popup--open');
  }

  /**
   * Used to get an array of action elements from the current view.
   * @returns array of HTMLElements that can have events added to them
   */
  public getActionElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    View.addElements(elements, this.cardContainer.getElementsByTagName('button'));
    View.addElements(elements, this.cardContainer.getElementsByTagName('a'));
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
    this.getCardContainer().innerHTML = this.config.replace(html);

    // Bind the tooltips to any tooltip controls in the new cards added.
    Tooltip.bind(this.root);
    this.currentCard = card;
  }

  /**
   * Adds all the HTML for the customize items to customizeHtml property.
   */
  private setLocaleCustomizeHtml() {
    if (this.locale.customizeHtml === undefined) {
      const length = Math.min(this.locale.customizeLabels.length, this.locale.customizeTips.length);
      let items = '';
      for (let i = 0; i < length; i++) {
        items += itemTemplate({
          Index: i + 1,
          Label: this.locale.customizeLabels[i],
          Tip: this.locale.customizeTips[i],
        });
      }
      this.locale.customizeHtml = items;
    }
  }

  /**
   * Gets the template for the card from the enumeration.
   * @param card name of the card which corresponds to the ./views file name
   * @returns the HTML string that represents the card
   */
  private getTemplate(card: string): Card {
    switch (card) {
      case 'about':
        return aboutTemplate;
      case 'intro':
        return introTemplate;
      case 'settings':
        return settingsTemplate;
      case 'customize':
        // Ensures that the repetitive HTML is added for each option.
        this.setLocaleCustomizeHtml();
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
  private getTemplateContainer(card: string): Container {
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
    const popups = this.getCardContainer().getElementsByClassName('ok-ui-popup');
    if (popups !== null && popups.length > 0) {
      return <HTMLDivElement>popups[0];
    }
    return null;
  }

  /**
   * Returns the container for the cards adding it if it does not already exist.
   * @returns
   */
  private getCardContainer(): HTMLDivElement {
    if (this.cardContainer === null) {
      this.addContainer();
    }
    return this.cardContainer;
  }

  /**
   * Adds the CSS, javascript, and the container div for the UI elements.
   */
  private addContainer() {
    // Create an outer container to add the shadow root and UI components to.
    this.outerContainer = this.script.parentElement.appendChild(document.createElement('div'));

    // Create the CSS style element.
    const style = <HTMLStyleElement>document.createElement('style');
    // TODO: Fix CSS include to remove the magic character at the beginning of the CSS file.
    style.innerHTML = (<string>css).trim();

    // Create the new container with the templates.
    this.cardContainer = document.createElement('div');
    this.cardContainer.className = 'ok-ui';

    // Append the style and container with a shadow root for encapsulation.
    this.root = this.outerContainer.attachShadow({ mode: 'closed' });
    this.root.appendChild(style);
    this.root.appendChild(this.cardContainer);
  }
}
