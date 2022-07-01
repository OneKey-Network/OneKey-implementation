/**
 * Resources used by the controller for HTML views and CSS.
 */
import css from './css/ok-ui.css';
import advertTemplate from './html/cards/advert.html';
import dataTemplate from './html/cards/data.html';
import downloadTemplate from './html/cards/download.html';
import participantsTemplate from './html/cards/participants.html';
import auditTemplate from './html/containers/audit.html';
import buttonTemplate from './html/components/button.html';
import { ILocale } from '@core/ui/ILocale';
import { IView } from '@core/ui/binding';
import { Log } from '@core/log';
import { Model } from './model';

export class View implements IView {
  // The shadow root for the UI.
  public root: ShadowRoot = null;

  // The outer container for the UI.
  private outerContainer: HTMLElement | null = null;

  // The inner container under the root element.
  private innerContainer: HTMLDivElement | null = null;

  // The child of the audit modal div container.
  private popupContainer: HTMLDivElement | null = null;

  // The container for the cards within the modal dialog.
  private cardContainer: HTMLDivElement | null = null;

  // The container for the button that opens the audit modal dialog.
  private buttonContainer: HTMLDivElement | null = null;

  // The list of navigation elements.
  private navigationList: HTMLUListElement | null = null;

  // The width of the advert before any module changes.
  private readonly advertWidth: number;

  /**
   * Constructs a new instance of View.
   * @param advert element the module relates to
   * @param locale the language file to use with the UI
   * @param log
   */
  constructor(private readonly advert: HTMLElement, public readonly locale: ILocale, private readonly log: Log) {
    this.advertWidth = advert.clientWidth;
  }

  /**
   * Adds the initial CSS, javascript, and the container div for the UI elements.
   */
  public initView() {
    // Create an outer container to add the shadow root and UI components to.
    this.outerContainer = <HTMLElement>this.advert.appendChild(document.createElement('div'));

    // Create the CSS style element.
    const style = <HTMLStyleElement>document.createElement('style');
    // TODO: Fix CSS include to remove the magic character at the beginning of the CSS file.
    style.innerHTML = (<string>css).trim();

    // Create the new container for the button and add the HTML.
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.classList.add('ok-ui');
    this.buttonContainer.innerHTML = buttonTemplate(this.locale);

    // If the pop up is valid then append the container and store a reference to the pop up element.
    this.root = this.outerContainer.attachShadow({ mode: 'closed' });
    this.root.appendChild(style);
    this.root.appendChild(this.buttonContainer);
  }

  /**
   * Displays the audit log card ready for the providers to be added. If the advert is wide then switch to landscape
   * mode to display the advert card if present.
   */
  public display(card: string) {
    this.initPopUp();
    this.setCard(card);
    this.setNavigation(card);
    this.popupContainer.classList.add('ok-ui-popup--open');

    // If this is the advert card and the width of the advert requires landscape layout then add the class name to the
    // card content.
    if (card === 'advert' && this.advertWidth > 320) {
      const wrappers = this.cardContainer.getElementsByClassName('ok-ui-advert-wrapper');
      for (let i = 0; i < wrappers.length; i++) {
        wrappers[i].classList.add('ok-ui-advert-wrapper--landscape');
      }
    }
  }

  /**
   * Hides the audit log view container.
   */
  public hide() {
    this.initPopUp();
    this.popupContainer.classList.remove('ok-ui-popup--open');
  }

  /**
   * Used to get an array of action elements from the current view.
   * @returns array of HTMLElements that can have events added to them
   */
  public getActionElements(): HTMLElement[] {
    this.initPopUp();
    const elements: HTMLElement[] = [];
    View.addElements(elements, this.root.querySelectorAll('button'));
    View.addElements(elements, this.root.querySelectorAll('a'));
    View.addElements(elements, this.root.querySelectorAll('li.ok-ui-navigation__item'));
    return elements;
  }

  /**
   * Modifies the view temporarily to trigger the download of the audit log.
   * @param model with the audit log to download.
   */
  public download(model: Model): void {
    this.initPopUp();
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(model.jsonContent));
    downloadAnchor.setAttribute('download', model.jsonFileName);
    this.innerContainer.appendChild(downloadAnchor); // required for firefox
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  /**
   * Adds element from the other collection to the array.
   * @param array
   * @param other
   */
  private static addElements(array: HTMLElement[], other: NodeListOf<HTMLElement>) {
    for (let i = 0; i < other.length; i++) {
      array.push(other[i]);
    }
  }

  /**
   * Sets the HTML in the container for the template.
   */
  private setCard(card: string): void {
    let template: Language;
    switch (card) {
      case 'advert':
        template = advertTemplate;
        break;
      case 'data':
        template = dataTemplate;
        break;
      case 'download':
        template = downloadTemplate;
        break;
      case 'participants':
        template = participantsTemplate;
        break;
      default:
        throw `Card '${card}' is not known`;
    }
    this.cardContainer.innerHTML = template(this.locale).replace('[BrandName]', <string>this.locale.brandName);
  }

  /**
   * Sets the navigation to the provided card.
   * @remarks
   * @param card that
   */
  private setNavigation(card: string) {
    const selectedClass = 'ok-ui-navigation__item--selected';
    for (let index = 0; index < this.navigationList.children.length; index++) {
      const child = this.navigationList.children[index];
      if (child instanceof HTMLLIElement) {
        if (child.getAttribute('data-card') === card) {
          child.classList.add(selectedClass);
        } else {
          child.classList.remove(selectedClass);
        }
      }
    }
  }

  /**
   * Ensures the popup has been initialized.
   */
  private initPopUp() {
    if (this.innerContainer === null) {
      this.addPopUp();
    }
  }

  /**
   * Adds the popup container and sub containers to the DOM under the root.
   */
  private addPopUp() {
    // Create the new container with the audit pop up template.
    this.innerContainer = document.createElement('div');
    this.innerContainer.classList.add('ok-ui');
    this.innerContainer.innerHTML = auditTemplate(this.locale);

    // Add the logos provided at construction to the controller to the header of the pop up.
    if (this.locale.logoUrls) {
      const logos = this.innerContainer.getElementsByClassName('ok-ui-card__header-logos');
      for (let i = 0; i < logos.length; i++) {
        (<string[]>this.locale.logoUrls).forEach((u) => {
          // TODO: Update pattern library to avoid the need to style the li element.
          logos[i].innerHTML += `<li style="min-width: 100px; max-width: 150px;"><img src='${u}'/><li>`;
        });
      }
    }
    this.root.appendChild(this.innerContainer);

    // Find the card body from the audit container which is where the cards will be set.
    this.cardContainer = <HTMLDivElement>this.getAuditElementByClassName('ok-ui-card__body');

    // Find the navigation element within the audit container.
    this.navigationList = <HTMLUListElement>this.getAuditElementByClassName('ok-ui-navigation__list');

    // Find the popup container that is used to open and close the container.
    this.popupContainer = <HTMLDivElement>this.getAuditElementByClassName('ok-ui-popup');
  }

  private getAuditElementByClassName(className: string): Element {
    const elements = this.innerContainer.getElementsByClassName(className);
    if (elements !== null && elements.length > 0) {
      return elements[0];
    } else {
      throw `No element with class '${className}' could be found`;
    }
  }
}
